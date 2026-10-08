from data_generator import generate_dataset
from model import train
generate_dataset().to_csv("energy_data.csv", index=False)
_, metrics = train()
print("Model trained:", metrics)
