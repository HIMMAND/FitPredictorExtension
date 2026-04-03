from __future__ import annotations

import argparse
import shutil
from pathlib import Path


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-dir", required=True, type=Path)
    parser.add_argument("--target-dir", required=True, type=Path)
    args = parser.parse_args()
    args.target_dir.mkdir(parents=True, exist_ok=True)
    for name in [
        "chest_model.joblib",
        "waist_model.joblib",
        "neck_model.joblib",
        "hip_model.joblib",
    ]:
        shutil.copy2(args.source_dir / name, args.target_dir / name)


if __name__ == "__main__":
    main()
