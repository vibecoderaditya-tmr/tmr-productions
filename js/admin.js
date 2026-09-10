var firebaseConfig = {
  apiKey: "AIzaSyB-KqHqavh4Cu6VJz16DkP-GOYlIjNLNcI",
  authDomain: "tmraditya-1ceb7.firebaseapp.com",
  databaseURL: "https://tmraditya-1ceb7-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tmraditya-1ceb7",
  storageBucket: "tmraditya-1ceb7.appspot.com",
  messagingSenderId: "852110646661",
  appId: "1:852110646661:web:09a4be17f81f60f387a2b9"
};

firebase.initializeApp(firebaseConfig);
var db = firebase.database();
var configRef = db.ref("/matches/config/teams");
var matchRef = db.ref("/matches");

var teams = [];
var slotAssignments = {};
var matchCount = 0;
var activeTab = "live";

configRef.on("value", function(snap) {
  var val = snap.val();
  if (!val) return;
  teams = Array.isArray(val) ? val : Object.values(val);
renderLivePanel();

document.addEventListener("click", function(e) {
  var btn = e.target.closest(".pts-btn");
  if (!btn) return;
  var slot = btn.dataset.slot;
  var siblings = btn.parentElement.querySelectorAll(".pts-btn");
  siblings.forEach(function(b) { b.classList.remove("active"); });
  btn.classList.add("active");
});
  renderMatchPanels();
});

matchRef.on("value", function(snap) {
  var val = snap.val();
  if (!val) { matchCount = 0; updateCopyBtn(); return; }
  var count = 0;
  for (var k in val) {
    if (k.indexOf("match") === 0 && isFinite(parseInt(k.replace("match","")))) count++;
  }
  matchCount = count;
  updateCopyBtn();
});

function renderLivePanel() {
  var body = document.getElementById("live-body");
  if (!body) return;
  body.innerHTML = "";
  for (var i = 0; i < 12; i++) {
    var row = document.createElement("div");
    row.className = "slot-row";
    var t = teams[i] || null;
    var tag = t ? (t.tag || "") : "";
    var ptsHtml = '<div class="pts-btns">';
    for (var p = 0; p <= 4; p++) {
      ptsHtml += '<button class="pts-btn" data-slot="' + (i+1) + '" data-pts="' + p + '">' + p + '</button>';
    }
    ptsHtml += '</div>';
    row.innerHTML =
      '<div class="slot-num">' + (i + 1) + '</div>' +
      '<div class="slot-team">' +
        (tag || '<span style="color:#555">—</span>') +
      '</div>' +
      ptsHtml;
    body.appendChild(row);
  }
}

function renderMatchPanels() {
  for (var m = 1; m <= matchCount; m++) {
    (function(num) {
      var panel = document.getElementById("match-" + num + "-panel");
      if (!panel) return;
      var body = document.getElementById("match-" + num + "-body");
      if (!body) return;
      body.innerHTML = "";
      matchRef.child("match" + num + "/config/teams").once("value", function(snap) {
        var val = snap.val();
        var mTeams = val ? (Array.isArray(val) ? val : Object.values(val)) : [];
        for (var i = 1; i <= 12; i++) {
          var row = document.createElement("div");
          row.className = "slot-row";
          var assigned = mTeams[i - 1] || null;
          var tag = assigned ? assigned.tag || "" : "";
          var ptsHtml = '<div class="pts-btns">';
          for (var p = 0; p <= 4; p++) {
            ptsHtml += '<button class="pts-btn" data-slot="' + i + '" data-pts="' + p + '">' + p + '</button>';
          }
          ptsHtml += '</div>';
          row.innerHTML =
            '<div class="slot-num">' + i + '</div>' +
            '<div class="slot-team">' +
              (tag || '<span style="color:#555">—</span>') +
            '</div>' +
            ptsHtml;
          body.appendChild(row);
        }
      });
    })(m);
  }
}

function copyToMatch() {
  var nextNum = matchCount + 1;
  var data = teams.map(function(t) {
    return { tag: t.tag, teamName: t.teamName, headStartPTS: t.headStartPTS || 0 };
  });
  matchRef.child("match" + nextNum + "/config/teams").set(data);
  addMatchTab(nextNum);
}

function addMatchTab(num) {
  var nav = document.getElementById("admin-nav");
  var btn = document.createElement("button");
  btn.className = "nav-btn";
  btn.textContent = "MATCH " + num;
  btn.dataset.tab = "match-" + num;
  btn.onclick = function() { switchTab("match-" + num); };
  nav.appendChild(btn);

  var panel = document.createElement("div");
  panel.className = "admin-panel match-panel hidden";
  panel.id = "match-" + num + "-panel";
  panel.innerHTML =
    '<div class="panel-header">' +
      '<div class="slot-header">SLOT</div>' +
      '<div class="team-header">TEAMS</div>' +
    '</div>' +
    '<div class="panel-body" id="match-' + num + '-body"></div>';
  document.body.insertBefore(panel, document.querySelector(".copy-bar"));
  renderMatchPanels();
}

function switchTab(tab) {
  activeTab = tab;
  var allBtns = document.querySelectorAll(".nav-btn");
  allBtns.forEach(function(b) { b.classList.remove("active"); });
  var targetBtn = document.querySelector('[data-tab="' + tab + '"]');
  if (targetBtn) targetBtn.classList.add("active");

  document.getElementById("live-panel").classList.add("hidden");
  for (var m = 1; m <= matchCount; m++) {
    var mp = document.getElementById("match-" + m + "-panel");
    if (mp) mp.classList.add("hidden");
  }

  if (tab === "live") {
    document.getElementById("live-panel").classList.remove("hidden");
  } else {
    var matchPanel = document.getElementById(tab + "-panel");
    if (matchPanel) matchPanel.classList.remove("hidden");
  }
}

function updateCopyBtn() {
  var numEl = document.getElementById("copy-num");
  if (numEl) numEl.textContent = matchCount + 1;
}

renderLivePanel();
