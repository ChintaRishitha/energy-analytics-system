"""Generates synthetic but realistic historical energy data.
Replace with real CSV data (same columns) for production."""
import numpy as np
import pandas as pd

def generate_dataset(days=365, seed=42):
    rng = np.random.default_rng(seed)
    rows = []
    for day in range(days):
        date = pd.Timestamp("2024-01-01") + pd.Timedelta(days=day)
        day_of_week = date.dayofweek
        is_weekend = day_of_week >= 5
        season_factor = 1 + 0.25 * np.sin(2 * np.pi * day / 365)  # seasonal cycle
        for hour in range(24):
            temp = 18 + 10 * np.sin(2 * np.pi * (hour - 6) / 24) + rng.normal(0, 2)
            humidity = 55 + 15 * np.cos(2 * np.pi * hour / 24) + rng.normal(0, 5)
            occupancy = (60 if not is_weekend else 25) * (
                1.0 if 8 <= hour <= 18 else 0.25
            ) + rng.normal(0, 5)
            occupancy = max(0, min(100, occupancy))
            base = 1.5 + 0.02 * occupancy
            hvac = abs(temp - 22) * 0.12
            peak = 1.3 if 17 <= hour <= 21 else (1.1 if 8 <= hour <= 16 else 0.7)
            if hour > 0:
                prev = rows[-1]["energy_kwh"]
            else:
                prev = base + hvac
            noise = rng.normal(0, 0.15)
            energy = max(0.2, (base + hvac) * peak * season_factor + noise + 0.1 * prev)
            rows.append({
                "date": str(date.date()), "hour": hour, "day_of_week": day_of_week,
                "temperature": round(temp, 2), "humidity": round(humidity, 2),
                "occupancy": round(occupancy, 1),
                "previous_consumption": round(prev, 3),
                "energy_kwh": round(energy, 3),
            })
    return pd.DataFrame(rows)

if __name__ == "__main__":
    df = generate_dataset()
    df.to_csv("energy_data.csv", index=False)
    print(df.head(), df["energy_kwh"].describe())
