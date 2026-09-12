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

var currentMatch = "M1";
var selectedTeams = {};

db.ref("/live-graphics/caster2/casterName").once("value", function(snap) {
  if (!snap.val()) {
    document.getElementById("name-modal").classList.add("show");
    document.getElementById("name-input").focus();
  }
});

document.getElementById("name-submit").onclick = function() {
  var name = document.getElementById("name-input").value.trim();
  if (name) {
    db.ref("/live-graphics/caster2/casterName").set(name);
    document.getElementById("name-modal").classList.remove("show");
  }
};

document.getElementById("name-input").onkeydown = function(e) {
  if (e.key === "Enter") document.getElementById("name-submit").click();
};

function selectMatch(btn) {
  document.querySelectorAll(".match-btn").forEach(function(b) { b.classList.remove("active"); });
  btn.classList.add("active");
  currentMatch = btn.dataset.match;
  loadSelection();
}

function scrollMatches(dir) {
  var container = document.getElementById("match-btns");
  container.scrollBy({ left: dir * 120, behavior: "smooth" });
}

function toggleTeam(btn) {
  var tag = btn.dataset.tag;
  if (!selectedTeams[currentMatch]) selectedTeams[currentMatch] = [];

  var idx = selectedTeams[currentMatch].indexOf(tag);
  if (idx !== -1) {
    selectedTeams[currentMatch].splice(idx, 1);
    btn.classList.remove("active");
  } else {
    if (selectedTeams[currentMatch].length >= 3) return;
    selectedTeams[currentMatch].push(tag);
    btn.classList.add("active");
  }
}

function saveChoices() {
  var teams = selectedTeams[currentMatch] || [];
  db.ref("/live-graphics/caster2/" + currentMatch).set(teams.length ? teams : null);
  showToast("SAVED FOR " + currentMatch);
}

function resetChoices() {
  selectedTeams[currentMatch] = [];
  document.querySelectorAll(".team-row").forEach(function(r) { r.classList.remove("active"); });
  db.ref("/live-graphics/caster2/" + currentMatch).remove();
  showToast("RESET FOR " + currentMatch);
}

function showToast(msg) {
  var toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(function() { toast.classList.remove("show"); }, 2000);
}

function loadSelection() {
  document.querySelectorAll(".team-row").forEach(function(r) { r.classList.remove("active"); });
  var teams = selectedTeams[currentMatch] || [];
  teams.forEach(function(tag) {
    var row = document.querySelector('.team-row[data-tag="' + tag + '"]');
    if (row) row.classList.add("active");
  });
}

db.ref("/live-graphics/caster2").on("value", function(snap) {
  var val = snap.val() || {};
  for (var m in val) {
    if (m.indexOf("M") === 0) selectedTeams[m] = val[m];
  }
  loadSelection();
});

db.ref("/matches/config/teams").on("value", function(snap) {
  var val = snap.val();
  if (!val) return;
  var teams = Array.isArray(val) ? val : Object.values(val);
  var container = document.getElementById("caster-content");
  container.innerHTML = "";
  teams.forEach(function(t) {
    var row = document.createElement("div");
    row.className = "team-row";
    row.dataset.tag = t.tag;
    row.onclick = function() { toggleTeam(row); };
    row.innerHTML =
      '<div class="team-logo-fallback">' + t.tag + '</div>' +
      '<img class="team-logo" src="img/logos/' + t.tag + '.webp" alt="' + t.tag + '" onerror="this.style.display=\'none\';this.previousElementSibling.style.display=\'flex\'">' +
      '<div class="team-name">' + t.teamName + '</div>';
    container.appendChild(row);
  });
  loadSelection();
});
