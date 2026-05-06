// ---------- ORIGIN DATABASE (ตลาดจริง) ----------
const origins = [
  "Ethiopia","Kenya","Colombia","Guatemala","Brazil",
  "Costa Rica","Panama","El Salvador","Honduras",
  "Peru","Nicaragua","Mexico","Rwanda","Burundi",
  "Uganda","Tanzania","Indonesia","Sumatra",
  "Java","Papua New Guinea","Vietnam","Thailand",
  "Laos","Myanmar","Yemen"
];

// ---------- EXTRACTION SCORE ----------
function extractionScore(roast, process, origin, flavor, style) {
  let score = 50;

  if (roast === "light") score += 15;
  if (roast === "dark") score -= 15;

  if (process === "washed") score += 10;
  if (process === "natural") score -= 10;
  if (process === "honey") score -= 5;

  // Origin density approximation
  if (["Ethiopia","Kenya","Rwanda"].includes(origin)) score += 10;
  else if (["Colombia","Guatemala","Costa Rica"].includes(origin)) score += 5;
  else if (["Brazil","Vietnam","Indonesia"].includes(origin)) score -= 5;

  if (flavor === "floral") score -= 5;
  if (flavor === "chocolate") score += 5;

  if (style === "fruity") score -= 5;
  if (style === "body") score += 5;

  return Math.max(30, Math.min(score, 80));
}

// ---------- AI DOSE (no cup size) ----------
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

  return { temp, ratio, water, time, grind };
}

// ---------- DRIPPER AI MODEL ----------
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

// ---------- AI OPTIMIZER ----------
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

// ---------- MAIN ----------
function calculate() {
  let roast = document.getElementById("roast").value;
  let process = document.getElementById("process").value;
  let origin = document.getElementById("origin").value;
  let flavor = document.getElementById("flavor").value;
  let style = document.getElementById("style").value;
  let dripper = document.getElementById("dripper").value;

  let score = extractionScore(roast, process, origin, flavor, style);

  let dose = autoDose(style, roast);

  let recipe = baseRecipe(score, dose);

  recipe = adjustByDripper(recipe, dripper);

  recipe = optimize(recipe, score);

  document.getElementById("result").innerHTML = `
    <h2>☕ AI Recipe</h2>
    Coffee: ${dose} g<br>
    Water: ${Math.round(recipe.water)} ml<br>
    Ratio: 1:${recipe.ratio.toFixed(1)}<br>
    Temp: ${recipe.temp.toFixed(1)} °C<br>
    Grind: ${recipe.grind}<br>
    Time: ${recipe.time.toFixed(2)} min
    <br><br>
    <b>AI Insight:</b><br>
    Extraction Level: ${score}/80
  `;
}
