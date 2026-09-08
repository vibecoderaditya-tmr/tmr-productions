const firebaseConfig = {
  apiKey:            "AIzaSyC21mdsgyIEqXT7ujFbi0xcVAMRZxxqB1I",
  authDomain:        "tmraditya-1ceb7.firebaseapp.com",
  databaseURL:       "https://tmraditya-1ceb7-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId:         "tmraditya-1ceb7",
  storageBucket:     "tmraditya-1ceb7.firebasestorage.app",
  messagingSenderId: "317037791388",
  appId:             "1:317037791388:web:755b5a18bb77aa140a4559"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

function escImg(name) {
  return name.replace(/[#$[\]]/g, '_');
}

function skillImg(name) {
  if (!name) return '';
  var up = name.toUpperCase();
  var idx = up.indexOf('AWAKEN');
  if (idx !== -1) {
    var before = name.substring(0, idx).trim().split(/\s+/);
    return before[before.length - 1] + ' Awaken';
  }
  return name;
}

function setImage(cls, i, path) {
  var imgs = document.querySelectorAll('.' + cls);
  if (imgs[i]) imgs[i].src = path;
}

function cleanWeapon(name) {
  if (!name) return '';
  var w = name.replace(/\(.*?\)/g, '');
  w = w.replace(/^Gold/i, '');
  w = w.replace(/-I$|-II$|-III$|-IV$|-V$|-X$|-Y$|-SUM$/i, '');
  w = w.replace(/-Gold$/i, '');
  return w.trim().toUpperCase();
}

db.ref("/matches").once("value", function(snap) {
  var matches = snap.val();
  if (!matches) return;

  var maxNum = 0;
  var maxKey = null;
  for (var key in matches) {
    if (key.indexOf('match') !== 0) continue;
    var num = parseInt(key.replace('match', ''), 10);
    if (isFinite(num) && num > maxNum) { maxNum = num; maxKey = key; }
  }
  if (!maxKey || !matches[maxKey] || !matches[maxKey].teams) return;

  var teams = matches[maxKey].teams;
  var rank1Tag = null;
  for (var tag in teams) {
    if (teams[tag].rank === 1) { rank1Tag = tag; break; }
  }
  if (!rank1Tag || !teams[rank1Tag].players) return;

  var players = teams[rank1Tag].players;
  var idx = 0;
  for (var uid in players) {
    if (idx >= 4) break;
    var p = players[uid];

    var s1 = p.passiveSkill1 || '';
    var s2 = p.passiveSkill2 || '';
    var s3 = p.passiveSkill3 || '';
    var pet = p.petName || '';

    if (s1) setImage('ts-skill', idx * 3 + 0, 'img/charIcons/' + escImg(skillImg(s1)) + '.webp');
    if (s2) setImage('ts-skill', idx * 3 + 1, 'img/charIcons/' + escImg(skillImg(s2)) + '.webp');
    if (s3) setImage('ts-skill', idx * 3 + 2, 'img/charIcons/' + escImg(skillImg(s3)) + '.webp');
    if (pet) setImage('ts-pet', idx, 'img/pets/' + escImg(pet) + '.webp');
    var charImg = (p.activeSkill == '-1' || p.activeSkill === -1) ? 'Primis' : p.activeSkill;
    if (charImg) setImage('ts-char', idx, 'img/characters/' + escImg(charImg) + '.webp');

    if (p.weapon && p.weapon.length) {
      var best = p.weapon[0];
      for (var w = 1; w < p.weapon.length; w++) {
        if (p.weapon[w].kill > best.kill) best = p.weapon[w];
        else if (p.weapon[w].kill === best.kill && p.weapon[w].damage > best.damage) best = p.weapon[w];
      }
      if (best.weapon) setImage('ts-weapon', idx, 'img/weapons/' + escImg(cleanWeapon(best.weapon)) + '.webp');
    }

    idx++;
  }
});

db.ref("/live-graphics/theme/teamStats").on("value", function(snap) {
  var t = snap.val();
  if (!t) return;
  var root = document.documentElement;
  function _h(v) { return typeof v === "string" && v[0] === "#"; }
  if (_h(t.leftBg))      root.style.setProperty("--ts-left-bg", t.leftBg);
  if (_h(t.rightBg))     root.style.setProperty("--ts-right-bg", t.rightBg);
  if (_h(t.borderColor)) root.style.setProperty("--ts-border-color", t.borderColor);
});

db.ref("/live-graphics/editor/teamStats").on("value", function(snap) {
  var vals = snap.val();
  if (!vals) return;
  var root = document.documentElement;
  for (var key in vals) {
    var num = parseFloat(vals[key]);
    if (isFinite(num)) root.style.setProperty("--" + key, num + "px");
  }
});

db.ref("/live-graphics/fonts/config").on("value", function(snap) {
  var cfg = snap.val();
  var root = document.documentElement;
  if (!cfg || !cfg.pages || !cfg.pages.teamStats) { root.style.removeProperty("--font-primary"); return; }
  if (!cfg.fontFamily || !cfg.fontFile) return;
  var s = document.createElement("style");
  s.id = "dyn-font-teamstats";
  s.textContent = "@font-face{font-family:'" + cfg.fontFamily + "';src:url('" + cfg.fontFile + "') format('" + cfg.fontFormat + "');}";
  var old = document.getElementById("dyn-font-teamstats");
  if (old) old.remove();
  document.head.appendChild(s);
  root.style.setProperty("--font-primary", cfg.fontFamily);
});
