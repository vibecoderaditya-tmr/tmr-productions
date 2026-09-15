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

function cleanSkillName(name) {
  if (!name) return '';
  var n = name.replace(/\s+Chip$/i, '');
  n = n.replace(/'[^']*'/g, '');
  return n.trim();
}

function setImage(cls, i, path) {
  var imgs = document.querySelectorAll('.' + cls);
  if (imgs[i]) imgs[i].src = path;
}

function setSkillName(i, s, name) {
  var els = document.querySelectorAll('.ts-skill-name');
  var idx = i * 3 + (s - 1);
  if (els[idx]) els[idx].textContent = name;
}

function setPetName(i, name) {
  var els = document.querySelectorAll('.ts-pet-name');
  if (els[i]) els[i].textContent = name;
}

function setLoadoutName(i, name) {
  var els = document.querySelectorAll('.ts-loadout-name');
  if (els[i]) els[i].textContent = name;
}

function setWeaponName(i, name) {
  var els = document.querySelectorAll('.ts-weapon-name');
  if (els[i]) els[i].textContent = name;
}

function setStatValue(i, stat, value) {
  var els = document.querySelectorAll('.ts-stat-value');
  var idx = i * 4 + ['kills', 'assists', 'knockDown', 'damage'].indexOf(stat);
  if (els[idx]) els[idx].textContent = value || 0;
}

function setOverlayName(i, name) {
  var els = document.querySelectorAll('.ts-overlay');
  if (els[i]) els[i].textContent = name;
}

function animateWrapper(idx, delay) {
  setTimeout(function() {
    var wraps = document.querySelectorAll('.ts-wrap');
    var wrap = wraps[idx];
    if (!wrap) return;

    var left = wrap.querySelector('.ts-left');
    var char = wrap.querySelector('.ts-char');
    var right = wrap.querySelector('.ts-right');
    var overlay = wrap.querySelector('.ts-overlay');
    var mvp = wrap.querySelector('.ts-mvp');
    var rows = wrap.querySelectorAll('.ts-row');

    left.classList.add('anim-in');

    left.addEventListener('animationend', function handler() {
      left.removeEventListener('animationend', handler);
      char.classList.add('anim-in');

      char.addEventListener('animationend', function handler2() {
        char.removeEventListener('animationend', handler2);
        right.classList.add('anim-in');

        right.addEventListener('animationend', function handler3() {
          right.removeEventListener('animationend', handler3);
          overlay.classList.add('anim-in');

          overlay.addEventListener('animationend', function handler4() {
            overlay.removeEventListener('animationend', handler4);
            if (mvp) mvp.classList.add('anim-in');

            function animateRow(rowIdx) {
              if (rowIdx >= rows.length) return;
              rows[rowIdx].classList.add('anim-in');
              rows[rowIdx].addEventListener('animationend', function handlerR() {
                rows[rowIdx].removeEventListener('animationend', handlerR);
                animateRow(rowIdx + 1);
              });
            }
            animateRow(0);
          });
        });
      });
    });
  }, delay);
}

function animateMvp(delay) {
  setTimeout(function() {
    var mvpEl = document.querySelector('.ts-mvp.active');
    if (mvpEl) mvpEl.classList.add('anim-in');
  }, delay);
}

function cleanWeapon(name) {
  if (!name) return '';
  var w = name.replace(/\(.*?\)/g, '');
  w = w.replace(/^Gold/i, '');
  w = w.replace(/-I$|-II$|-III$|-IV$|-V$|-X$|-Y$|-SUM$/i, '');
  w = w.replace(/-Gold$/i, '');
  return w.trim().toUpperCase();
}

db.ref("/matches").on("value", function(snap) {
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
    if (Number(teams[tag].rank) === 1) { rank1Tag = tag; break; }
  }
  console.log("[teamStats] latest:", maxKey, "rank1:", rank1Tag);
  if (!rank1Tag || !teams[rank1Tag].players) return;

  var players = teams[rank1Tag].players;
  var playerList = [];
  for (var uid in players) {
    playerList.push(players[uid]);
  }

  var mvpIdx = 0;
  var mvpKills = -1;
  var mvpDamage = -1;
  for (var i = 0; i < playerList.length && i < 4; i++) {
    var pk = playerList[i].kills || 0;
    var pd = playerList[i].damage || 0;
    if (pk > mvpKills || (pk === mvpKills && pd > mvpDamage)) {
      mvpKills = pk;
      mvpDamage = pd;
      mvpIdx = i;
    }
  }

  for (var idx = 0; idx < playerList.length && idx < 4; idx++) {
    var p = playerList[idx];

    var charName = String(p.activeSkill || '');
    charName = charName.replace(/\s+Chip$/i, '');
    var charImg = (charName === '-1') ? 'Primis' : charName;
    if (charImg) setImage('ts-char', idx, 'img/characters/' + escImg(charImg) + '.webp');

    var s1 = p.passiveSkill1 || '';
    var s2 = p.passiveSkill2 || '';
    var s3 = p.passiveSkill3 || '';
    var pet = p.petName || '';

    if (s1) { setImage('ts-skill', idx * 3 + 0, 'img/charIcons/' + escImg(skillImg(cleanSkillName(s1))) + '.webp'); setSkillName(idx, 1, cleanSkillName(s1)); }
    if (s2) { setImage('ts-skill', idx * 3 + 1, 'img/charIcons/' + escImg(skillImg(cleanSkillName(s2))) + '.webp'); setSkillName(idx, 2, cleanSkillName(s2)); }
    if (s3) { setImage('ts-skill', idx * 3 + 2, 'img/charIcons/' + escImg(skillImg(cleanSkillName(s3))) + '.webp'); setSkillName(idx, 3, cleanSkillName(s3)); }
    if (pet) { setImage('ts-pet', idx, 'img/pets/' + escImg(pet) + '.webp'); setPetName(idx, pet); }
    if (p.loadout) { setImage('ts-loadout', idx, 'img/loadouts/' + escImg(p.loadout) + '.webp'); setLoadoutName(idx, p.loadout); }

    if (p.weapon && p.weapon.length) {
      var best = p.weapon[0];
      for (var w = 1; w < p.weapon.length; w++) {
        if (p.weapon[w].kill > best.kill) best = p.weapon[w];
        else if (p.weapon[w].kill === best.kill && p.weapon[w].damage > best.damage) best = p.weapon[w];
      }
      if (best.weapon) { setImage('ts-weapon', idx, 'img/weapons/' + escImg(cleanWeapon(best.weapon)) + '.webp'); setWeaponName(idx, cleanWeapon(best.weapon)); }
    }

    setStatValue(idx, 'kills', p.kills);
    setStatValue(idx, 'assists', p.assists);
    setStatValue(idx, 'knockDown', p.knockDown);
    setStatValue(idx, 'damage', p.damage);

    if (p.playerName) setOverlayName(idx, p.playerName);
  }

  var mvpEls = document.querySelectorAll('.ts-mvp');
  if (mvpEls[mvpIdx]) {
    mvpEls[mvpIdx].textContent = 'MVP';
    mvpEls[mvpIdx].classList.add('active');
  }
});

function resetAnimations() {
  var wraps = document.querySelectorAll('.ts-wrap');
  wraps.forEach(function(w) { w.classList.add('fade-out'); });
  setTimeout(function() {
    var els = document.querySelectorAll('.ts-left, .ts-char, .ts-right, .ts-overlay, .ts-mvp.active, .ts-row');
    els.forEach(function(el) { el.classList.remove('anim-in'); });
  }, 400);
}

function playAnimation() {
  var wraps = document.querySelectorAll('.ts-wrap');
  wraps.forEach(function(w) { w.classList.remove('fade-out'); });
  var els = document.querySelectorAll('.ts-left, .ts-char, .ts-right, .ts-overlay, .ts-mvp.active, .ts-row');
  els.forEach(function(el) { el.classList.remove('anim-in'); });
  setTimeout(function() {
    animateWrapper(0, 0);
    animateWrapper(1, 0);
    animateWrapper(2, 0);
    animateWrapper(3, 0);
  }, 50);
}

db.ref("/live-graphics/teamStats").on("value", function(snap) {
  var val = snap.val();
  if (val === "show") {
    playAnimation();
  } else if (val === "hide") {
    resetAnimations();
  }
});

db.ref("/live-graphics/teamStatsPage").on("value", function(snap) {
  var page = snap.val() || 1;
  var rowClips = document.querySelectorAll('.ts-row-clip');
  var statsEls = document.querySelectorAll('.ts-stats');
  if (page === 2) {
    rowClips.forEach(function(el) { el.classList.add('hidden'); });
    setTimeout(function() {
      statsEls.forEach(function(el) { el.classList.add('visible'); });
    }, 300);
  } else {
    statsEls.forEach(function(el) { el.classList.remove('visible'); });
    setTimeout(function() {
      rowClips.forEach(function(el) { el.classList.remove('hidden'); });
    }, 300);
  }
});

db.ref("/live-graphics/theme/teamStats").on("value", function(snap) {
  var t = snap.val();
  if (!t) return;
  var root = document.documentElement;
  function _h(v) { return typeof v === "string" && v[0] === "#"; }
  if (_h(t.leftBg))        root.style.setProperty("--ts-left-bg", t.leftBg);
  if (_h(t.rightBg))       root.style.setProperty("--ts-right-bg", t.rightBg);
  if (_h(t.borderColor))   root.style.setProperty("--ts-border-color", t.borderColor);
  if (_h(t.statLabelColor)) root.style.setProperty("--ts-stat-label-color", t.statLabelColor);
  if (_h(t.statValueColor)) root.style.setProperty("--ts-stat-value-color", t.statValueColor);
  if (_h(t.overlayBg))     root.style.setProperty("--ts-overlay-bg", t.overlayBg);
  if (_h(t.overlayColor))  root.style.setProperty("--ts-overlay-color", t.overlayColor);
  if (_h(t.mvpBg))         root.style.setProperty("--ts-mvp-bg", t.mvpBg);
  if (_h(t.mvpColor))      root.style.setProperty("--ts-mvp-color", t.mvpColor);
  if (_h(t.row1Bg))        root.style.setProperty("--ts-row1-bg", t.row1Bg);
  if (_h(t.row2Bg))        root.style.setProperty("--ts-row2-bg", t.row2Bg);
  if (_h(t.row3Bg))        root.style.setProperty("--ts-row3-bg", t.row3Bg);
  if (_h(t.skillOverlayBg))    root.style.setProperty("--ts-skill-overlay-bg", t.skillOverlayBg);
  if (_h(t.skillOverlayColor)) root.style.setProperty("--ts-skill-overlay-color", t.skillOverlayColor);
  if (_h(t.petOverlayBg))      root.style.setProperty("--ts-pet-overlay-bg", t.petOverlayBg);
  if (_h(t.petOverlayColor))   root.style.setProperty("--ts-pet-overlay-color", t.petOverlayColor);
  if (_h(t.loadoutOverlayBg))    root.style.setProperty("--ts-loadout-overlay-bg", t.loadoutOverlayBg);
  if (_h(t.loadoutOverlayColor)) root.style.setProperty("--ts-loadout-overlay-color", t.loadoutOverlayColor);
  if (_h(t.weaponOverlayBg))    root.style.setProperty("--ts-weapon-overlay-bg", t.weaponOverlayBg);
  if (_h(t.weaponOverlayColor)) root.style.setProperty("--ts-weapon-overlay-color", t.weaponOverlayColor);
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
