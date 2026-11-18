"""Turn downloaded public datasets into the train/val/test folders train_classifier.py reads.

    python training/prepare_data.py --dry-run     # show which folder becomes which label
    python training/prepare_data.py               # build data/train, data/val, data/test

Raw data lives in data/raw/<source dir> (see training/datasets.json for where to get each one).
What it does, in order:
  1. maps source folders (or a CSV) to labels from docs/label-taxonomy.json; the rest is skipped
  2. drops unreadable and tiny images and exact duplicates
  3. caps images per label and source, so one big dataset cannot drown the others
  4. groups near-identical photos (burst shots of one leaf) into clusters
  5. drops clusters whose photos carry different labels (label noise)
  6. splits whole clusters into train/val/test, so no leaf appears on both sides of a split
  7. writes resized JPEGs plus data/manifest.csv and data/report.json (provenance and counts)
Needs only Pillow and numpy.
"""

import argparse
import csv
import hashlib
import json
import random
import shutil
from collections import Counter, defaultdict
from pathlib import Path

import numpy as np
from PIL import Image, UnidentifiedImageError

HERE = Path(__file__).resolve().parent
TAXONOMY_PATH = HERE.parent / "app" / "taxonomy.json"
SOURCES_PATH = HERE / "datasets.json"
IMAGE_EXT = {".jpg", ".jpeg", ".png"}
MIN_SIDE = 100  # same floor as the service's quality check
MAX_SIDE = 512  # stored size; the model input is 224
HASH_CHUNKS = 8  # 64-bit hash in 8 chunks: pairs within distance 7 always share a chunk
_POPCOUNT = np.array([bin(i).count("1") for i in range(256)], dtype=np.uint8)


def taxonomy_labels() -> set[str]:
    return {
        item["label"]
        for item in json.loads(TAXONOMY_PATH.read_text(encoding="utf-8"))["labels"]
    }


def load_sources(path: Path = SOURCES_PATH) -> list[dict]:
    sources = json.loads(path.read_text(encoding="utf-8"))["sources"]
    known = taxonomy_labels()
    for source in sources:
        labels = [r["label"] for r in source.get("rules", [])] + list(
            source.get("csv", {}).get("values", {}).values()
        )
        unknown = [label for label in labels if label not in known]
        if unknown:
            raise SystemExit(f"{source['id']}: labels not in the taxonomy: {unknown}")
    return sources


# ---------- 1. collect -------------------------------------------------------------------------


def label_for_dir(rel_dir: str, rules: list[dict]) -> str | None:
    lowered = rel_dir.lower()
    for rule in rules:
        if any(token in lowered for token in rule["contains"]):
            return rule["label"]
    return None


def collect(source: dict, raw_root: Path) -> tuple[list[dict], Counter]:
    """Returns (records, folder_counts). folder_counts maps (folder, label or None) to image count."""
    root = raw_root / source["dir"]
    records, folders = [], Counter()
    if "csv" in source:
        cfg = source["csv"]
        with open(root / cfg["file"], newline="", encoding="utf-8") as handle:
            for row in csv.DictReader(handle):
                label = cfg["values"].get(str(row[cfg["label_col"]]))
                folders[(cfg["image_dir"], label)] += 1
                if label:
                    records.append(
                        {
                            "source": source["id"],
                            "path": root / cfg["image_dir"] / row[cfg["image_col"]],
                            "label": label,
                        }
                    )
        return records, folders
    for path in sorted(root.rglob("*")):
        if path.suffix.lower() not in IMAGE_EXT or not path.is_file():
            continue
        rel_dir = path.parent.relative_to(root).as_posix()
        label = label_for_dir(rel_dir, source["rules"])
        folders[(rel_dir or ".", label)] += 1
        if label:
            records.append({"source": source["id"], "path": path, "label": label})
    return records, folders


# ---------- 2. inspect and de-duplicate --------------------------------------------------------


def dhash(img: Image.Image) -> int:
    """64-bit difference hash: similar-looking photos get hashes a few bits apart."""
    small = np.asarray(img.convert("L").resize((9, 8), Image.LANCZOS), dtype=np.int16)
    bits = (small[:, 1:] > small[:, :-1]).flatten()
    return int("".join("1" if b else "0" for b in bits), 2)


def inspect(record: dict) -> dict | None:
    """Adds md5 and dhash. Returns None for unreadable or too small images."""
    try:
        data = record["path"].read_bytes()
        with Image.open(record["path"]) as img:
            img.load()
            if min(img.size) < MIN_SIDE:
                return None
            return {**record, "md5": hashlib.md5(data).hexdigest(), "dhash": dhash(img)}
    except (OSError, UnidentifiedImageError, ValueError):
        return None


# ---------- 3-5. near-duplicate clusters -------------------------------------------------------


def _popcount(x: np.ndarray) -> np.ndarray:
    return _POPCOUNT[x.view(np.uint8).reshape(*x.shape, 8)].sum(axis=-1)


def cluster_ids(hashes: list[int], max_dist: int) -> list[int]:
    """Union images whose hashes differ by at most max_dist bits. Returns a cluster id per image."""
    if not 0 <= max_dist < HASH_CHUNKS:
        raise ValueError(f"max_dist must be 0..{HASH_CHUNKS - 1}")
    parent = list(range(len(hashes)))

    def find(i: int) -> int:
        while parent[i] != i:
            parent[i] = parent[parent[i]]
            i = parent[i]
        return i

    arr = np.array(hashes, dtype=np.uint64)
    for chunk in range(HASH_CHUNKS):
        buckets = defaultdict(list)
        for index, value in enumerate(hashes):
            buckets[(value >> (8 * chunk)) & 0xFF].append(index)
        for members in buckets.values():
            if len(members) < 2:
                continue
            idx = np.array(members)
            vals = arr[idx]
            for start in range(0, len(idx), 256):  # row blocks keep memory small
                dist = _popcount(vals[start : start + 256, None] ^ vals[None, :])
                rows, cols = np.nonzero(dist <= max_dist)
                for r, c in zip(rows, cols):
                    a, b = find(int(idx[start + r])), find(int(idx[c]))
                    if a != b:
                        parent[a] = b
    return [find(i) for i in range(len(hashes))]


# ---------- 6. split by cluster ----------------------------------------------------------------


def split_clusters(
    clusters: list[list[int]], val_frac: float, test_frac: float, rng: random.Random
) -> dict[str, list[int]]:
    """Assign whole clusters to splits for ONE label, aiming at the given image fractions."""
    shuffled = clusters[:]
    rng.shuffle(shuffled)
    total = sum(len(c) for c in shuffled)
    targets = {"test": total * test_frac, "val": total * val_frac}
    out = {"train": [], "val": [], "test": []}
    for cluster in shuffled:
        if len(out["test"]) < targets["test"]:
            out["test"].extend(cluster)
        elif len(out["val"]) < targets["val"]:
            out["val"].extend(cluster)
        else:
            out["train"].extend(cluster)
    return out


# ---------- pipeline ---------------------------------------------------------------------------


def build(records: list[dict], args, rng: random.Random) -> tuple[list[dict], dict]:
    """records: inspected records. Returns (kept records with 'split', report dict)."""
    report = {
        "dropped_exact_duplicates": 0,
        "dropped_conflicting_clusters": 0,
        "dropped_by_cap": 0,
        "dropped_cluster_extras": 0,
    }

    seen, unique = set(), []
    for rec in records:
        if rec["md5"] in seen:
            report["dropped_exact_duplicates"] += 1
            continue
        seen.add(rec["md5"])
        unique.append(rec)

    by_group = defaultdict(list)
    for rec in unique:
        by_group[(rec["source"], rec["label"])].append(rec)
    capped = []
    for (source, _), group in sorted(by_group.items()):
        rng.shuffle(group)
        cap = args.max_per_label or args.caps.get(source, 4000)
        report["dropped_by_cap"] += max(0, len(group) - cap)
        capped.extend(group[:cap])

    ids = cluster_ids([r["dhash"] for r in capped], args.dup_distance) if capped else []
    members = defaultdict(list)
    for rec, cid in zip(capped, ids):
        members[cid].append(rec)

    by_label = defaultdict(list)  # label -> list of clusters (lists of records)
    for group in members.values():
        if len({r["label"] for r in group}) > 1:
            report["dropped_conflicting_clusters"] += 1
            continue
        rng.shuffle(group)
        report["dropped_cluster_extras"] += max(0, len(group) - args.max_per_cluster)
        by_label[group[0]["label"]].append(group[: args.max_per_cluster])

    kept = []
    for label, clusters in sorted(by_label.items()):
        flat = [rec for cluster in clusters for rec in cluster]
        index_clusters, cursor = [], 0
        for cluster in clusters:
            index_clusters.append(list(range(cursor, cursor + len(cluster))))
            cursor += len(cluster)
        for split, idxs in split_clusters(
            index_clusters, args.val, args.test, rng
        ).items():
            kept.extend({**flat[i], "split": split} for i in idxs)
    return kept, report


def write_dataset(kept: list[dict], out: Path) -> None:
    rows = []
    for rec in kept:
        name = f"{rec['source']}_{rec['md5'][:12]}.jpg"
        target = out / rec["split"] / rec["label"] / name
        target.parent.mkdir(parents=True, exist_ok=True)
        with Image.open(rec["path"]) as img:
            img = img.convert("RGB")
            img.thumbnail((MAX_SIDE, MAX_SIDE))
            img.save(target, format="JPEG", quality=90)
        rows.append(
            {
                "split": rec["split"],
                "label": rec["label"],
                "source": rec["source"],
                "file": f"{rec['split']}/{rec['label']}/{name}",
                "original": str(rec["path"]),
                "md5": rec["md5"],
            }
        )
    with open(out / "manifest.csv", "w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(
            handle, fieldnames=["split", "label", "source", "file", "original", "md5"]
        )
        writer.writeheader()
        writer.writerows(rows)


def summarise(kept: list[dict], report: dict) -> dict:
    counts = defaultdict(Counter)
    for rec in kept:
        counts[rec["label"]][rec["split"]] += 1
    report["counts"] = {label: dict(c) for label, c in sorted(counts.items())}
    report["by_source"] = {
        s: dict(Counter(r["label"] for r in kept if r["source"] == s))
        for s in sorted({r["source"] for r in kept})
    }
    warnings = []
    known = taxonomy_labels() - {"healthy"}
    for label in sorted(known - set(counts)):
        warnings.append(f"no images for '{label}': it cannot be learned yet")
    for label, c in counts.items():
        if c["train"] < 200:
            warnings.append(
                f"'{label}' has only {c['train']} training images: expect weak results"
            )
        if c["val"] < 20 or c["test"] < 20:
            warnings.append(
                f"'{label}' has few val/test images ({c['val']}/{c['test']}): scores will be noisy"
            )
    sizes = [c["train"] for c in counts.values() if c["train"]]
    if sizes and max(sizes) > 10 * min(sizes):
        warnings.append(
            "class sizes differ by more than 10x: training rebalances by sampling, but add data for the small ones"
        )
    report["warnings"] = warnings
    return report


def parse_args(argv=None):
    p = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    p.add_argument("--raw", type=Path, default=Path("data/raw"))
    p.add_argument("--out", type=Path, default=Path("data"))
    p.add_argument(
        "--sources",
        nargs="*",
        help="source ids to use (default: every enabled source whose folder exists)",
    )
    p.add_argument(
        "--max-per-label",
        type=int,
        default=0,
        help="override the per-source cap in datasets.json",
    )
    p.add_argument(
        "--dup-distance",
        type=int,
        default=6,
        help="max hash bits apart to call two photos near-duplicates (0-7)",
    )
    p.add_argument(
        "--max-per-cluster",
        type=int,
        default=5,
        help="keep at most this many photos of one near-duplicate cluster",
    )
    p.add_argument("--val", type=float, default=0.15)
    p.add_argument("--test", type=float, default=0.15)
    p.add_argument("--seed", type=int, default=42)
    p.add_argument(
        "--dry-run", action="store_true", help="only print the folder-to-label mapping"
    )
    p.add_argument(
        "--force",
        action="store_true",
        help="delete existing train/val/test folders first",
    )
    return p.parse_args(argv)


def main(argv=None):
    args = parse_args(argv)
    sources = [
        s
        for s in load_sources()
        if (s["id"] in args.sources if args.sources else s.get("enabled", True))
    ]
    args.caps = {s["id"]: s.get("max_per_label", 4000) for s in sources}
    rng = random.Random(args.seed)
    records = []
    for source in sources:
        if not (args.raw / source["dir"]).is_dir():
            print(
                f"[skip] {source['id']}: {args.raw / source['dir']} not found. Get it with: {source['get']}"
            )
            continue
        found, folders = collect(source, args.raw)
        print(f"\n{source['id']}: {len(found)} images mapped")
        for (folder, label), n in sorted(folders.items(), key=lambda kv: -kv[1])[:40]:
            print(f"   {folder[:60]:60} -> {label or 'SKIPPED':26} {n:6d}")
        records.extend(found)
    if args.dry_run or not records:
        raise SystemExit(
            0 if args.dry_run else "nothing to do: no source folders found"
        )

    exists = [d for d in ("train", "val", "test") if (args.out / d).exists()]
    if exists and not args.force:
        raise SystemExit(f"{args.out}/{exists} already exist. Use --force to rebuild.")
    for d in exists:
        shutil.rmtree(args.out / d)

    inspected = [r for r in (inspect(rec) for rec in records) if r]
    print(f"\n{len(records) - len(inspected)} unreadable or tiny images dropped")
    kept, report = build(inspected, args, rng)
    report["dropped_unreadable_or_tiny"] = len(records) - len(inspected)
    args.out.mkdir(parents=True, exist_ok=True)
    write_dataset(kept, args.out)
    report = summarise(kept, report)
    (args.out / "report.json").write_text(
        json.dumps(report, indent=2), encoding="utf-8"
    )
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
