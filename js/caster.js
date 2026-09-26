var firebaseConfig = window.TMR_CONFIG.casterFirebase;

firebase.initializeApp(firebaseConfig);
var db = firebase.database();

document.getElementById("card-caster1").onclick = function() {
  window.location.href = "caster1.html";
};

document.getElementById("card-caster2").onclick = function() {
  window.location.href = "caster2.html";
};

window.history.pushState(null, "", window.location.href);
window.addEventListener("popstate", function() {
  window.history.pushState(null, "", window.location.href);
});
