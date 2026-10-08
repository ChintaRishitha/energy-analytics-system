document.addEventListener("DOMContentLoaded", async () => {
  try {
    const d = await API.dashboard();

    document.getElementById("s-total").textContent =
      d.stats.total.toFixed(2);

    document.getElementById("s-avg").textContent =
      d.stats.average.toFixed(2);

    document.getElementById("s-max").textContent =
      d.stats.max.toFixed(2);

    document.getElementById("s-min").textContent =
      d.stats.min.toFixed(2);

    document.getElementById("s-pred").textContent =
      d.predicted_next.toFixed(2);

    document.getElementById("s-peak").textContent =
      String(d.peak_hour).padStart(2, "0") + ":00";

    drawTrendChart(d.trend);

  } catch (error) {
    console.error("Dashboard error:", error);
  }
});


function drawTrendChart(data) {

  const canvas = document.getElementById("chart-trend");

  if (!canvas) {
    return;
  }

  const ctx = canvas.getContext("2d");

  if (window.trendChart) {
    window.trendChart.destroy();
  }

  window.trendChart = new Chart(ctx, {
    type: "line",

    data: {
      labels: data.map(item => item.date),

      datasets: [{
        label: "Daily Energy Consumption (kWh)",

        data: data.map(item => item.energy_kwh),

        borderWidth: 3,

        tension: 0.35,

        fill: true,

        pointRadius: 3,

        pointHoverRadius: 6
      }]
    },

    options: {
      responsive: true,

      maintainAspectRatio: false,

      plugins: {
        legend: {
          display: true
        }
      },

      scales: {
        x: {
          ticks: {
            maxTicksLimit: 8
          }
        },

        y: {
          beginAtZero: true,

          title: {
            display: true,
            text: "Energy (kWh)"
          }
        }
      }
    }
  });
}