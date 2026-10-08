const API = {
  async get(path) {
    const res = await fetch(`${API_BASE_URL}${path}`);

    if (!res.ok) {
      throw new Error(`API error ${res.status}`);
    }

    return res.json();
  },

  async post(path, body) {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || `API error ${res.status}`);
    }

    return data;
  },

  dashboard: () => API.get("/api/dashboard"),

  analytics: () => API.get("/api/analytics"),

  predict: (inputs) => API.post("/api/predict", inputs)
};