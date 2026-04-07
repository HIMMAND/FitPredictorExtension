from __future__ import annotations

import argparse
from pathlib import Path

import pandas as pd

FEATURE_COLUMNS = ["Age", "stature", "weightkg", "Gender"]
TARGET_COLUMNS = [
    "chestcircumference",
    "waistcircumference",
    "neckcircumference",
    "buttockcircumference",
]


def infer_body_type(gender: str, chest_cm: float, waist_cm: float, hip_cm: float) -> str:
    gender_key = str(gender).strip().lower()
    chest = float(chest_cm)
    waist = float(waist_cm)
    hip = float(hip_cm)

    if gender_key == "male":
        chest_waist_delta = chest - waist
        chest_hip_delta = chest - hip

        if waist >= chest - 2 and waist >= hip - 2:
            return "oval"

        if chest_waist_delta >= 16:
            if chest_hip_delta >= 10:
                return "inverted triangle"
            return "trapezoid"

        if hip >= chest + 4 or waist >= chest + 2:
            return "triangle"

        if abs(chest - hip) <= 6 and chest_waist_delta < 10:
            return "rectangle"

        return "trapezoid"

    chest_waist_delta = chest - waist
    hip_waist_delta = hip - waist

    if waist >= chest - 6 and waist >= hip - 8:
        return "apple"

    if abs(chest - hip) <= 6 and chest_waist_delta >= 20 and hip_waist_delta >= 20:
        return "hourglass"

    if hip - chest >= 6:
        return "pear (triangle)"

    if chest - hip >= 6:
        return "inverted triangle"

    return "rectangle"


def load_ansur_csv(path: Path) -> pd.DataFrame:
    return pd.read_csv(path, encoding="latin-1")


def normalize_units(df: pd.DataFrame) -> pd.DataFrame:
    normalized = df.copy()
    normalized["age_years"] = normalized["Age"].astype(float)
    normalized["height_cm"] = normalized["stature"].astype(float) / 10.0
    normalized["weight_kg"] = normalized["weightkg"].astype(float) / 10.0
    normalized["gender"] = normalized["Gender"].astype(str).str.lower()
    normalized["chest_cm"] = normalized["chestcircumference"].astype(float) / 10.0
    normalized["waist_cm"] = normalized["waistcircumference"].astype(float) / 10.0
    normalized["neck_cm"] = normalized["neckcircumference"].astype(float) / 10.0
    normalized["hip_cm"] = normalized["buttockcircumference"].astype(float) / 10.0
    normalized["body_type"] = normalized.apply(
        lambda row: infer_body_type(
            row["gender"],
            row["chest_cm"],
            row["waist_cm"],
            row["hip_cm"],
        ),
        axis=1,
    )
    return normalized


def combine_datasets(male_path: Path, female_path: Path) -> pd.DataFrame:
    frames = [
        normalize_units(load_ansur_csv(male_path)),
        normalize_units(load_ansur_csv(female_path)),
    ]
    return pd.concat(frames, ignore_index=True)


def build_summary(df: pd.DataFrame) -> str:
    return "\n".join(
        [
            "# ANSUR Summary",
            "",
            f"- rows: {len(df)}",
            f"- genders: {sorted(df['gender'].unique().tolist())}",
            f"- body_types: {sorted(df['body_type'].unique().tolist())}",
            f"- height_cm range: {df['height_cm'].min():.1f} - {df['height_cm'].max():.1f}",
            f"- weight_kg range: {df['weight_kg'].min():.1f} - {df['weight_kg'].max():.1f}",
            f"- chest_cm range: {df['chest_cm'].min():.1f} - {df['chest_cm'].max():.1f}",
            f"- waist_cm range: {df['waist_cm'].min():.1f} - {df['waist_cm'].max():.1f}",
            f"- neck_cm range: {df['neck_cm'].min():.1f} - {df['neck_cm'].max():.1f}",
            f"- hip_cm range: {df['hip_cm'].min():.1f} - {df['hip_cm'].max():.1f}",
        ]
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--male", required=True, type=Path)
    parser.add_argument("--female", required=True, type=Path)
    parser.add_argument("--summary", required=True, type=Path)
    args = parser.parse_args()

    df = combine_datasets(args.male, args.female)
    args.summary.parent.mkdir(parents=True, exist_ok=True)
    args.summary.write_text(build_summary(df) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
