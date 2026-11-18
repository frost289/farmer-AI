"""Tests for the dataset pipeline, using small synthetic images (no downloads)."""

import csv
import json
import random
from argparse import Namespace
from pathlib import Path

import numpy as np
from PIL import Image

from training import download_data, prepare_data

RNG = np.random.default_rng(0)


def make_image(path: Path, seed: int, noise: int = 0) -> Path:
    """Textured image whose look depends on the seed; noise > 0 gives a near-duplicate."""
    coarse = np.random.default_rng(seed).integers(
        0, 255, (16, 16, 3), dtype=np.uint8
    )  # smooth, photo-like
    base = np.asarray(
        Image.fromarray(coarse).resize((160, 160), Image.BICUBIC), dtype=np.float64
    )
    if noise:
        base = base + RNG.normal(0, noise, base.shape)
    path.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(np.clip(base, 0, 255).astype(np.uint8)).save(path, format="PNG")
    return path


def args(**over):
    base = dict(
        max_per_label=0,
        caps={"s": 1000},
        dup_distance=6,
        max_per_cluster=5,
        val=0.2,
        test=0.2,
    )
    return Namespace(**{**base, **over})


def test_folder_rules_map_and_skip():
    rules = [
        {"contains": ["healthy"], "label": "healthy"},
        {"contains": ["msv"], "label": "maize_streak_virus"},
    ]
    assert prepare_data.label_for_dir("Healthy2/img", rules) == "healthy"
    assert prepare_data.label_for_dir("msv1", rules) == "maize_streak_virus"
    assert prepare_data.label_for_dir("mln3", rules) is None


def test_shipped_sources_use_known_labels():
    sources = prepare_data.load_sources()  # raises if a label is not in the taxonomy
    assert {"karaagro_maize", "tanzania_maize", "cassava_uganda"} <= {
        s["id"] for s in sources
    }


def test_collect_from_folders_and_csv(tmp_path):
    root = tmp_path / "raw"
    make_image(root / "src" / "Healthy" / "a.png", 1)
    make_image(root / "src" / "mln" / "b.png", 2)
    source = {
        "id": "s",
        "dir": "src",
        "rules": [{"contains": ["healthy"], "label": "healthy"}],
    }
    records, folders = prepare_data.collect(source, root)
    assert [r["label"] for r in records] == ["healthy"]
    assert folders[("mln", None)] == 1

    make_image(root / "kg" / "imgs" / "c.png", 3)
    make_image(root / "kg" / "imgs" / "d.png", 4)
    with open(root / "kg" / "train.csv", "w", newline="") as handle:
        csv.writer(handle).writerows(
            [["image_id", "label"], ["c.png", "3"], ["d.png", "0"]]
        )
    cfg = {
        "file": "train.csv",
        "image_dir": "imgs",
        "image_col": "image_id",
        "label_col": "label",
        "values": {"3": "cassava_mosaic_disease"},
    }
    records, _ = prepare_data.collect({"id": "kg", "dir": "kg", "csv": cfg}, root)
    assert [(r["path"].name, r["label"]) for r in records] == [
        ("c.png", "cassava_mosaic_disease")
    ]


def test_unreadable_and_tiny_images_are_dropped(tmp_path):
    bad = tmp_path / "bad.png"
    bad.write_bytes(b"not an image")
    tiny = tmp_path / "tiny.png"
    Image.new("RGB", (40, 40)).save(tiny)
    good = make_image(tmp_path / "good.png", 1)
    for path, ok in ((bad, False), (tiny, False), (good, True)):
        assert (
            bool(
                prepare_data.inspect({"source": "s", "path": path, "label": "healthy"})
            )
            is ok
        )


def test_near_duplicates_cluster_and_different_images_do_not(tmp_path):
    originals = [make_image(tmp_path / f"o{i}.png", i) for i in range(3)]
    copy = make_image(tmp_path / "copy.png", 0, noise=4)
    hashes = [prepare_data.dhash(Image.open(p)) for p in [*originals, copy]]
    ids = prepare_data.cluster_ids(hashes, 6)
    assert ids[0] == ids[3]
    assert len({ids[0], ids[1], ids[2]}) == 3


def build_records(tmp_path, groups):
    """groups: list of (label, seed, n_copies)."""
    records = []
    for g, (label, seed, copies) in enumerate(groups):
        for c in range(copies):
            path = make_image(
                tmp_path / f"g{g}_{c}.png", seed, noise=0 if c == 0 else 3
            )
            rec = prepare_data.inspect({"source": "s", "path": path, "label": label})
            assert rec
            records.append(rec)
    return records


def test_a_leaf_never_lands_in_two_splits(tmp_path):
    groups = [("healthy", seed, 4) for seed in range(30)]
    kept, _ = prepare_data.build(
        build_records(tmp_path, groups), args(), random.Random(1)
    )
    split_of_group = {}
    for rec in kept:
        group = rec["path"].name.split("_")[0]
        assert split_of_group.setdefault(group, rec["split"]) == rec["split"]
    assert {r["split"] for r in kept} == {"train", "val", "test"}


def test_conflicting_labels_are_dropped(tmp_path):
    a = make_image(tmp_path / "a.png", 5)
    b = make_image(
        tmp_path / "b.png", 5, noise=3
    )  # same leaf photographed, labelled differently
    recs = [
        prepare_data.inspect({"source": "s", "path": a, "label": "healthy"}),
        prepare_data.inspect({"source": "s", "path": b, "label": "fall_armyworm"}),
    ]
    kept, report = prepare_data.build(recs, args(), random.Random(1))
    assert kept == [] and report["dropped_conflicting_clusters"] == 1


def test_exact_duplicates_and_caps(tmp_path):
    a = make_image(tmp_path / "a.png", 1)
    (tmp_path / "a2.png").write_bytes(a.read_bytes())
    recs = [
        prepare_data.inspect({"source": "s", "path": p, "label": "healthy"})
        for p in (a, tmp_path / "a2.png")
    ]
    _, report = prepare_data.build(recs, args(), random.Random(1))
    assert report["dropped_exact_duplicates"] == 1

    many = build_records(tmp_path, [("healthy", seed, 1) for seed in range(20, 40)])
    kept, report = prepare_data.build(many, args(caps={"s": 5}), random.Random(1))
    assert len(kept) == 5 and report["dropped_by_cap"] == 15


def test_end_to_end_writes_trainable_folders(tmp_path):
    raw, out = tmp_path / "raw", tmp_path / "data"
    for seed in range(40):
        make_image(raw / "karaagro_maize" / "Healthy" / f"h{seed}.png", seed)
        make_image(
            raw / "karaagro_maize" / "Fall armyworm" / f"f{seed}.png", 1000 + seed
        )
        make_image(
            raw / "karaagro_maize" / "MLN" / f"m{seed}.png", 2000 + seed
        )  # no taxonomy label: skipped
    prepare_data.main(
        [
            "--raw",
            str(raw),
            "--out",
            str(out),
            "--sources",
            "karaagro_maize",
            "--seed",
            "1",
        ]
    )
    labels = {
        p.name for split in ("train", "val", "test") for p in (out / split).iterdir()
    }
    assert labels == {"healthy", "fall_armyworm"}
    assert all(img.suffix == ".jpg" for img in (out / "train").rglob("*.*"))
    report = json.loads((out / "report.json").read_text())
    assert set(report["counts"]) == {"healthy", "fall_armyworm"}
    assert any("maize_streak_virus" in w for w in report["warnings"])
    assert (out / "manifest.csv").exists()


def test_download_plan_picks_files_and_checksums():
    record = {
        "files": [
            {
                "key": "healthy1.zip",
                "size": 10,
                "checksum": "md5:abc",
                "links": {"self": "https://x/h"},
            },
            {"key": "msv1.zip", "size": 5},
        ]
    }
    plan = download_data.plan_downloads(record, ["healthy1.zip", "msv1.zip"], "123")
    assert plan[0] == {
        "name": "healthy1.zip",
        "url": "https://x/h",
        "size": 10,
        "md5": "abc",
    }
    assert plan[1]["url"].startswith("https://zenodo.org/records/123/files/msv1.zip")
    try:
        download_data.plan_downloads(record, ["nope.zip"], "123")
    except SystemExit:
        return
    raise AssertionError("expected SystemExit for a missing file")
