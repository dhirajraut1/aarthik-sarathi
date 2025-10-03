document.addEventListener("DOMContentLoaded", () => {
  // ... (DOM element references are the same) ...
  const taxForm = document.getElementById("tax-form");
  const resultsContainer = document.getElementById("results-container");
  const resultsSummary = document.getElementById("results-summary");
  const resultsBreakdown = document.getElementById("results-breakdown");
  const takeHomeSummary = document.getElementById("take-home-summary");
  const savingsAdvisor = document.getElementById("savings-advisor");
  const chartCanvas = document.getElementById("savingsChart");

  let taxChart = null; // Variable to hold the chart instance

  // UI Logic for toggling fund fields (same as before)
  document.querySelectorAll('input[name="fund-type"]').forEach((radio) => {
    radio.addEventListener("change", (event) => {
      document
        .getElementById("epf-field")
        .classList.toggle("hidden", event.target.value !== "epf");
      document
        .getElementById("ssf-field")
        .classList.toggle("hidden", event.target.value !== "ssf");
    });
  });

  // Form Submission Handler
  taxForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = {
      monthlyIncome:
        parseFloat(document.getElementById("monthly-income").value) || 0,
      bonus: parseFloat(document.getElementById("bonus").value) || 0,
      isMarried: document.getElementById("marital-status").checked,
      fundType: document.querySelector('input[name="fund-type"]:checked').value,
      epf: parseFloat(document.getElementById("epf").value) || 0,
      cit: parseFloat(document.getElementById("cit").value) || 0,
      ssf: parseFloat(document.getElementById("ssf").value) || 0,
      lifeInsurance:
        parseFloat(document.getElementById("life-insurance").value) || 0,
      healthInsurance:
        parseFloat(document.getElementById("health-insurance").value) || 0,
      otherDeductions:
        parseFloat(document.getElementById("other-deductions").value) || 0,
    };

    const initialResults = calculateNepaliTax(data);
    const advice = generateSavingsAdvice(data, initialResults);

    displayResults(initialResults, data, advice);
  });

  // Core Tax Calculation Function (same as before)
  function calculateNepaliTax(data) {
    // ... (This function remains unchanged) ...
    const MAX_RETIREMENT_DEDUCTION = 500000;
    const MAX_LIFE_INSURANCE_DEDUCTION = 40000;
    const MAX_HEALTH_INSURANCE_DEDUCTION = 20000;
    const grossAnnualIncome = data.monthlyIncome * 12 + data.bonus;
    let totalRetirementContribution =
      data.fundType === "epf" ? data.epf + data.cit : data.ssf + data.cit;
    const retirementDeduction = Math.min(
      totalRetirementContribution,
      MAX_RETIREMENT_DEDUCTION
    );
    const lifeInsuranceDeduction = Math.min(
      data.lifeInsurance,
      MAX_LIFE_INSURANCE_DEDUCTION
    );
    const healthInsuranceDeduction = Math.min(
      data.healthInsurance,
      MAX_HEALTH_INSURANCE_DEDUCTION
    );
    const totalDeductions =
      retirementDeduction +
      lifeInsuranceDeduction +
      healthInsuranceDeduction +
      data.otherDeductions;
    const taxableIncome = Math.max(0, grossAnnualIncome - totalDeductions);
    const slab1Limit = data.isMarried ? 600000 : 500000,
      slab2Limit = 200000,
      slab3Limit = 300000,
      slab4Limit = data.isMarried ? 900000 : 1000000,
      slab5Limit = 3000000;
    let totalTax = 0,
      remainingIncome = taxableIncome,
      breakdown = [];
    let slab1Taxable = Math.min(remainingIncome, slab1Limit);
    if (slab1Taxable > 0) {
      totalTax += slab1Taxable * 0.0; // 1% tax but waived
      remainingIncome -= slab1Taxable;
      breakdown.push({
        label: `1% on first ${slab1Taxable.toLocaleString()} (waived)`,
        value: slab1Taxable * 0.0,
      });
    }
    let slab2Taxable = Math.min(remainingIncome, slab2Limit);
    if (slab2Taxable > 0) {
      totalTax += slab2Taxable * 0.1;
      remainingIncome -= slab2Taxable;
      breakdown.push({
        label: `10% on next ${slab2Taxable.toLocaleString()}`,
        value: slab2Taxable * 0.1,
      });
    }
    let slab3Taxable = Math.min(remainingIncome, slab3Limit);
    if (slab3Taxable > 0) {
      totalTax += slab3Taxable * 0.2;
      remainingIncome -= slab3Taxable;
      breakdown.push({
        label: `20% on next ${slab3Taxable.toLocaleString()}`,
        value: slab3Taxable * 0.2,
      });
    }
    let slab4Taxable = Math.min(remainingIncome, slab4Limit);
    if (slab4Taxable > 0) {
      totalTax += slab4Taxable * 0.3;
      remainingIncome -= slab4Taxable;
      breakdown.push({
        label: `30% on next ${slab4Taxable.toLocaleString()}`,
        value: slab4Taxable * 0.3,
      });
    }
    let slab5Taxable = Math.min(remainingIncome, slab5Limit);
    if (slab5Taxable > 0) {
      totalTax += slab5Taxable * 0.36;
      remainingIncome -= slab5Taxable;
      breakdown.push({
        label: `36% on next ${slab5Taxable.toLocaleString()}`,
        value: slab5Taxable * 0.36,
      });
    }
    if (remainingIncome > 0) {
      totalTax += remainingIncome * 0.39;
      breakdown.push({
        label: `39% on remaining ${remainingIncome.toLocaleString()}`,
        value: remainingIncome * 0.39,
      });
    }
    return {
      grossAnnualIncome,
      totalDeductions,
      taxableIncome,
      totalTax,
      monthlyTax: totalTax / 12,
      breakdown,
    };
  }

  // Savings Advice Generation (same as before)
  function generateSavingsAdvice(data, initialResults) {
    // ... (This function remains unchanged) ...
    const adviceList = [];
    const formatCurrency = (num) =>
      `NPR ${num.toLocaleString("en-NP", { minimumFractionDigits: 0 })}`;
    const MAX_RETIREMENT_DEDUCTION = 500000;
    const currentRetirementContribution =
      (data.fundType === "epf" ? data.epf : data.ssf) + data.cit;
    if (currentRetirementContribution < MAX_RETIREMENT_DEDUCTION) {
      const potentialIncrease =
        MAX_RETIREMENT_DEDUCTION - currentRetirementContribution;
      const newData = { ...data };
      if (newData.fundType === "epf") newData.epf += potentialIncrease;
      else newData.ssf += potentialIncrease;
      const taxSaved =
        initialResults.totalTax - calculateNepaliTax(newData).totalTax;
      if (taxSaved > 0)
        adviceList.push({
          title: "Maximize Your Retirement Savings",
          text: `You can contribute an additional <strong>${formatCurrency(
            potentialIncrease
          )}</strong> to your retirement funds. This could save you an additional <span class="savings-amount">${formatCurrency(
            taxSaved
          )}</span> in taxes.`,
        });
    }
    const MAX_LIFE_INSURANCE_DEDUCTION = 40000;
    if (data.lifeInsurance < MAX_LIFE_INSURANCE_DEDUCTION) {
      const taxSaved =
        initialResults.totalTax -
        calculateNepaliTax({
          ...data,
          lifeInsurance: MAX_LIFE_INSURANCE_DEDUCTION,
        }).totalTax;
      if (taxSaved > 0)
        adviceList.push({
          title: "Secure Your Future with Life Insurance",
          text: `Investing up to <strong>${formatCurrency(
            MAX_LIFE_INSURANCE_DEDUCTION
          )}</strong> provides security for your loved ones and could save you <span class="savings-amount">${formatCurrency(
            taxSaved
          )}</span> on your tax bill.`,
        });
    }
    const MAX_HEALTH_INSURANCE_DEDUCTION = 20000;
    if (data.healthInsurance < MAX_HEALTH_INSURANCE_DEDUCTION) {
      const taxSaved =
        initialResults.totalTax -
        calculateNepaliTax({
          ...data,
          healthInsurance: MAX_HEALTH_INSURANCE_DEDUCTION,
        }).totalTax;
      if (taxSaved > 0)
        adviceList.push({
          title: "Protect Yourself with Health Insurance",
          text: `You can claim a deduction for up to <strong>${formatCurrency(
            MAX_HEALTH_INSURANCE_DEDUCTION
          )}</strong>. Maximizing this could save you <span class="savings-amount">${formatCurrency(
            taxSaved
          )}</span> in taxes.`,
        });
    }
    return adviceList;
  }

  /**
   * NEW: Renders the bar chart.
   */
  function renderSavingsChart(data, initialResults) {
    // Destroy the previous chart instance if it exists
    if (taxChart) {
      taxChart.destroy();
    }

    const MAX_RETIREMENT = 500000,
      MAX_LIFE = 40000,
      MAX_HEALTH = 20000;

    // Calculate actual contributions
    const actualRetirement = Math.min(
      (data.fundType === "epf" ? data.epf : data.ssf) + data.cit,
      MAX_RETIREMENT
    );
    const actualLife = Math.min(data.lifeInsurance, MAX_LIFE);
    const actualHealth = Math.min(data.healthInsurance, MAX_HEALTH);

    // Calculate actual vs potential tax savings
    const taxWithNoDeductions = calculateNepaliTax({
      ...data,
      epf: 0,
      cit: 0,
      ssf: 0,
      lifeInsurance: 0,
      healthInsurance: 0,
    }).totalTax;
    const actualTaxSavings = taxWithNoDeductions - initialResults.totalTax;

    const dataWithMaxDeductions = {
      ...data,
      lifeInsurance: MAX_LIFE,
      healthInsurance: MAX_HEALTH,
    };
    if (data.fundType === "epf") {
      dataWithMaxDeductions.epf = MAX_RETIREMENT;
      dataWithMaxDeductions.cit = 0;
    } else {
      dataWithMaxDeductions.ssf = MAX_RETIREMENT;
      dataWithMaxDeductions.cit = 0;
    }
    const potentialTaxSavings =
      taxWithNoDeductions - calculateNepaliTax(dataWithMaxDeductions).totalTax;

    const chartData = {
      labels: [
        "Retirement Fund",
        "Life Insurance",
        "Health Insurance",
        "Tax Saved",
      ],
      datasets: [
        {
          label: "Your Actual Amount",
          data: [actualRetirement, actualLife, actualHealth, actualTaxSavings],
          backgroundColor: "rgba(42, 157, 143, 0.7)", // --secondary-color
          borderColor: "rgba(42, 157, 143, 1)",
          borderWidth: 1,
        },
        {
          label: "Potential Amount",
          data: [MAX_RETIREMENT, MAX_LIFE, MAX_HEALTH, potentialTaxSavings],
          backgroundColor: "rgba(30, 75, 106, 0.7)", // --primary-color
          borderColor: "rgba(30, 75, 106, 1)",
          borderWidth: 1,
        },
      ],
    };

    const ctx = chartCanvas.getContext("2d");
    taxChart = new Chart(ctx, {
      type: "bar",
      data: chartData,
      options: {
        responsive: true,
        plugins: {
          legend: { position: "top" },
          tooltip: {
            callbacks: {
              label: function (context) {
                let label = context.dataset.label || "";
                if (label) {
                  label += ": ";
                }
                if (context.parsed.y !== null) {
                  label += new Intl.NumberFormat("en-NP", {
                    style: "currency",
                    currency: "NPR",
                    minimumFractionDigits: 0,
                  }).format(context.parsed.y);
                }
                return label;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function (value) {
                return new Intl.NumberFormat("en-NP", {
                  notation: "compact",
                }).format(value);
              },
            },
          },
        },
      },
    });
  }

  /**
   * Main Display Function - Now calls the chart renderer
   */
  function displayResults(results, data, advice) {
    const formatCurrency = (num) =>
      `NPR ${num.toLocaleString("en-NP", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

    // Render Summary
    resultsSummary.innerHTML = `<h2>Calculation Summary</h2>...`; // (Content from before)
    resultsSummary.innerHTML = `<div ... > ... </div>`; // (Same content as previous step)
    resultsSummary.innerHTML = `<h2>Calculation Summary</h2><div class="result-row"><span>Gross Annual Income:</span><span>${formatCurrency(
      results.grossAnnualIncome
    )}</span></div><div class="result-row"><span>Total Deductions:</span><span>${formatCurrency(
      results.totalDeductions
    )}</span></div><div class="result-row"><span><strong>Taxable Income:</strong></span><span><strong>${formatCurrency(
      results.taxableIncome
    )}</strong></span></div><div class="total-tax-row"><span class="label">Total Yearly Tax Liability</span><span class="value">${formatCurrency(
      results.totalTax
    )}</span></div><div class="result-row" style="margin-top: 15px;"><span><strong>Average Monthly Tax:</strong></span><span><strong>${formatCurrency(
      results.monthlyTax
    )}</strong></span></div>`;

    // Render Breakdown
    let breakdownHtml = '<h3 class="breakdown-title">Tax Breakdown</h3>';
    if (results.breakdown.length > 0) {
      results.breakdown.forEach((slab) => {
        breakdownHtml += `<div class="breakdown-row"><span class="slab-info">${
          slab.label
        }</span><span class="slab-tax">${formatCurrency(
          slab.value
        )}</span></div>`;
      });
    } else {
      breakdownHtml += '<p style="text-align:center;">No tax liability.</p>';
    }
    resultsBreakdown.innerHTML = breakdownHtml;

    // Render Take-Home Summary
    const takeHomeAnnual =
      results.grossAnnualIncome - results.totalDeductions - results.totalTax;
    takeHomeSummary.innerHTML = `<h3 class="take-home-title">Estimated Take-Home Salary</h3><div class="take-home-values"><div class="value-box"><p>Annually</p><span class="amount">${formatCurrency(
      takeHomeAnnual
    )}</span></div><div class="value-box"><p>Monthly Average</p><span class="amount">${formatCurrency(
      takeHomeAnnual / 12
    )}</span></div></div>`;

    // Render Chart
    renderSavingsChart(data, results);

    // Render Savings Advisor
    let advisorHtml =
      '<h3 class="advisor-title">Personalized Savings Advisor</h3>';
    if (advice.length > 0) {
      advice.forEach((item) => {
        advisorHtml += `<div class="advice-card"><h4>${item.title}</h4><p>${item.text}</p></div>`;
      });
    } else {
      advisorHtml +=
        '<p style="text-align:center;">You are already maximizing your available tax deductions. Great job!</p>';
    }
    savingsAdvisor.innerHTML = advisorHtml;

    resultsContainer.classList.remove("hidden");
  }
});
