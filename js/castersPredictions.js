var currentMatch = "M1";
var caster1Listener = null;
var caster2Listener = null;

function renderSlots(tags, container) {
  var slots = container.querySelectorAll(".cp-slot");
  for (var i = 0; i < slots.length; i++) {
    var logoEl = slots[i].querySelector(".cp-slot-logo");
    var tagEl = slots[i].querySelector(".cp-slot-tag");
    if (tags && tags[i]) {
      var tag = tags[i];
      logoEl.innerHTML = '<img src="img/logos/' + tag.toLowerCase() + '.webp" alt="' + tag + '">';
      tagEl.textContent = tag;
    } else {
      logoEl.innerHTML = "";
      tagEl.textContent = "";
    }
  }
}

function listenCasters(match) {
  if (caster1Listener) caster1Listener();
  if (caster2Listener) caster2Listener();

  caster1Listener = lgRef.child("caster1/" + match).on("value", function(s) {
    var tags = s.val();
    if (tags && typeof tags === "object" && !Array.isArray(tags)) {
      tags = Object.values(tags);
    }
    var container = document.getElementById("cp-slots-left");
    if (container) renderSlots(tags, container);
  });

  caster2Listener = lgRef.child("caster2/" + match).on("value", function(s) {
    var tags = s.val();
    if (tags && typeof tags === "object" && !Array.isArray(tags)) {
      tags = Object.values(tags);
    }
    var container = document.getElementById("cp-slots-right");
    if (container) renderSlots(tags, container);
  });
}

lgRef.child("cpMatch").on("value", function(snap) {
  currentMatch = snap.val() || "M1";
  listenCasters(currentMatch);
});
