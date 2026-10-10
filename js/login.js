var firebaseConfig = {
  apiKey:            "AIzaSyC21mdsgyIEqXT7ujFbi0xcVAMRZxxqB1I",
  authDomain:        "tmraditya-1ceb7.firebaseapp.com",
  databaseURL:       "https://tmraditya-1ceb7-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId:         "tmraditya-1ceb7",
  storageBucket:     "tmraditya-1ceb7.firebasestorage.app",
  messagingSenderId: "317037791388",
  appId:             "1:317037791388:web:755b5a18bb77aa140a4559"
};

firebase.initializeApp(firebaseConfig);

var AUTH_DOMAIN = "@tmr.local";

function safeNextPath() {
  var raw = new URLSearchParams(location.search).get("next");
  if (!raw) return "index.html";
  // Only same-origin absolute paths ("/page.html?x"), never protocol-relative or external.
  if (!/^\/(?!\/)[^:]*$/.test(raw)) return "index.html";
  return raw;
}

function showError(msg) {
  var err = document.getElementById("login-error");
  err.textContent = msg;
}

function setBusy(busy) {
  var btn = document.getElementById("login-submit");
  var u = document.getElementById("login-username");
  var p = document.getElementById("login-password");
  btn.disabled = busy;
  u.disabled = busy;
  p.disabled = busy;
  btn.textContent = busy ? "Signing in…" : "Sign in";
}

function submitLogin() {
  var u = document.getElementById("login-username").value.trim().toLowerCase();
  var p = document.getElementById("login-password").value;
  showError("");
  if (!u || !p) {
    showError("Enter username and password");
    return;
  }
  setBusy(true);
  firebase.auth().signInWithEmailAndPassword(u + AUTH_DOMAIN, p)
    .then(function () {
      location.replace(safeNextPath());
    })
    .catch(function (err) {
      setBusy(false);
      if (err && typeof err.code === "string" && err.code.indexOf("network") !== -1) {
        showError("Network error — try again");
      } else {
        showError("Wrong username or password");
        document.getElementById("login-password").value = "";
        document.getElementById("login-password").focus();
      }
    });
}

document.getElementById("login-submit").onclick = submitLogin;
document.getElementById("login-password").onkeydown = function (e) {
  if (e.key === "Enter") submitLogin();
};
document.getElementById("login-username").onkeydown = function (e) {
  if (e.key === "Enter") document.getElementById("login-password").focus();
};

firebase.auth().onAuthStateChanged(function (user) {
  if (user) location.replace(safeNextPath());
});
