from __future__ import annotations

import argparse
import json
from pathlib import Path
import sys

import joblib
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

REPO_ROOT = Path(__file__).resolve().parents[2]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from training.data_prep.ansur import combine_datasets

FEATURES = ["age_years", "height_cm", "weight_kg", "gender"]
TARGETS = {
    "chest_cm": "chest_model.joblib",
    "waist_cm": "waist_model.joblib",
    "neck_cm": "neck_model.joblib",
    "hip_cm": "hip_model.joblib",
}


def build_pipeline() -> Pipeline:
    preprocessor = ColumnTransformer(
        [
            ("gender", OneHotEncoder(handle_unknown="ignore"), ["gender"]),
            ("numeric", "passthrough", ["age_years", "height_cm", "weight_kg"]),
        ]
    )
    model = RandomForestRegressor(n_estimators=300, random_state=42, n_jobs=-1)
    return Pipeline([("preprocessor", preprocessor), ("model", model)])


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--male", required=True, type=Path)
    parser.add_argument("--female", required=True, type=Path)
    parser.add_argument("--out-dir", required=True, type=Path)
    args = parser.parse_args()

    df = combine_datasets(args.male, args.female)
    x_frame = df[FEATURES]
    args.out_dir.mkdir(parents=True, exist_ok=True)
    metrics = {}

    for target, filename in TARGETS.items():
        x_train, x_test, y_train, y_test = train_test_split(
            x_frame, df[target], test_size=0.2, random_state=42
        )
        pipeline = build_pipeline()
        pipeline.fit(x_train, y_train)
        predictions = pipeline.predict(x_test)
        metrics[target] = {
            "mae": mean_absolute_error(y_test, predictions),
            "r2": r2_score(y_test, predictions),
        }
        joblib.dump(pipeline, args.out_dir / filename)

    (args.out_dir / "metrics.json").write_text(
        json.dumps(metrics, indent=2),
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
