/* AI Energy Analyst.
   Current mode: local rule-based insights computed from REAL backend data.
   Future mode: send `payload` to your Gemini endpoint (via a backend proxy
   that holds the API key — never expose the key in frontend code). */

document.getElementById("ai-generate-btn").addEventListener("click", async () => {
  const btn = document.getElementById("ai-generate-btn");
  const out = document.getElementById("ai-output");
  btn.disabled = true; btn.textContent = "Analyzing…";
  out.innerHTML = "<span class='muted'>Gathering live data and generating insights…</span>";

  try {
    const [dash, analytics] = await Promise.all([API.dashboard(), API.analytics()]);
    const payload = { dashboard: dash, analytics }; // ready for Gemini later
    const insights = generateLocalInsights(dash, analytics);
    out.innerHTML = insights;

    /* --- Gemini integration (uncomment once backend proxy is ready) ---
    const res = await API.post("/api/ai-insights", payload);
    out.innerHTML = marked.parse(res.analysis); */
  } catch (err) {
    out.innerHTML = `<span style="color:var(--danger)">⚠ ${err.message}</span>`;
  } finally {
    btn.disabled = false; btn.textContent = "Generate AI Insights";
  }
});

function generateLocalInsights(dash, a) {
  const s = a.stats, DOW = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const peakHour = a.hourly.reduce((x, y) => x.value > y.value ? x : y);
  const busiestDay = a.by_day_of_week.reduce((x, y) => x.value > y.value ? x : y);
  const nightAvg = a.hourly.filter(h => h.hour < 6).reduce((s2, h) => s2 + h.value, 0) /
                   a.hourly.filter(h => h.hour < 6).length;

  return `
  <h4>📊 Usage Insights</h4>
  Total consumption is <b>s.totalkWh</b>,averaging<b>{s.total} kWh</b>, averaging <b>s.totalkWh</b>,averaging<b>{s.average} kWh</b> per interval
  with a standard deviation of <b>${s.std} kWh</b>
  (${s.std > s.average * 0.4 ? "high variability — usage is irregular" : "fairly stable usage"}).

  <h4>⏰ Peak Usage Explanation</h4>
  Peak average consumption occurs at <b>hour peakHour.hour:00</b>({peakHour.hour}:00</b> (peakHour.hour:00</b>({peakHour.value} kWh).
  The busiest weekday is <b>DOW[busiestDay.day]</b>({DOW[busiestDay.day]}</b> (DOW[busiestDay.day]</b>({busiestDay.value} kWh avg).
  This typically reflects overlapping HVAC load, occupancy, and evening appliance usage.

  <h4>💡 Energy-Saving Recommendations</h4>
  <ul>
    <li>Shift flexible loads (laundry, charging) away from the ${peakHour.hour}:00 peak.</li>
    <li>Night-time baseline averages ${nightAvg.toFixed(2)} kWh —
        ${nightAvg > s.average * 0.5 ? "consider enabling standby/power-saving modes" : "this is reasonable"}.</li>
    <li>Set HVAC setpoints closer to 22°C; the model shows temperature drives consumption.</li>
    <li>Review weekend schedules (DOW[5]–{DOW[5]}–DOW[5]–{DOW[6]}) for unnecessary load.</li>
  </ul>

  <h4>🔮 Prediction Explanation</h4>
  The Linear Regression model (R² = dash.modelmetrics.r2,MAE={dash.model_metrics.r2}, MAE =dash.modelm​etrics.r2,MAE={dash.model_metrics.mae})
  predicts the next hour at <b>${dash.predicted_next} kWh</b>, based on temperature, humidity,
  hour, weekday, occupancy, and previous consumption. Positive coefficients increase the
  prediction; negative coefficients reduce it.`;
}
