var firebaseConfig = {
  apiKey: "AIzaSyC21mdsgyIEqXT7ujFbi0xcVAMRZxxqB1I",
  authDomain: "tmraditya-1ceb7.firebaseapp.com",
  projectId: "tmraditya-1ceb7",
  storageBucket: "tmraditya-1ceb7.firebasestorage.app",
  messagingSenderId: "317037791388",
  appId: "1:317037791388:web:755b5a18bb77aa140a4559",
  databaseURL: "https://tmraditya-1ceb7-default-rtdb.asia-southeast1.firebasedatabase.app"
};
firebase.initializeApp(firebaseConfig);
var db = firebase.database();

var navEl = document.getElementById('panelNav');
var bodyEl = document.getElementById('panelBody');

var matchesData = null;
var liveData = null;
var matchesLoaded = false;
var activeTab = 'live';
var shellBuilt = false;
var lastEditorSig = null;
var lastNavSig = null;

/* Same table as tmr.py:78, verified against live match data. */
var PLACEMENT_POINTS = { 1:12, 2:9, 3:8, 4:7, 5:6, 6:5, 7:4, 8:3, 9:2, 10:1, 11:0, 12:0 };
var RANK_UID = '__rank';

function esc(s) {
  return String(s === null || s === undefined ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function matchKeys() {
  var keys = [];
  for (var key in matchesData || {}) {
    if (/^match\d+$/.test(key)) keys.push(key);
  }
  keys.sort(function(a, b) {
    return parseInt(a.slice(5), 10) - parseInt(b.slice(5), 10);
  });
  return keys;
}

/* LIVE tab edits the newest match; a MATCH N tab edits that match.
   This is the node every save writes to. */
function targetMatchKey() {
  if (activeTab === 'live') {
    var keys = matchKeys();
    return keys.length ? keys[keys.length - 1] : null;
  }
  return activeTab;
}

function scrollTabBar(dir) {
  var bar = document.getElementById('panelNav');
  if (bar) bar.scrollBy({ left: dir * 160, behavior: 'smooth' });
}

/* ---------------- nav ---------------- */

function renderNav() {
  if (!navEl) return;

  if (matchesLoaded && activeTab !== 'live' && matchKeys().indexOf(activeTab) === -1) {
    activeTab = 'live';
    lastEditorSig = null;
  }

  var keys = matchesLoaded ? matchKeys() : [];
  var navSig = activeTab + '|' + keys.join(',');
  if (navSig === lastNavSig) return;
  lastNavSig = navSig;

  var html = '<button type="button" class="tab-btn' + (activeTab === 'live' ? ' active' : '') + '" data-tab="live">LIVE</button>';
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    html += '<button type="button" class="tab-btn' + (activeTab === k ? ' active' : '') +
            '" data-tab="' + k + '">MATCH ' + parseInt(k.slice(5), 10) + '</button>';
  }
  navEl.innerHTML = html;

  var btns = navEl.querySelectorAll('.tab-btn');
  for (var b = 0; b < btns.length; b++) {
    (function(btn) {
      btn.addEventListener('click', function() {
        var tab = btn.getAttribute('data-tab');
        if (tab === activeTab) return;
        activeTab = tab;
        lastEditorSig = null;
        renderNav();
        renderBody();
      });
    })(btns[b]);
  }
}

/* ---------------- editor data ---------------- */

function teamsBlockData(target) {
  var teams = (target && matchesData && matchesData[target] && matchesData[target].teams) || {};
  var out = [];
  for (var tag in teams) {
    var players = (teams[tag] && teams[tag].players) || {};
    var list = [];
    for (var uid in players) {
      var pl = players[uid] || {};
      var raw = (pl.kills === undefined || pl.kills === null) ? '' : String(pl.kills);
      if (raw !== '' && !isFinite(Number(raw))) raw = '';
      list.push({ uid: uid, name: pl.playerName || uid, kills: raw });
    }
    var team = teams[tag] || {};
    var rankRaw = (team.rank === undefined || team.rank === null) ? '' : String(team.rank);
    if (rankRaw !== '' && !isFinite(Number(rankRaw))) rankRaw = '';
    out.push({ tag: tag, players: list, rank: rankRaw });
  }
  out.sort(function(a, b) {
    if (a.tag === b.tag) return 0;
    return a.tag < b.tag ? -1 : 1;
  });
  return out;
}

function editorSignature(target, blocks) {
  var parts = [activeTab, target || ''];
  for (var i = 0; i < blocks.length; i++) {
    var inner = [];
    for (var j = 0; j < blocks[i].players.length; j++) {
      inner.push(blocks[i].players[j].uid + ':' + blocks[i].players[j].name);
    }
    parts.push(blocks[i].tag + '@' + blocks[i].rank + '=' + inner.join(','));
  }
  return parts.join('|');
}

function findKills(blocks, tag, uid) {
  for (var i = 0; i < blocks.length; i++) {
    if (blocks[i].tag !== tag) continue;
    if (uid === RANK_UID) return blocks[i].rank;
    for (var j = 0; j < blocks[i].players.length; j++) {
      if (blocks[i].players[j].uid === uid) return blocks[i].players[j].kills;
    }
  }
  return '';
}

/* ---------------- html ---------------- */

function headContentHTML() {
  var html = '';

  if (activeTab === 'live') {
    var keys = matchKeys();
    var lastKey = keys.length ? keys[keys.length - 1] : '';
    var meta = (lastKey && matchesData && matchesData[lastKey] && matchesData[lastKey].meta) || {};
    var status = (liveData && typeof liveData['3_status'] === 'string') ? liveData['3_status'] : '';
    html += '<span class="pane-title">Live</span>';
    if (lastKey) html += '<span class="pane-meta">Game ' + parseInt(lastKey.slice(5), 10) + '</span>';
    if (meta.mapName) html += '<span class="pane-meta">' + esc(meta.mapName) + '</span>';
    if (status) html += '<span class="pane-status' + (status === 'running' ? ' running' : '') + '">' + esc(status) + '</span>';
  } else {
    var node = (matchesData && matchesData[activeTab]) || {};
    var meta2 = node.meta || {};
    html += '<span class="pane-title">Match ' + parseInt(activeTab.slice(5), 10) + '</span>';
    if (meta2.mapName) html += '<span class="pane-meta">' + esc(meta2.mapName) + '</span>';
  }

  return html;
}

function playersTotal(players) {
  var sum = 0;
  for (var i = 0; i < players.length; i++) {
    var v = Number(players[i].kills);
    if (isFinite(v)) sum += v;
  }
  return sum;
}

function teamBlocksHTML(blocks) {
  var html = '';
  for (var i = 0; i < blocks.length; i++) {
    var b = blocks[i];
    html += '<div class="team-block" data-tag="' + esc(b.tag) + '">' +
      '<div class="team-row team-row-top">' +
        '<span class="team-tag">' + esc(b.tag) + '</span>' +
        '<div class="cells">';

    for (var j = 0; j < b.players.length; j++) {
      html += '<button type="button" class="pname" title="' + esc(b.players[j].name) + '">' +
              esc(b.players[j].name) + '</button>';
    }

    html += '</div>' +
        '<span class="team-slot">' +
          '<input class="prank" type="number" min="1" max="12" step="1" inputmode="numeric" ' +
          'data-tag="' + esc(b.tag) + '" data-uid="' + RANK_UID + '" ' +
          'value="' + esc(b.rank) + '" title="Team rank (1-12)" placeholder="POS">' +
        '</span>' +
      '</div>' +
      '<div class="team-row team-row-edit">' +
        '<span class="team-total">KILLS ' + playersTotal(b.players) + '</span>' +
        '<div class="cells">';

    for (var k = 0; k < b.players.length; k++) {
      var p = b.players[k];
      html += '<input class="pkills" type="number" min="0" step="1" inputmode="numeric" ' +
              'data-tag="' + esc(b.tag) + '" data-uid="' + esc(p.uid) + '" data-name="' + esc(p.name) + '" ' +
              'value="' + esc(p.kills) + '" title="' + esc(p.name) + '">';
    }

    html += '</div>' +
        '<span class="team-slot">' +
          '<button type="button" class="team-save">SAVE</button>' +
          '<span class="save-status"></span>' +
        '</span>' +
      '</div>' +
    '</div>';
  }
  return html;
}

/* ---------------- render ---------------- */

function editKey(tag, uid) { return tag + '/' + uid; }

/* Roster changes rebuild the whole list, so unsaved typing is carried across. */
function captureEdits(list) {
  var map = {};
  var inputs = list.querySelectorAll('input.pkills, input.prank');
  for (var i = 0; i < inputs.length; i++) {
    var inp = inputs[i];
    if (!inp._edited) continue;
    map[editKey(inp.getAttribute('data-tag'), inp.getAttribute('data-uid'))] = {
      value: inp.value,
      lastWrite: inp._lastWrite
    };
  }
  return map;
}

function applyEdits(list, edits) {
  var inputs = list.querySelectorAll('input.pkills, input.prank');
  for (var i = 0; i < inputs.length; i++) {
    var inp = inputs[i];
    var e = edits[editKey(inp.getAttribute('data-tag'), inp.getAttribute('data-uid'))];
    if (!e) continue;
    inp._edited = true;
    if (e.lastWrite !== undefined && e.lastWrite !== null) inp._lastWrite = e.lastWrite;
    inp.value = e.value;
  }
}

function ensureShell() {
  if (shellBuilt || !bodyEl) return;
  bodyEl.innerHTML =
    '<div class="pane-head"></div>' +
    '<div class="team-list"></div>' +
    '<div class="pane-empty" style="display:none"></div>';
  shellBuilt = true;
}

function renderBody() {
  if (!bodyEl) return;
  ensureShell();

  var head = bodyEl.querySelector('.pane-head');
  var list = bodyEl.querySelector('.team-list');
  var empty = bodyEl.querySelector('.pane-empty');
  if (!head || !list || !empty) return;

  head.innerHTML = headContentHTML();

  var target = targetMatchKey();
  var blocks = (matchesLoaded && target) ? teamsBlockData(target) : [];
  var msg = '';
  if (!matchesLoaded) msg = 'Loading…';
  else if (!target) msg = 'No match played yet';
  else if (!blocks.length) msg = 'No teams for this match';

  if (msg) {
    list.style.display = 'none';
    empty.style.display = '';
    empty.textContent = msg;
    lastEditorSig = null;
    return;
  }
  empty.style.display = 'none';
  list.style.display = '';

  var sig = editorSignature(target, blocks);
  if (sig !== lastEditorSig) {
    var edits = captureEdits(list);
    lastEditorSig = sig;
    list.innerHTML = teamBlocksHTML(blocks);
    applyEdits(list, edits);
    updateTotals(list);
  } else {
    syncValues(list, blocks);
    updateTotals(list);
  }
}

/* Only touch inputs the operator is not focused in and has not edited,
   so a background Firebase update can never wipe typing in progress. */
function syncValues(list, blocks) {
  var inputs = list.querySelectorAll('input.pkills, input.prank');
  for (var i = 0; i < inputs.length; i++) {
    var inp = inputs[i];
    if (inp === document.activeElement) continue;
    var v = findKills(blocks, inp.getAttribute('data-tag'), inp.getAttribute('data-uid'));
    if (inp._edited) {
      if (inp._lastWrite !== undefined && inp._lastWrite !== null && v === inp._lastWrite) inp._edited = false;
      else continue;
    }
    if (inp.value !== v) inp.value = v;
  }
}

/* ---------------- save ---------------- */

function blockTotal(block) {
  var inputs = block.querySelectorAll('input.pkills');
  var sum = 0;
  for (var i = 0; i < inputs.length; i++) {
    var v = Number(String(inputs[i].value).trim());
    if (isFinite(v)) sum += v;
  }
  return sum;
}

function updateTotals(list) {
  if (!list) return;
  var blocks = list.querySelectorAll('.team-block');
  for (var i = 0; i < blocks.length; i++) {
    var el = blocks[i].querySelector('.team-total');
    if (el) el.textContent = 'KILLS ' + blockTotal(blocks[i]);
  }
}

function setStatus(el, text, kind, title) {
  if (!el) return;
  if (el._t) { clearTimeout(el._t); el._t = null; }
  el.textContent = text;
  el.className = 'save-status' + (kind ? ' ' + kind : '');
  el.setAttribute('title', title || '');
  if (kind === 'ok') {
    el._t = setTimeout(function() {
      el._t = null;
      if (el.textContent !== text) return;
      el.textContent = '';
      el.className = 'save-status';
      el.setAttribute('title', '');
    }, 3000);
  }
}

function handleSave(btn) {
  var block = btn.closest ? btn.closest('.team-block') : null;
  if (!block) return;

  var status = block.querySelector('.save-status');
  var target = targetMatchKey();
  if (!target) { setStatus(status, 'NO MATCH', 'err', 'No match to save into'); return; }

  var tag = block.getAttribute('data-tag');
  var inputs = block.querySelectorAll('input.pkills');
  var rankInp = block.querySelector('input.prank');
  var updates = {};
  var fail = null;
  var total = 0;

  var rank = null;
  if (rankInp) {
    var rraw = String(rankInp.value).trim();
    if (rraw === '') { fail = ['EMPTY', 'Empty rank for ' + tag]; }
    else {
      var rv = Number(rraw);
      if (!isFinite(rv) || Math.floor(rv) !== rv || rv < 1 || rv > 12) {
        fail = ['BAD RANK', 'Rank for ' + tag + ' must be 1-12'];
      } else {
        rank = rv;
      }
    }
  }

  if (!fail) {
    for (var i = 0; i < inputs.length; i++) {
      var inp = inputs[i];
      var name = inp.getAttribute('data-name') || inp.getAttribute('data-uid');
      var raw = String(inp.value).trim();
      if (raw === '') { fail = ['EMPTY', 'Empty value for ' + name]; break; }
      var v = Number(raw);
      if (!isFinite(v) || v < 0 || Math.floor(v) !== v) { fail = ['BAD NUMBER', 'Invalid kills for ' + name]; break; }
      updates[tag + '/players/' + inp.getAttribute('data-uid') + '/kills'] = v;
      inp._written = String(v);
      total += v;
    }
  }

  if (fail) { setStatus(status, fail[0], 'err', fail[1]); return; }
  if (!inputs.length) { setStatus(status, 'NO DATA', 'err', 'No players to save'); return; }

  var node = (matchesData && matchesData[target] && matchesData[target].teams && matchesData[target].teams[tag]) || {};
  var killPoints = Number(node.killPoints);
  if (!isFinite(killPoints)) killPoints = Number(node.kills);
  if (!isFinite(killPoints)) killPoints = 0;

  var placePts = PLACEMENT_POINTS[rank];

  updates[tag + '/kills'] = total;
  updates[tag + '/5_totalKills'] = total;
  updates[tag + '/rank'] = rank;
  updates[tag + '/placementPoints'] = placePts;
  updates[tag + '/totalScore'] = killPoints + placePts;
  updates[tag + '/booyah'] = rank === 1 ? 1 : 0;

  if (rank === 1) {
    var teamsNode = (matchesData && matchesData[target] && matchesData[target].teams) || {};
    for (var other in teamsNode) {
      if (other !== tag) updates[other + '/booyah'] = 0;
    }
  }

  var original = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'SAVING';

  db.ref('/matches/' + target + '/teams').update(updates).then(function() {
    btn.disabled = false;
    btn.textContent = original;
    for (var i = 0; i < inputs.length; i++) inputs[i]._lastWrite = inputs[i]._written;
    if (rankInp) rankInp._lastWrite = String(rank);
    setStatus(status, 'SAVED', 'ok', 'Kills, rank and points saved');
  }).catch(function(err) {
    btn.disabled = false;
    btn.textContent = original;
    setStatus(status, 'ERROR', 'err', String((err && err.message) || err));
    if (window.console && console.error) console.error('[panel] save failed:', err);
  });
}

if (bodyEl) {
  bodyEl.addEventListener('click', function(e) {
    if (!e.target || !e.target.closest) return;
    var btn = e.target.closest('.team-save');
    if (btn && !btn.disabled) handleSave(btn);
  });
  bodyEl.addEventListener('input', function(e) {
    var t = e.target;
    if (!t || !t.classList) return;
    if (t.classList.contains('pkills')) {
      t._edited = true;
      updateTotals(bodyEl.querySelector('.team-list'));
    } else if (t.classList.contains('prank')) {
      t._edited = true;
    }
  });
}

/* ---------------- firebase ---------------- */

renderNav();
renderBody();

db.ref('/matches').on('value', function(snap) {
  matchesData = snap.val() || {};
  matchesLoaded = true;
  renderNav();
  renderBody();
});

db.ref('/matches/live').on('value', function(snap) {
  liveData = snap.val() || {};
  if (activeTab === 'live') renderBody();
});
