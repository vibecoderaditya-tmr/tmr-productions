var MVP_MATCH_COUNT = 5;
var MVP_KEY = '/live-graphics/editor/mvpPerMatch';
var MVP_IMAGES = [
  'img/characters/auroraboy.webp',
  'img/characters/blacksmith.webp',
  'img/characters/bounty.webp',
  'img/characters/cityheroboy.webp',
  'img/characters/crazygirl.webp'
];
var mvpRoot = document.querySelector('.mvp-wrap');

function mvpRender() {
  mvpRoot.innerHTML = '';
  for (var i = 0; i < MVP_MATCH_COUNT; i++) {
    var box = document.createElement('div');
    box.className = 'mvp-box';

    var charRow = document.createElement('div');
    charRow.className = 'mvp-char-row';
    var label = document.createElement('span');
    label.className = 'mvp-label';
    label.textContent = '#' + (i + 1);
    charRow.appendChild(label);
    var charImg = document.createElement('img');
    charImg.className = 'mvp-character';
    charImg.src = MVP_IMAGES[i];
    charRow.appendChild(charImg);
    box.appendChild(charRow);

    var textRow = document.createElement('div');
    textRow.className = 'mvp-text-row';
    box.appendChild(textRow);

    mvpRoot.appendChild(box);
  }
}

mvpRender();
