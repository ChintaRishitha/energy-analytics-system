from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from model import load, predict, FEATURES

app = Flask(__name__)
CORS(app)  # allow Netlify origin; tighten in production

model, metrics = load()
df = pd.read_csv("energy_data.csv", parse_dates=["date"])

def series_stats(s):
    return {
        "total": round(float(s.sum()), 2), "average": round(float(s.mean()), 2),
        "median": round(float(s.median()), 2), "min": round(float(s.min()), 2),
        "max": round(float(s.max()), 2), "std": round(float(s.std()), 2),
    }

@app.get("/api/health")
def health():
    return jsonify({"status": "ok", "model_metrics": metrics})

@app.get("/api/dashboard")
def dashboard():
    stats = series_stats(df["energy_kwh"])
    peak_hour = int(df.groupby("hour")["energy_kwh"].mean().idxmax())
    predicted_next = predict(model, {
        "temperature": float(df["temperature"].iloc[-1]),
        "humidity": float(df["humidity"].iloc[-1]),
        "hour": (int(df["hour"].iloc[-1]) + 1) % 24,
        "day_of_week": int(df["day_of_week"].iloc[-1]),
        "occupancy": float(df["occupancy"].iloc[-1]),
        "previous_consumption": float(df["energy_kwh"].iloc[-1]),
    })
    return jsonify({
        "stats": stats, "peak_hour": peak_hour,
        "predicted_next": round(predicted_next, 2),
        "trend": df.set_index("date").resample("D")["energy_kwh"].sum()
                 .tail(30).reset_index().to_dict("records"),
        "model_metrics": metrics,
    })

@app.get("/api/analytics")
def analytics():
    daily = df.set_index("date").resample("D")["energy_kwh"].agg(["sum", "mean"]).reset_index()
    weekly = df.set_index("date").resample("W")["energy_kwh"].sum().reset_index()
    monthly = df.set_index("date").resample("ME")["energy_kwh"].sum().reset_index()
    hourly = df.groupby("hour")["energy_kwh"].mean().reset_index()
    dow = df.groupby("day_of_week")["energy_kwh"].mean().reset_index()
    peak = df.loc[df["energy_kwh"].idxmax()]
    return jsonify({
        "daily": [{"date": str(r["date"].date()), "value": round(r["sum"], 2)}
                  for _, r in daily.iterrows()],
        "weekly": [{"date": str(r["date"].date()), "value": round(r["energy_kwh"], 2)}
                   for _, r in weekly.iterrows()],
        "monthly": [{"date": str(r["date"].date()), "value": round(r["energy_kwh"], 2)}
                    for _, r in monthly.iterrows()],
        "hourly": [{"hour": int(r["hour"]), "value": round(r["energy_kwh"], 2)}
                   for _, r in hourly.iterrows()],
        "by_day_of_week": [{"day": int(r["day_of_week"]), "value": round(r["energy_kwh"], 2)}
                           for _, r in dow.iterrows()],
        "stats": series_stats(df["energy_kwh"]),
        "peak_record": {
            "date": str(peak["date"].date()), "hour": int(peak["hour"]),
            "value": round(float(peak["energy_kwh"]), 2),
            "temperature": float(peak["temperature"]),
            "occupancy": float(peak["occupancy"]),
        },
    })

@app.post("/api/predict")
def api_predict():
    data = request.get_json(silent=True) or {}
    try:
        params = {f: float(data[f]) for f in FEATURES}
    except (KeyError, TypeError, ValueError):
        return jsonify({"error": "All 6 numeric inputs are required: "
                        + ", ".join(FEATURES)}), 400
    value = predict(model, params)
    coefficients = dict(zip(FEATURES, [round(float(c), 4) for c in model.coef_]))
    return jsonify({
        "predicted_kwh": round(value, 3),
        "model": "LinearRegression", "inputs": params,
        "coefficients": coefficients,
        "intercept": round(float(model.intercept_), 4),
        "metrics": metrics,
    })

if __name__ == "__main__":
    app.run(debug=True, port=5000)
