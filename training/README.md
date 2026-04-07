# Training

This directory contains reproducible ML scripts for FitPredictor.

## Datasets

- ANSUR II MALE Public.csv
- ANSUR II FEMALE Public.csv
- modcloth_final_data.json
- renttherunway_final_data.json

## Tracks

- ANSUR: body-measurement regression
- RTR/ModCloth: review and fit-signal analysis

## Current Direction

- ANSUR preprocessing now derives heuristic gender-specific body-type labels from chest, waist, and hip ratios
- Measurement training is moving toward explicit `gender` + `body_type` features instead of relying on the legacy shipped `body_type_encoded` runtime schema
