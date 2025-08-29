import sys
import joblib
import numpy as np
import json

def map_gender(gender_str):
    """
    Convert gender string to numeric (female: 0, male: 1).
    """
    mapping = {'female': 0, 'male': 1}
    return mapping.get(gender_str.strip().lower(), -1)

def create_combined_body_type(gender_str, body_type_str):
    """
    Create the combined body type string that was used during training.
    For example, if gender is "male" and body type is "Oval", it returns "Male Oval".
    """
    gender_cap = gender_str.strip().capitalize()
    body_type = body_type_str.strip()
    return f"{gender_cap} {body_type}"

def round_to_nearest_whole(value):
    """
    Rounds a float to the nearest whole number.
    """
    return int(np.floor(value + 0.5))

def main():
    # Expecting 5 arguments: age, height, weight, gender, combinedBodyType
    if len(sys.argv) < 6:
        print("Error: Insufficient arguments. Expected: age, height, weight, gender, bodyType")
        sys.exit(1)
        
    try:
        # Parse the numerical inputs
        age = float(sys.argv[1])
        height = float(sys.argv[2])
        weight = float(sys.argv[3])
    except ValueError:
        print("Error: age, height, and weight must be numeric.")
        sys.exit(1)
        
    # Get string inputs for gender and bodyType
    gender_str = sys.argv[4]
    # Instead of a raw body type value, the server should send the combined body type.
    # But if not, we create it here.
    body_type_input = sys.argv[5]
    
    # Convert gender to numeric
    gender_num = map_gender(gender_str)
    if gender_num == -1:
        print("Error: gender must be 'male' or 'female'.")
        sys.exit(1)
    
    # Create the combined body type string (e.g., "Male Oval")
    combined_body_type = create_combined_body_type(gender_str, body_type_input)
    
    # Load the prediction models and LabelEncoder
    try:
        chest_model = joblib.load("chest_model.joblib")
        waist_model = joblib.load("waist_model.joblib")
        neck_model = joblib.load("neck_model.joblib")
        hip_model = joblib.load("hip_model.joblib")
        
        # Load the saved LabelEncoder for body type
        label_encoder = joblib.load("body_type_encoder.joblib")
        # Transform the combined string to the corresponding numeric code
        body_type_num = label_encoder.transform([combined_body_type])[0]
    except Exception as e:
        print(f"Error loading models or encoder: {e}")
        sys.exit(1)
        
    # Create the feature vector in the order: age, height, weight, gender_numeric, body_type_encoded
    features = np.array([[age, height, weight, gender_num, body_type_num]])
    
    try:
        # Run predictions using the 4 models
        chest_pred = chest_model.predict(features)[0]
        waist_pred = waist_model.predict(features)[0]
        neck_pred = neck_model.predict(features)[0]
        hip_pred = hip_model.predict(features)[0]
        
        # Apply bias adjustments:
        # 1. Subtract 3 inches from the neck prediction.
        neck_pred_adjusted = neck_pred - 3
        
        # 2. For "Male Oval", ensure that the waist prediction is greater than the chest prediction.
        waist_pred_adjusted = waist_pred
        chest_pred_adjusted = chest_pred  # Unchanged
        if combined_body_type.strip().lower() == "male oval":
            if waist_pred_adjusted <= chest_pred_adjusted:
                waist_pred_adjusted = chest_pred_adjusted + 1
                
    except Exception as e:
        print(f"Error during prediction: {e}")
        sys.exit(1)
        
    # Round the predictions to whole numbers
    chest_pred_rounded = round_to_nearest_whole(chest_pred_adjusted)
    waist_pred_rounded = round_to_nearest_whole(waist_pred_adjusted)
    neck_pred_rounded = round_to_nearest_whole(neck_pred_adjusted)
    hip_pred_rounded = round_to_nearest_whole(hip_pred)
    
    # Build a results dictionary including both raw and rounded predictions
    result = {
        "chest_prediction": chest_pred_rounded,
        "waist_prediction": waist_pred_rounded,
        "neck_prediction": neck_pred_rounded,
        "hip_prediction": hip_pred_rounded,
        "chest_raw": float(chest_pred),
        "waist_raw": float(waist_pred),
        "neck_raw": float(neck_pred),
        "hip_raw": float(hip_pred)
    }
    
    # Output the results as a JSON string
    print(json.dumps(result))
    
if __name__ == "__main__":
    main()
