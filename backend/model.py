"""Linear Regression model: train, save, load, predict."""
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
import joblib

FEATURES = ["temperature", "humidity", "hour", "day_of_week",
            "occupancy", "previous_consumption"]
MODEL_PATH = "energy_model.joblib"

def train(csv_path="energy_data.csv"):
    df = pd.read_csv(csv_path)
    X, y = df[FEATURES], df["energy_kwh"]
    X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=42)
    model = LinearRegression().fit(X_tr, y_tr)
    pred = model.predict(X_te)
    metrics = {
        "r2": round(float(r2_score(y_te, pred)), 4),
        "mae": round(float(mean_absolute_error(y_te, pred)), 4),
        "rmse": round(float(np.sqrt(mean_squared_error(y_te, pred))), 4),
    }
    joblib.dump({"model": model, "metrics": metrics}, MODEL_PATH)
    return model, metrics

def load():
    bundle = joblib.load(MODEL_PATH)
    return bundle["model"], bundle["metrics"]

def predict(model, params: dict) -> float:
    x = np.array([[params[f] for f in FEATURES]])
    return float(model.predict(x)[0])

if __name__ == "__main__":
    from data_generator import generate_dataset
    generate_dataset().to_csv("energy_data.csv", index=False)
    m, met = train()
    print("Trained. Metrics:", met)
