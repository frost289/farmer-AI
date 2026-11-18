"""Score the deployed classifier (models/classifier.onnx) on a labelled folder.

    python training/evaluate.py --data data/test [--crop maize]

Folder layout: <data>/<label>/*.jpg. Uses the same code path as the service, including crop
masking, so the numbers match what farmers get. Reports accuracy, per-class precision and
recall, the confusion matrix, and how often the api would show "low_confidence" (< 0.5).
"""

import argparse
import sys
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.services import classifier  # noqa: E402
from app.services.preprocess import load_image  # noqa: E402

LOW_CONFIDENCE = 0.5
EXTENSIONS = {".jpg", ".jpeg", ".png"}


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--data", type=Path, required=True)
    p.add_argument(
        "--crop",
        default=None,
        help="apply crop masking, as the api does when the farm crop is known",
    )
    args = p.parse_args()
    if classifier.get_model() is None:
        raise SystemExit("no trained model found in models/: train one first")

    pairs, low_conf, confident_ok, confident = [], 0, 0, 0
    for folder in sorted(d for d in args.data.iterdir() if d.is_dir()):
        for path in sorted(
            f for f in folder.iterdir() if f.suffix.lower() in EXTENSIONS
        ):
            data = path.read_bytes()
            top = classifier.classify(data, args.crop, load_image(data))[0]
            pairs.append((folder.name, top["label"]))
            if top["confidence"] < LOW_CONFIDENCE:
                low_conf += 1
            else:
                confident += 1
                confident_ok += top["label"] == folder.name
    if not pairs:
        raise SystemExit("no images found")

    labels = sorted({t for t, _ in pairs} | {p for _, p in pairs})
    confusion = Counter(pairs)
    print(
        f"images: {len(pairs)}   accuracy: {sum(t == p for t, p in pairs) / len(pairs):.3f}"
    )
    print(
        f"low_confidence rate: {low_conf / len(pairs):.1%}   accuracy when confident: "
        f"{(confident_ok / confident if confident else 0):.3f}\n"
    )
    print(f"{'label':28} {'precision':>9} {'recall':>7} {'n':>5}")
    for label in labels:
        tp = confusion[(label, label)]
        predicted = sum(v for (_, p), v in confusion.items() if p == label)
        actual = sum(v for (t, _), v in confusion.items() if t == label)
        print(
            f"{label:28} {tp / predicted if predicted else 0:9.3f} {tp / actual if actual else 0:7.3f} {actual:5d}"
        )
    print("\nconfusion (rows = true, cols = predicted):")
    print(" " * 28 + " ".join(f"{i:>4}" for i in range(len(labels))))
    for i, t in enumerate(labels):
        print(f"{i:>2} {t:25} " + " ".join(f"{confusion[(t, p)]:>4}" for p in labels))


if __name__ == "__main__":
    main()
