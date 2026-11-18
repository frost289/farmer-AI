"""Fine-tune MobileNetV3 on crop photos and export the ONNX model the service loads.

Dataset layout (torchvision ImageFolder). Folder names MUST be labels from
docs/label-taxonomy.json:

    data/train/<label>/*.jpg
    data/val/<label>/*.jpg        optional; without it --val-split carves one out of train

Run (Colab GPU is fine; CPU works for small sets):

    pip install -r requirements-train.txt
    python training/train_classifier.py --data data --out models --version v0.2.0

Outputs in --out: classifier.onnx, labels.json (labels, preprocessing, temperature, metrics),
classifier.pt (checkpoint). All three are git-ignored: never commit weights.

Confidence is calibrated with temperature scaling on the validation set, so the api's
0.5 "low_confidence" threshold means something.
"""

import argparse
import json
import random
from datetime import date
from pathlib import Path

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import DataLoader, Subset, WeightedRandomSampler
from torchvision import datasets, models, transforms

MEAN = [0.485, 0.456, 0.406]
STD = [0.229, 0.224, 0.225]
TAXONOMY_PATH = Path(__file__).resolve().parents[1] / "app" / "taxonomy.json"


def parse_args():
    p = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    p.add_argument("--data", type=Path, required=True)
    p.add_argument("--out", type=Path, default=Path("models"))
    p.add_argument("--version", default="v0.2.0")
    p.add_argument("--img-size", type=int, default=224)
    p.add_argument("--epochs", type=int, default=15)
    p.add_argument(
        "--warmup-epochs", type=int, default=2, help="epochs with the backbone frozen"
    )
    p.add_argument("--batch-size", type=int, default=32)
    p.add_argument("--lr", type=float, default=3e-4)
    p.add_argument("--val-split", type=float, default=0.15)
    p.add_argument("--workers", type=int, default=2)
    p.add_argument("--seed", type=int, default=42)
    return p.parse_args()


def seed_everything(seed: int) -> None:
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)


def transforms_for(size: int):
    # Field photos vary in light, angle and background: augment for that.
    train = transforms.Compose(
        [
            transforms.RandomResizedCrop((size, size), scale=(0.6, 1.0)),
            transforms.RandomHorizontalFlip(),
            transforms.RandomVerticalFlip(),
            transforms.RandomRotation(30),
            transforms.ColorJitter(
                brightness=0.3, contrast=0.3, saturation=0.2, hue=0.02
            ),
            transforms.ToTensor(),
            transforms.Normalize(MEAN, STD),
        ]
    )
    # Must match app/services/classifier.py: plain resize to size x size, no crop.
    evaluate = transforms.Compose(
        [
            transforms.Resize((size, size)),
            transforms.ToTensor(),
            transforms.Normalize(MEAN, STD),
        ]
    )
    return train, evaluate


def load_datasets(args):
    train_tf, eval_tf = transforms_for(args.img_size)
    train_dir, val_dir = args.data / "train", args.data / "val"
    if not train_dir.is_dir():
        raise SystemExit(f"missing {train_dir}")
    train_full = datasets.ImageFolder(train_dir, train_tf)
    if val_dir.is_dir():
        val_set = datasets.ImageFolder(val_dir, eval_tf)
        if val_set.classes != train_full.classes:
            raise SystemExit("train and val must contain the same class folders")
        return train_full, val_set, train_full.classes
    # Stratified split. Warning: if photos of the same plant are in several files, split by
    # plant/source yourself and provide data/val, or the score will be optimistic.
    eval_full = datasets.ImageFolder(train_dir, eval_tf)
    rng = np.random.default_rng(args.seed)
    targets = np.array(train_full.targets)
    val_idx = []
    for cls in range(len(train_full.classes)):
        idx = rng.permutation(np.where(targets == cls)[0])
        val_idx.extend(idx[: max(1, int(len(idx) * args.val_split))].tolist())
    train_idx = sorted(set(range(len(targets))) - set(val_idx))
    return (
        Subset(train_full, train_idx),
        Subset(eval_full, sorted(val_idx)),
        train_full.classes,
    )


def check_taxonomy(classes: list[str]) -> None:
    known = {
        item["label"]
        for item in json.loads(TAXONOMY_PATH.read_text(encoding="utf-8"))["labels"]
    }
    unknown = [c for c in classes if c not in known]
    if unknown:
        raise SystemExit(
            f"folders not in the label taxonomy: {unknown}. Fix names or edit the taxonomy first."
        )


def targets_of(dataset) -> list[int]:
    return (
        [dataset.dataset.targets[i] for i in dataset.indices]
        if isinstance(dataset, Subset)
        else dataset.targets
    )


def build_model(num_classes: int) -> nn.Module:
    model = models.mobilenet_v3_large(
        weights=models.MobileNet_V3_Large_Weights.IMAGENET1K_V2
    )
    model.classifier[3] = nn.Linear(model.classifier[3].in_features, num_classes)
    return model


def set_backbone_trainable(model: nn.Module, trainable: bool) -> None:
    for param in model.features.parameters():
        param.requires_grad = trainable


@torch.no_grad()
def collect_logits(model, loader, device):
    model.eval()
    logits, labels = [], []
    for x, y in loader:
        logits.append(model(x.to(device)).cpu())
        labels.append(y)
    return torch.cat(logits), torch.cat(labels)


def macro_f1(pred: np.ndarray, true: np.ndarray, n: int) -> tuple[float, list[dict]]:
    rows, f1s = [], []
    for c in range(n):
        tp = int(((pred == c) & (true == c)).sum())
        fp = int(((pred == c) & (true != c)).sum())
        fn = int(((pred != c) & (true == c)).sum())
        precision = tp / (tp + fp) if tp + fp else 0.0
        recall = tp / (tp + fn) if tp + fn else 0.0
        f1 = (
            2 * precision * recall / (precision + recall) if precision + recall else 0.0
        )
        rows.append(
            {
                "precision": round(precision, 4),
                "recall": round(recall, 4),
                "support": tp + fn,
            }
        )
        f1s.append(f1)
    return float(np.mean(f1s)), rows


def fit_temperature(logits: torch.Tensor, labels: torch.Tensor) -> float:
    log_t = torch.zeros(1, requires_grad=True)
    optimizer = torch.optim.LBFGS([log_t], lr=0.1, max_iter=100)

    def closure():
        optimizer.zero_grad()
        loss = F.cross_entropy(logits / log_t.exp(), labels)
        loss.backward()
        return loss

    optimizer.step(closure)
    return float(log_t.exp().clamp(0.05, 20.0))


def export_onnx(model: nn.Module, path: Path, size: int) -> None:
    model.eval().cpu()
    dummy = torch.randn(1, 3, size, size)
    kwargs = dict(
        input_names=["input"],
        output_names=["logits"],
        dynamic_axes={"input": {0: "batch"}, "logits": {0: "batch"}},
        opset_version=17,
    )
    try:
        torch.onnx.export(model, dummy, str(path), dynamo=False, **kwargs)
    except TypeError:  # older torch has no `dynamo` argument
        torch.onnx.export(model, dummy, str(path), **kwargs)
    import onnxruntime as ort

    session = ort.InferenceSession(str(path), providers=["CPUExecutionProvider"])
    onnx_out = session.run(None, {"input": dummy.numpy()})[0]
    torch_out = model(dummy).detach().numpy()
    if np.abs(onnx_out - torch_out).max() > 1e-3:
        raise SystemExit("ONNX output differs from PyTorch output: export is wrong")


def main():
    args = parse_args()
    seed_everything(args.seed)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    train_set, val_set, classes = load_datasets(args)
    check_taxonomy(classes)
    print(
        f"{len(classes)} classes, {len(train_set)} train / {len(val_set)} val images on {device}"
    )

    counts = np.bincount(targets_of(train_set), minlength=len(classes))
    sample_weights = [1.0 / max(counts[t], 1) for t in targets_of(train_set)]
    sampler = WeightedRandomSampler(
        sample_weights, num_samples=len(train_set), replacement=True
    )
    train_loader = DataLoader(
        train_set, batch_size=args.batch_size, sampler=sampler, num_workers=args.workers
    )
    val_loader = DataLoader(
        val_set, batch_size=args.batch_size, num_workers=args.workers
    )

    model = build_model(len(classes)).to(device)
    criterion = nn.CrossEntropyLoss(label_smoothing=0.1)
    best_f1, best_state = -1.0, None
    optimizer, scheduler = None, None

    for epoch in range(args.epochs):
        if epoch == 0 or epoch == args.warmup_epochs:
            warm = epoch < args.warmup_epochs
            set_backbone_trainable(model, not warm)
            lr = args.lr * (3 if warm else 1)
            optimizer = torch.optim.AdamW(
                [p for p in model.parameters() if p.requires_grad],
                lr=lr,
                weight_decay=1e-4,
            )
            remaining = (
                max(args.epochs - epoch, 1) if not warm else max(args.warmup_epochs, 1)
            )
            scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(
                optimizer, T_max=remaining
            )
        model.train()
        total = 0.0
        for x, y in train_loader:
            x, y = x.to(device), y.to(device)
            optimizer.zero_grad()
            loss = criterion(model(x), y)
            loss.backward()
            optimizer.step()
            total += loss.item() * len(y)
        scheduler.step()
        logits, labels = collect_logits(model, val_loader, device)
        pred = logits.argmax(1).numpy()
        f1, _ = macro_f1(pred, labels.numpy(), len(classes))
        acc = float((pred == labels.numpy()).mean())
        print(
            f"epoch {epoch + 1}/{args.epochs} loss {total / len(train_set):.4f} val acc {acc:.3f} macro-F1 {f1:.3f}"
        )
        if f1 > best_f1:
            best_f1, best_state = f1, {
                k: v.detach().cpu().clone() for k, v in model.state_dict().items()
            }

    model.load_state_dict(best_state)
    logits, labels = collect_logits(model, val_loader, device)
    temperature = fit_temperature(logits, labels)
    pred = logits.argmax(1).numpy()
    f1, per_class = macro_f1(pred, labels.numpy(), len(classes))
    acc = float((pred == labels.numpy()).mean())
    print(f"best: val acc {acc:.3f} macro-F1 {f1:.3f} temperature {temperature:.2f}")

    args.out.mkdir(parents=True, exist_ok=True)
    torch.save(
        {"state_dict": best_state, "classes": classes}, args.out / "classifier.pt"
    )
    export_onnx(model, args.out / "classifier.onnx", args.img_size)
    meta = {
        "version": args.version,
        "trained_on": date.today().isoformat(),
        "labels": classes,
        "input_size": args.img_size,
        "mean": MEAN,
        "std": STD,
        "temperature": round(temperature, 4),
        "metrics": {
            "val_accuracy": round(acc, 4),
            "val_macro_f1": round(f1, 4),
            "per_class": dict(zip(classes, per_class)),
        },
    }
    (args.out / "labels.json").write_text(json.dumps(meta, indent=2), encoding="utf-8")
    print(f"wrote {args.out}/classifier.onnx and labels.json")


if __name__ == "__main__":
    main()
