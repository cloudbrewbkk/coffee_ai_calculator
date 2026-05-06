function extractionScore(roast, process, origin, flavor, style) {
  let score = 50;

  if (roast === "light") score += 15;
  if (roast === "dark") score -= 15;

  if (process === "washed") score += 10;
  if (process === "natural") score -= 10;
  if (process === "honey") score -= 5;

  if (origin === "Ethiopia") score += 10;
  if (origin === "Guatemala") score += 5;
  if (origin === "Brazil") score -= 5;

  if (flavor === "floral") score -= 5;
  if (flavor === "chocolate") score += 5;

  if (style === "fruity") score -= 5;
  if (style === "body") score += 5;

  return Math.max(30, Math.min(score, 80));
}

function calculateDose(cup, style) {
  let ratio = 15.5;

  if (style === "fruity") ratio = 17;
  if (style === "body") ratio = 14;

  let dose = cup / ratio;
  return Math.min(Math.max(dose, 12), 22).toFixed(1);
}

function mapRecipe(score, dose) {
  let temp = 90 + (score - 30) * 0.1;
  let ratio = 14 + (80 - score) / 10;
  let water = dose * ratio;
  let time = 2.0 + (score - 50) / 50;

  let grind = "medium";
  if (score > 65) grind = "medium-fine";
  if (score < 45) grind = "medium-coarse";

  return { temp, ratio, water, time, grind };
}

function adjustFlow(recipe, flow) {
  if (flow === "FAST") {
    recipe.temp += 1;
    recipe.time += 0.2;
    recipe.grind = "finer";
  }
  if (flow === "SLOW") {
    recipe.temp -= 1;
    recipe.time -= 0.2;
    recipe.grind = "coarser";
  }
  return recipe;
}

function calculate() {
  let roast = document.getElementById("roast").value;
  let process = document.getElementById("process").value;
  let origin = document.getElementById("origin").value;
  let flavor = document.getElementById("flavor").value;
  let style = document.getElementById("style").value;
  let cup = parseInt(document.getElementById("cup").value);
  let flow = document.getElementById("flow").value;

  let score = extractionScore(roast, process, origin, flavor, style);
  let dose = calculateDose(cup, style);
  let recipe = mapRecipe(score, parseFloat(dose));
  recipe = adjustFlow(recipe, flow);

  document.getElementById("result").innerHTML = `
    <h2>Result</h2>
    Coffee: ${dose} g<br>
    Water: ${Math.round(recipe.water)} ml<br>
    Ratio: 1:${recipe.ratio.toFixed(1)}<br>
    Temp: ${recipe.temp.toFixed(1)} °C<br>
    Grind: ${recipe.grind}<br>
    Time: ${recipe.time.toFixed(2)} min
  `;
}
