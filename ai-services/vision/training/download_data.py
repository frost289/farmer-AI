"""Download dataset files from Zenodo into data/raw/<source dir>.

    python training/download_data.py --source tanzania_maize --extract
    python training/download_data.py --source tanzania_maize --files healthy1.zip msv2.zip

Only sources with a "zenodo" entry in datasets.json can be fetched here; the others (KaraAgro,
cassava) are downloaded by hand, see "get" in datasets.json. Files are big (about 1.3 GB each):
downloads resume if interrupted, and the md5 from Zenodo is checked.
Note: I could not test this against the live site from my environment. If Zenodo changes its
API, download the zips in a browser and extract them into the folder named in datasets.json.
"""

import argparse
import hashlib
import json
import sys
import urllib.request
import zipfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from prepare_data import load_sources  # noqa: E402

API = "https://zenodo.org/api/records/{record}"
CHUNK = 1 << 20


def plan_downloads(record_json: dict, wanted: list[str], record: str) -> list[dict]:
    """Pick the wanted files out of a Zenodo record. Raises if one is missing."""
    files = {f.get("key") or f.get("filename"): f for f in record_json.get("files", [])}
    missing = [name for name in wanted if name not in files]
    if missing:
        raise SystemExit(
            f"not in record {record}: {missing}. Available: {sorted(files)[:30]}"
        )
    plan = []
    for name in wanted:
        f = files[name]
        url = (f.get("links") or {}).get(
            "self"
        ) or f"https://zenodo.org/records/{record}/files/{name}?download=1"
        checksum = f.get("checksum", "")
        plan.append(
            {
                "name": name,
                "url": url,
                "size": f.get("size"),
                "md5": (
                    checksum.split(":", 1)[1] if checksum.startswith("md5:") else None
                ),
            }
        )
    return plan


def fetch(item: dict, dest: Path) -> None:
    target = dest / item["name"]
    have = target.stat().st_size if target.exists() else 0
    if item["size"] and have == item["size"]:
        print(f"[have] {item['name']}")
    else:
        request = urllib.request.Request(
            item["url"], headers={"Range": f"bytes={have}-"} if have else {}
        )
        with urllib.request.urlopen(request) as response, open(
            target, "ab" if have and response.status == 206 else "wb"
        ) as out:
            while chunk := response.read(CHUNK):
                out.write(chunk)
                print(
                    f"\r{item['name']}: {target.stat().st_size / 1e6:8.0f} MB",
                    end="",
                    flush=True,
                )
        print()
    if item["md5"]:
        digest = hashlib.md5()
        with open(target, "rb") as handle:
            while chunk := handle.read(CHUNK):
                digest.update(chunk)
        if digest.hexdigest() != item["md5"]:
            raise SystemExit(
                f"{item['name']}: checksum mismatch. Delete it and download again."
            )


def main():
    p = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    p.add_argument("--source", required=True)
    p.add_argument("--raw", type=Path, default=Path("data/raw"))
    p.add_argument(
        "--files", nargs="*", help="zip names (default: the source's default_files)"
    )
    p.add_argument("--extract", action="store_true")
    args = p.parse_args()
    source = next((s for s in load_sources() if s["id"] == args.source), None)
    if not source or "zenodo" not in source:
        raise SystemExit(
            f"'{args.source}' is not a Zenodo source; see its 'get' note in datasets.json"
        )
    record = source["zenodo"]["record"]
    wanted = args.files or source["zenodo"]["default_files"]
    with urllib.request.urlopen(API.format(record=record)) as response:
        plan = plan_downloads(json.load(response), wanted, record)
    dest = args.raw / source["dir"]
    dest.mkdir(parents=True, exist_ok=True)
    for item in plan:
        fetch(item, dest)
        if args.extract:
            folder = dest / Path(item["name"]).stem  # healthy1.zip -> healthy1/
            with zipfile.ZipFile(dest / item["name"]) as archive:
                archive.extractall(folder)
            print(f"extracted to {folder}")
    print("done. Next: python training/prepare_data.py --dry-run")


if __name__ == "__main__":
    main()
