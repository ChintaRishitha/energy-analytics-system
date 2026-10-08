document
  .getElementById("predict-form")
  .addEventListener("submit", async (e) => {

    e.preventDefault();

    const btn = document.getElementById("predict-btn");
    const resultEl = document.getElementById("prediction-result");
    const detailsEl = document.getElementById("prediction-details");

    const formData = new FormData(e.target);

    const inputs = {};

    for (const [key, value] of formData.entries()) {
      inputs[key] = parseFloat(value);
    }

    btn.disabled = true;
    btn.textContent = "Predicting...";

    resultEl.innerHTML = `
      <span class="placeholder">
        Contacting ML backend...
      </span>
    `;

    try {

      const res = await API.predict(inputs);

      resultEl.innerHTML = `
        ${res.predicted_kwh}
        <span style="font-size:18px;color:var(--muted)">
          kWh
        </span>
      `;

      const coefRows = Object.entries(res.coefficients)
        .map(([feature, coefficient]) => `
          <tr>
            <td style="padding:6px;">
              ${feature.replace(/_/g, " ")}
            </td>

            <td style="padding:6px;">
              ${coefficient}
            </td>
          </tr>
        `)
        .join("");

      detailsEl.innerHTML = `
        <p>
          <b>Model:</b> ${res.model}
        </p>

        <p>
          <b>R²:</b> ${res.metrics.r2}
          &nbsp;&nbsp;
          <b>MAE:</b> ${res.metrics.mae}
          &nbsp;&nbsp;
          <b>RMSE:</b> ${res.metrics.rmse}
        </p>

        <h4>Feature Coefficients</h4>

        <table style="
          width:100%;
          font-size:13px;
          border-collapse:collapse;
        ">

          <tr style="color:var(--muted)">
            <th style="text-align:left;padding:6px;">
              Feature
            </th>

            <th style="text-align:left;padding:6px;">
              Coefficient
            </th>
          </tr>

          ${coefRows}

        </table>

        <p style="margin-top:10px;">
          <b>Intercept:</b> ${res.intercept}
        </p>
      `;

    } catch (error) {

      resultEl.innerHTML = `
        <span
          class="placeholder"
          style="color:var(--danger)"
        >
          ⚠ ${error.message}
        </span>
      `;

    } finally {

      btn.disabled = false;
      btn.textContent = "Predict Consumption";

    }

  });