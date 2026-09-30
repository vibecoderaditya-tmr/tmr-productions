// TMR landing data — edit this file to change offerings, pricing, contact.
// Screenshots: drop 16:9 .webp files into img/showcase/<slug>.webp
// (missing files automatically fall back to a styled name tile).
var DISCORD_URL = "https://discord.gg/YOUR_INVITE";

var OFFERINGS = [
  { slug: "live-ticker", name: "Alive <span>Status</span>", tag: "Live Ticker", demo: "live-ticker.html",
    feats: ["Real-time alive & elimination tracking", "Auto-sorting animated rows", "Observer + alternate highlights"] },
  { slug: "ospt", name: "Overall <span>Standings</span>", tag: "Points Table", demo: "osPt.html",
    feats: ["12 / 18 team two-sided layouts", "Rank-movement indicators", "Map-wise booyah strip"] },
  { slug: "permatchpt", name: "Per Match <span>Points</span>", tag: "Points Table", demo: "perMatchPt.html",
    feats: ["Match-wise leaderboard", "Booyah top box", "Smart total tie-breakers"] },
  { slug: "winner", name: "Champion <span>Winner</span>", tag: "Match End", demo: "winner.html",
    feats: ["Winning team showcase", "Player stats & contribution bars", "Auto MVP badge"] },
  { slug: "hud", name: "HUD <span>Overlay</span>", tag: "In-Game", demo: "hud.html",
    feats: ["Killfeed + achievements", "Live match info strip", "Caster-friendly layout"] },
  { slug: "caster-predictions", name: "Caster <span>Predictions</span>", tag: "Pre-Show", demo: "castersPredictions.html",
    feats: ["Caster pick cards", "Team logos + tags", "Prediction reveals"] },
  { slug: "team-stats", name: "Team <span>Stats</span>", tag: "Analysis", demo: "teamStats.html",
    feats: ["Booyah team deep-dive", "Match-wise breakdowns", "Broadcast-ready styling"] },
  { slug: "random-map", name: "Random <span>Map</span>", tag: "Utility", demo: "randomMap.html",
    feats: ["Fullscreen map randomizer", "OBS browser-source ready", "One-click re-roll"] }
];

var PLANS = [
  { name: "Single Event", price: "\u20B9X,XXX", per: "per event", hot: false,
    feats: ["All overlays, one tournament", "Setup walkthrough", "Match-day support"] },
  { name: "Monthly", price: "\u20B9X,XXX", per: "per month", hot: true,
    feats: ["Everything in Single Event", "Multiple tournaments", "Priority support"] },
  { name: "Custom", price: "\u20B9X,XXX", per: "tailored", hot: false,
    feats: ["Seasons & leagues", "Custom branding", "Dedicated support"] }
];

function shotHTML(o) {
  return '<div class="shot">' +
    '<div class="shot-fallback">' + o.name.replace(/<[^>]*>/g, "") + '</div>' +
    '<img src="img/showcase/' + o.slug + '.webp" alt="' + o.name.replace(/<[^>]*>/g, "") + '" loading="lazy" onerror="this.classList.add(\'missing\')">' +
  '</div>';
}

function renderOfferings() {
  var grid = document.getElementById("offer-grid");
  if (!grid) return;
  var html = "";
  for (var i = 0; i < OFFERINGS.length; i++) {
    var o = OFFERINGS[i];
    html += '<a class="card" href="' + o.demo + '">' +
      shotHTML(o) +
      '<div class="card-body">' +
        '<div class="card-tag">' + o.tag + '</div>' +
        '<div class="card-title">' + o.name + '</div>' +
        '<ul class="card-feats">' +
          '<li>' + o.feats[0] + '</li>' +
          '<li>' + o.feats[1] + '</li>' +
          '<li>' + o.feats[2] + '</li>' +
        '</ul>' +
        '<div class="card-demo">Open live demo \u27F6</div>' +
      '</div>' +
    '</a>';
  }
  grid.innerHTML = html;
}

function renderPlans() {
  var wrap = document.getElementById("plan-grid");
  if (!wrap) return;
  var html = "";
  for (var i = 0; i < PLANS.length; i++) {
    var p = PLANS[i];
    html += '<div class="plan' + (p.hot ? ' hot' : '') + '">' +
      '<div class="plan-name">' + p.name + '</div>' +
      '<div class="plan-price">' + p.price + '</div>' +
      '<div class="plan-per">' + p.per + '</div>' +
      '<ul class="plan-feats">' +
        '<li>' + p.feats[0] + '</li>' +
        '<li>' + p.feats[1] + '</li>' +
        '<li>' + p.feats[2] + '</li>' +
      '</ul>' +
    '</div>';
  }
  wrap.innerHTML = html;
}

function wireContact() {
  var btns = document.querySelectorAll("[data-discord]");
  for (var i = 0; i < btns.length; i++) btns[i].href = DISCORD_URL;
}

// Past work, in stream-time order (latest first). Replace link:"#" with
// the YouTube URLs when ready — display order follows array order.
var PROJECTS = [
  { title: "STREAM 1", link: "#" },
  { title: "STREAM 2", link: "#" },
  { title: "STREAM 3", link: "#" },
  { title: "STREAM 4", link: "#" },
  { title: "STREAM 5", link: "#" },
  { title: "STREAM 6", link: "#" },
  { title: "STREAM 7", link: "#" },
  { title: "STREAM 8", link: "#" },
  { title: "STREAM 9", link: "#" },
  { title: "STREAM 10", link: "#" }
];

function renderProjects() {
  var list = document.getElementById("project-list");
  if (!list) return;
  var html = "";
  for (var i = 0; i < PROJECTS.length; i++) {
    var p = PROJECTS[i];
    var num = (i + 1 < 10 ? "0" + (i + 1) : "" + (i + 1));
    var live = p.link && p.link !== "#";
    html += '<a class="proj' + (i >= 6 ? ' beyond' : '') + '" href="' + p.link + '"' + (live ? ' target="_blank" rel="noopener"' : '') + '>' +
      '<span class="proj-num">' + num + '</span>' +
      '<span class="proj-play">\u25B6</span>' +
      '<span class="proj-title">' + p.title + '</span>' +
      '<span class="proj-link">' + (live ? 'WATCH' : 'LINK SOON') + '</span>' +
    '</a>';
  }
  list.innerHTML = html;
  var moreBtn = document.getElementById("proj-more");
  if (moreBtn) {
    if (PROJECTS.length <= 6) { moreBtn.style.display = "none"; }
    else {
      moreBtn.style.display = "";
      moreBtn.textContent = list.classList.contains("open") ? "SEE LESS" : "SEE MORE (" + (PROJECTS.length - 6) + " MORE)";
    }
  }
}

function toggleProjects() {
  var list = document.getElementById("project-list");
  var moreBtn = document.getElementById("proj-more");
  if (!list || !moreBtn) return;
  var open = list.classList.toggle("open");
  moreBtn.textContent = open ? "SEE LESS" : "SEE MORE (" + (PROJECTS.length - 6) + " MORE)";
}

renderOfferings();
renderPlans();
renderProjects();
wireContact();
