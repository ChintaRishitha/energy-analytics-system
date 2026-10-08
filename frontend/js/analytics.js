let aggregationChart = null;
let hourlyChart = null;
let dowChart = null;

let analyticsData = null;

// Load analytics
async function loadAnalytics() {
  try {
    analyticsData = await API.analytics();

    const s = analyticsData.stats;

    // Statistics
    document.getElementById("a-avg").textContent = s.average;
    document.getElementById("a-median").textContent = s.median;
    document.getElementById("a-std").textContent = s.std;
    document.getElementById("a-minmax").textContent =
      `${s.min} / ${s.max}`;

    // Aggregation chart
    drawAggregationChart("daily");

    // Hourly chart
    drawHourlyChart();

    // Day of week chart
    drawDayOfWeekChart();

    // Peak analysis
    const peak = analyticsData.peak_record;

    document.getElementById("peak-text").innerHTML = `
      The highest recorded energy consumption was
      <b>${peak.value} kWh</b> on
      <b>${peak.date}</b> at
      <b>${peak.hour}:00</b>.

      At that time, the recorded temperature was
      <b>${peak.temperature.toFixed(2)}°C</b>
      and occupancy was
      <b>${peak.occupancy.toFixed(1)}%</b>.
    `;

  } catch (error) {
    console.error("Analytics loading failed:", error);

    document.getElementById("peak-text").innerHTML = `
      <span style="color:var(--danger)">
        ⚠ Unable to load analytics data.
        ${error.message}
      </span>
    `;
  }
}


// Aggregation chart
function drawAggregationChart(type) {

  if (!analyticsData) return;

  const data = analyticsData[type];

  const labels = data.map(item => item.date);
  const values = data.map(item => item.value);

  if (aggregationChart) {
    aggregationChart.destroy();
  }

  aggregationChart = new Chart(
    document.getElementById("chart-agg"),
    {
      type: "line",

      data: {
        labels: labels,

        datasets: [{
          label: `${type.charAt(0).toUpperCase() + type.slice(1)} Consumption (kWh)`,
          data: values,
          borderColor: "#2563eb",
          backgroundColor: "rgba(37, 99, 235, 0.1)",
          fill: true,
          tension: 0.3,
          pointRadius: 2
        }]
      },

      options: {
        responsive: true,

        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "kWh"
            }
          },

          x: {
            title: {
              display: true,
              text: "Date"
            }
          }
        }
      }
    }
  );
}


// Hourly chart
function drawHourlyChart() {

  const data = analyticsData.hourly;

  const labels = data.map(item => `${item.hour}:00`);
  const values = data.map(item => item.value);

  if (hourlyChart) {
    hourlyChart.destroy();
  }

  hourlyChart = new Chart(
    document.getElementById("chart-hourly"),
    {
      type: "bar",

      data: {
        labels: labels,

        datasets: [{
          label: "Average Consumption",
          data: values,
          backgroundColor: "#2563eb"
        }]
      },

      options: {
        responsive: true,

        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Average kWh"
            }
          },

          x: {
            title: {
              display: true,
              text: "Hour"
            }
          }
        }
      }
    }
  );
}


// Day of week chart
function drawDayOfWeekChart() {

  const data = analyticsData.by_day_of_week;

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
  ];

  const labels = data.map(item => days[item.day]);
  const values = data.map(item => item.value);

  if (dowChart) {
    dowChart.destroy();
  }

  dowChart = new Chart(
    document.getElementById("chart-dow"),
    {
      type: "bar",

      data: {
        labels: labels,

        datasets: [{
          label: "Average Consumption",
          data: values,
          backgroundColor: "#16a34a"
        }]
      },

      options: {
        responsive: true,

        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Average kWh"
            }
          },

          x: {
            title: {
              display: true,
              text: "Day"
            }
          }
        }
      }
    }
  );
}


// Aggregation tabs
document.querySelectorAll("#agg-tabs .tab").forEach(tab => {

  tab.addEventListener("click", () => {

    document
      .querySelectorAll("#agg-tabs .tab")
      .forEach(t => t.classList.remove("active"));

    tab.classList.add("active");

    const type = tab.dataset.agg;

    drawAggregationChart(type);
  });

});


// Load data
loadAnalytics();