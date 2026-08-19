from pathlib import Path
from typing import List

import joblib
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="Seizure Sync ML API")

# Allow CORS so your frontend (HTML/JS) can fetch from localhost
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Model at Startup
MODEL_PATH = Path(__file__).parent / "results/rf_model.pkl"

try:
    rf_model = joblib.load(MODEL_PATH)
    print(f"Successfully loaded model from {MODEL_PATH}")
except Exception as e:
    print(f"Failed to load model: {e}")
    rf_model = None


# Input Schema Validation using Pydantic
class PredictRequest(BaseModel):
    features: List[float] = Field(
        ...,
        min_items=178,
        max_items=178,
        description="Exactly 178 EEG signal readings",
    )


# Response Schema
class PredictResponse(BaseModel):
    is_seizure: bool
    prediction: int
    confidence: float
    status: str


@app.get("/")
def read_root():
    return {"message": "Seizure Detection API is running"}


@app.post("/predict", response_model=PredictResponse)
def predict(payload: PredictRequest):
    if rf_model is None:
        raise HTTPException(
            status_code=500, detail="Model file not found or failed to load."
        )

    try:
        # Convert input array into shape (1, 178)
        input_data = np.array(payload.features, dtype=float).reshape(1, -1)

        # Make prediction
        prediction = int(rf_model.predict(input_data)[0])
        probabilities = rf_model.predict_proba(input_data)[0]

        # Class 1 = Seizure, Class 0 = Stable/Normal
        is_seizure = bool(prediction == 1)
        confidence = float(probabilities[1] if is_seizure else probabilities[0])

        return PredictResponse(
            is_seizure=is_seizure,
            prediction=prediction,
            confidence=round(confidence * 100, 2),
            status="ALERT" if is_seizure else "STABLE",
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))