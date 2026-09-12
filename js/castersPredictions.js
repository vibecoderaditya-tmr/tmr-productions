var currentMatch = "M1";
var caster1Listener = null;
var caster2Listener = null;

function renderLogos(tags, container) {
  container.innerHTML = "";
  if (!tags || !tags.length) return;
  tags.forEach(function(tag) {
    var img = document.createElement("img");
    img.src = "img/logos/" + tag + ".webp";
    img.alt = tag;
    img.className = "cp-logo";
    img.onerror = function() { this.style.display = "none"; };
    container.appendChild(img);
  });
}

function listenCasters(match) {
  if (caster1Listener) caster1Listener();
  if (caster2Listener) caster2Listener();

  caster1Listener = lgRef.child("caster1/" + match).on("value", function(s) {
    var tags = s.val();
    if (tags && typeof tags === "object" && !Array.isArray(tags)) {
      tags = Object.values(tags);
    }
    var container = document.getElementById("cp-logos-left");
    if (container) renderLogos(tags, container);
  });

  caster2Listener = lgRef.child("caster2/" + match).on("value", function(s) {
    var tags = s.val();
    if (tags && typeof tags === "object" && !Array.isArray(tags)) {
      tags = Object.values(tags);
    }
    var container = document.getElementById("cp-logos-right");
    if (container) renderLogos(tags, container);
  });
}

lgRef.child("cpMatch").on("value", function(snap) {
  currentMatch = snap.val() || "M1";
  listenCasters(currentMatch);
});
