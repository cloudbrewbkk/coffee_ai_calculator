// ---------- ORIGIN DATABASE ----------
const origins = [
  "Ethiopia","Kenya","Colombia","Guatemala","Brazil",
  "Costa Rica","Panama","El Salvador","Honduras",
  "Peru","Nicaragua","Mexico","Rwanda","Burundi",
  "Uganda","Tanzania","Indonesia","Sumatra",
  "Java","Papua New Guinea","Vietnam","Thailand",
  "Laos","Myanmar","Yemen"
];

// ---------- GLOBAL STATE ----------
let lastRecipe = null;

// ---------- EXTRACTION SCORE ----------
function extractionScore(roast, process, origin, flavor, style) {
  let score = 50;

  if (roast === "light") score += 15;
  if (roast === "dark") score -= 15;

  if (process === "washed") score += 10;
  if (process === "natural") score -= 10;
  if (process === "honey") score -= 5;

  if (["Ethiopia","Kenya","Rwanda"].includes(origin)) score += 10;
  else if (["Colombia","Guatemala","Costa Rica"].includes(origin)) score += 5;
  else if (["Brazil","Vietnam","Indonesia"].includes(origin)) score -= 5;

  if (flavor === "floral") score -= 5;
  if (flavor === "chocolate") score += 5;

  if (style === "fruity") score -= 5;
  if (style === "body") score += 5;

  return Math.max(30, Math.min(score, 80));
}

// ---------- AUTO DOSE ----------
function autoDose(style, roast) {
  let dose = 18;
  if (style === "fruity") dose -= 2;
  if (style === "body") dose += 2;
  if (roast === "light") dose += 1;
  return Math.min(Math.max(dose, 14), 22);
}

// ---------- BASE RECIPE ----------
function baseRecipe(score, dose) {
  let temp = 90 + (score - 30) * 0.1;
  let ratio = 14 + (80 - score) / 10;
  let water = dose * ratio;
  let time = 2.0 + (score - 50) / 50;

  let grind = "medium";
  if (score > 65) grind = "medium-fine";
  if (score < 45) grind = "medium-coarse";

  return { temp, ratio, water, time, grind, dose };
}

// ---------- DRIPPER ADJUSTMENT ----------
function adjustByDripper(recipe, dripper) {
  const fast = ["V60","Origami","Cone"];
  const slow = ["Kalita","Flat","Melitta"];

  if (fast.includes(dripper)) {
    recipe.temp += 1;
    recipe.time += 0.3;
    recipe.grind = "finer";
  }

  if (slow.includes(dripper)) {
    recipe.temp -= 1;
    recipe.time -= 0.2;
    recipe.grind = "coarser";
  }

  return recipe;
}

// ---------- OPTIMIZER ----------
function optimize(recipe, score) {
  let best = recipe;
  let bestScore = 0;

  for (let i = -2; i <= 2; i++) {
    let test = { ...recipe };
    test.temp += i;
    test.time += i * 0.1;
    let predicted = score - Math.abs(i * 2);
    if (predicted > bestScore) {
      bestScore = predicted;
      best = test;
    }
  }

  return best;
}

// ---------- RENDER RECIPE ----------
function renderRecipe(recipe, score, containerId) {
  const el = document.getElementById(containerId);
  const pct = Math.round(((score - 30) / 50) * 100);

  el.innerHTML = `
    <div class="recipe-grid">
      <div class="recipe-stat">
        <div class="recipe-stat-label">Coffee</div>
        <div class="recipe-stat-value">${recipe.dose}<span class="recipe-stat-unit">g</span></div>
      </div>
      <div class="recipe-stat">
        <div class="recipe-stat-label">Water</div>
        <div class="recipe-stat-value">${Math.round(recipe.water)}<span class="recipe-stat-unit">ml</span></div>
      </div>
      <div class="recipe-stat">
        <div class="recipe-stat-label">Ratio</div>
        <div class="recipe-stat-value">1<span class="recipe-stat-unit">:${recipe.ratio.toFixed(1)}</span></div>
      </div>
      <div class="recipe-stat">
        <div class="recipe-stat-label">Temperature</div>
        <div class="recipe-stat-value">${recipe.temp.toFixed(1)}<span class="recipe-stat-unit">°C</span></div>
      </div>
      <div class="recipe-stat">
        <div class="recipe-stat-label">Grind</div>
        <div class="recipe-stat-value" style="font-size:16px;">${recipe.grind}</div>
      </div>
      <div class="recipe-stat">
        <div class="recipe-stat-label">Brew Time</div>
        <div class="recipe-stat-value">${recipe.time.toFixed(2)}<span class="recipe-stat-unit">min</span></div>
      </div>
    </div>
    <div class="extraction-bar-wrap">
      <div class="extraction-label-row">
        <span class="extraction-label">Extraction Level</span>
        <span class="extraction-value">${score}/80</span>
      </div>
      <div class="extraction-bar-bg">
        <div class="extraction-bar-fill" style="width: ${pct}%"></div>
      </div>
    </div>
  `;
}

// ---------- RENDER ADJUSTED ----------
function renderAdjusted(recipe) {
  document.getElementById("adjusted-recipe").style.display = "block";
  document.getElementById("adjusted-content").innerHTML = `
    <div class="adjusted-grid">
      <div class="adjusted-stat">
        <div class="recipe-stat-label">Temperature</div>
        <div class="recipe-stat-value">${recipe.temp.toFixed(1)}<span class="recipe-stat-unit" style="color:var(--text-muted)">°C</span></div>
      </div>
      <div class="adjusted-stat">
        <div class="recipe-stat-label">Grind</div>
        <div class="recipe-stat-value" style="font-size:14px;">${recipe.grind}</div>
      </div>
      <div class="adjusted-stat">
        <div class="recipe-stat-label">Brew Time</div>
        <div class="recipe-stat-value">${recipe.time.toFixed(2)}<span class="recipe-stat-unit" style="color:var(--text-muted)">min</span></div>
      </div>
    </div>
  `;
}

// ---------- CALCULATE ----------
function calculate() {
  const roast = document.getElementById("roast").value;
  const process = document.getElementById("process").value;
  const origin = document.getElementById("origin").value;
  const flavor = document.getElementById("flavor").value;
  const style = document.getElementById("style").value;
  const dripper = document.getElementById("dripper").value;

  const score = extractionScore(roast, process, origin, flavor, style);
  const dose = autoDose(style, roast);
  let recipe = baseRecipe(score, dose);
  recipe = adjustByDripper(recipe, dripper);
  recipe = optimize(recipe, score);

  // Store for feedback
  lastRecipe = { roast, process, origin, flavor, style, dripper, recipe: { ...recipe }, score };

  // Show result card
  const resultCard = document.getElementById("result-card");
  resultCard.style.display = "block";
  resultCard.style.animation = "none";
  void resultCard.offsetWidth;
  resultCard.style.animation = "fadeUp 0.5s ease both";

  // Render recipe
  renderRecipe(recipe, score, "result");

  // Reset adjusted recipe
  document.getElementById("adjusted-recipe").style.display = "none";

  // Show feedback
  const feedbackBox = document.getElementById("feedback-box");
  feedbackBox.style.display = "block";
  feedbackBox.style.animation = "none";
  void feedbackBox.offsetWidth;
  feedbackBox.style.animation = "fadeUp 0.5s ease 0.1s both";

  // Reset feedback UI
  document.querySelectorAll(".taste-btn").forEach(b => b.classList.remove("active"));
  document.getElementById("taste").value = "";
  document.getElementById("otherText").value = "";
  document.getElementById("other-field").style.display = "none";
  document.getElementById("consent").checked = false;
  document.getElementById("feedback-success").style.display = "none";

  // Scroll to result
  setTimeout(() => resultCard.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
}

// ---------- FEEDBACK ----------
function submitFeedback() {
  const taste = document.getElementById("taste").value;
  const other = document.getElementById("otherText").value;
  const consent = document.getElementById("consent").checked;

  if (!lastRecipe) return;

  if (!taste) {
    alert("Please select a taste option first.");
    return;
  }

  const feedbackData = {
    ...lastRecipe,
    taste: taste === "other" ? (other || "other") : taste,
    timestamp: new Date().toISOString()
  };

  // Save to localStorage if consented
  if (consent) {
    try {
      let data = JSON.parse(localStorage.getItem("coffee_ai_data")) || [];
      data.push(feedbackData);
      localStorage.setItem("coffee_ai_data", JSON.stringify(data));
    } catch (e) {
      console.warn("localStorage unavailable:", e);
    }
  }

  // Apply AI learning
  if (taste !== "good") {
    applyLearning(taste);
  }

  // Show success
  document.getElementById("feedback-success").style.display = "block";
}

// ---------- DOM INIT ----------
document.addEventListener("DOMContentLoaded", () => {
  // Populate origins dropdown
  const originSelect = document.getElementById("origin");
  origins.forEach(o => {
    const opt = document.createElement("option");
    opt.value = o;
    opt.textContent = o;
    originSelect.appendChild(opt);
  });

  // Dripper toggle buttons
  document.querySelectorAll(".dripper-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".dripper-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById("dripper").value = btn.dataset.value;
    });
  });

  // Taste toggle buttons
  document.querySelectorAll(".taste-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".taste-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById("taste").value = btn.dataset.value;
      document.getElementById("other-field").style.display =
        btn.dataset.value === "other" ? "block" : "none";
    });
  });
});

// ---------- AI LEARNING ----------
function applyLearning(taste) {
  if (!lastRecipe) return;

  // Deep copy so we don't mutate the original
  let r = { ...lastRecipe.recipe };

  if (taste === "sour") {
    r.temp += 1;
    r.time += 0.2;
    r.grind = "finer";
  }

  if (taste === "bitter") {
    r.temp -= 1;
    r.time -= 0.2;
    r.grind = "coarser";
  }

  if (taste === "weak") {
    r.ratio -= 0.5;
    r.water = r.dose * r.ratio;
  }

  if (taste === "astringent" || taste === "defect") {
    r.temp -= 1;
    r.grind = "coarser";
  }

  // Update lastRecipe with adjusted values
  lastRecipe.recipe = r;

  // Render adjusted recipe in result card
  renderAdjusted(r);
}
