// Guard for operator pages. Requires firebase-app-compat + firebase-auth-compat
// and a page script that already called firebase.initializeApp(...).
// Unauthenticated visitors are redirected to login.html with a ?next= return path.
// Also enforces a 3-day inactivity sign-out (shared across tabs via localStorage).
(function () {
  var MAX_IDLE_MS = 3 * 24 * 60 * 60 * 1000;
  var KEY = "tmrLastActivity";
  var lastWrite = 0;

  function touch() {
    var now = Date.now();
    if (now - lastWrite < 60000) return;
    lastWrite = now;
    try { localStorage.setItem(KEY, String(now)); } catch (e) {}
  }

  ["mousemove", "pointerdown", "keydown", "touchstart"].forEach(function (ev) {
    window.addEventListener(ev, touch, { passive: true });
  });

  function loginUrl() {
    return "login.html?next=" + encodeURIComponent(location.pathname + location.search);
  }

  function idleExpired() {
    var last = parseInt(localStorage.getItem(KEY), 10);
    if (!last) {
      touch();
      return false;
    }
    return Date.now() - last > MAX_IDLE_MS;
  }

  var tries = 0;
  function ready(fn) {
    if (typeof firebase !== "undefined" && firebase.apps && firebase.apps.length) {
      fn();
      return;
    }
    if (++tries > 40) {
      console.error("authGuard: Firebase app not initialized within 2s — page script failed to load?");
      return;
    }
    setTimeout(function () { ready(fn); }, 50);
  }

  ready(function () {
    if (idleExpired()) {
      firebase.auth().signOut().then(function () {
        location.replace(loginUrl());
      }, function () {
        location.replace(loginUrl());
      });
      return;
    }
    touch();
    setInterval(function () {
      if (idleExpired()) {
        firebase.auth().signOut().then(function () {
          location.replace(loginUrl());
        }, function () {
          location.replace(loginUrl());
        });
      }
    }, 60 * 60 * 1000);
    firebase.auth().onAuthStateChanged(function (user) {
      if (!user) location.replace(loginUrl());
    });
  });
})();
