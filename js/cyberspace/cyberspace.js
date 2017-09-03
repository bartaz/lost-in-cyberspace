/* global jsfxr */

let GAME_TIME = 3 * 60;

let SOUND_MOVE = `url(${jsfxr([2,0.3,0.11,,0.56,0.4091,,0.1027,,,,-0.02,,0.3075,,,,,0.83,,,0.3,,0.5])})`;
let SOUND_TRAP = `url(${jsfxr([1,0.06,0.3,0.2,0.08,0.18,,,,,,,,,,,,,1,,,0.09,,0.5])})`;

// TODO: share with terminal
// TODO: use darker colors (get rid of yellow?);
//const COLOR_VALUES = ['#1B3', '#1AD', '#F70', '#D1A'];
let COLOR_VALUES = ['#3E5', '#3CF', '#FF3', '#F3C'];

// game state
let time;  // current time
let timer; // game timer setInterval (to cancel)
let ticking; // if time is already ticking

let network;
let sectorCodes;

let terminalHacked;
let terminalWin;

/* exported enterNode */
function enterNode(node) {
  // TODO: render inside of the box only for current one?

  console.log("ENTER NODE", node);
  terminalHacked = node.isHacked;
  if (node.isTrap) {
    node.el.querySelector('.node-box').components.sound__trap.playSound();
    reduceTime(60);
  }
  if (node.colorValue) {
    // TODO: animate?
    document.querySelectorAll('.wall').forEach(wall => wall.setAttribute('color', node.isTrap ? 'red' : node.colorValue));
  }
  drawTerminals();
}


/* exported animate */
function animate(draw, duration) {
  let start = performance.now();
  let canceled = false;

  requestAnimationFrame(function animate(time) {
    // timeFraction goes from 0 to 1
    let timeFraction = (time - start) / duration;
    if (timeFraction > 1) timeFraction = 1;

    // calculate the current animation state
    let progress = timeFraction;

    if (!canceled) draw(progress); // draw it

    if (!canceled && timeFraction < 1) {
      requestAnimationFrame(animate);
    }
  });

  return () => { canceled = true; };
}

function createEntity(name, attrs) {
  const entity = document.createElement(name);

  for (const key in attrs) {
    let value = attrs[key];
    if (key === 'position') {
      value = (value.x || 0) + " " + (value.y || 0) + " " + (value.z || 0);
    }
    entity.setAttribute(key, value);
  }

  return entity;
}

/* exported getBox */
function getBox(pos) {
  return createEntity('a-box', {
    class: 'wall',
    src: '#grid',
    position: pos,
    color: '#FFF',
    height: 4,
    width: 4,
    depth: 4
  });
}

function getTerminal(pos, node) {
  let terminal = createEntity('a-entity', {
    position: { x: pos.x - 0.5, y: pos.y, z: pos.z - 0.5 },
    rotation: '0 45 0',
  });

  // node terminal text
  terminal.appendChild(createEntity('a-plane', {
    'class': 'node-terminal',
    position: { y: -0.4 },
    rotation: '-10 0 0',
    height: 0.5,
    width: 0.5,
    src: `#terminal-${node.isTrap ? 'trap' : node.sector}`,
  }));

  // help action
  terminal.appendChild(createEntity('a-plane', {
    'class': 'node-action-help',
    position: { x: -0.30, y: -0.2 },
    rotation: '-10 15 0',
    height: 0.1,
    width: 0.4,
    src: '#actions-help',
    material: 'transparent: true;',
    'fuse-on-hover': '',
    'scale-on-hover': '',
    'help-on-click': '',
    'text-on-hover': '',
  }));

  // hack action
  terminal.appendChild(createEntity('a-plane', {
    'class': 'node-action-hack',
    position: { x: -0.31, y: -0.35 },
    rotation: '-10 15 0',
    height: 0.1,
    width: 0.4,
    src: '#actions-hack',
    material: 'transparent: true;',
    'fuse-on-hover': '',
    'scale-on-hover': '',
    'hack-on-click': '',
    'text-on-hover': '',
    'sound': { src: SOUND_TRAP }
  }));

  // hint
  let hint = createEntity('a-entity', {
    'class': 'hint',
    position: { y: -0.2, z: -0.1 },
    visible: false
  });

  // hint text
  hint.appendChild(createEntity('a-plane', {
    position: { y: 0.375 },
    height: 0.5,
    width: 0.5,
    src: `#hint-1`,
    material: 'transparent:true',
  }));

  // hint arrow
  hint.appendChild(createEntity('a-plane', {
    position: { y: 0.0625 },
    height: 0.125,
    width: 0.125,
    src: `#hint-arrow`,
    material: 'transparent:true',
  }));

  terminal.appendChild(hint);

  return terminal;
}

/* exported getNode */
function getNode(pos, node) {
  let color = node.colorValue;
  let nodeEl = createEntity('a-entity', {
    'class': 'node',
  });

  // node box
  nodeEl.appendChild(createEntity('a-box', {
    'class': 'node-box',
    src: `#node-${node.sector}`,
    position: pos,
    height: 1.5,
    width: 1.5,
    depth: 1.5,
    rotation: '0 45 0',
    'move-on-click': '',
    'scale-on-hover': '',
    'text-on-hover': '',
    'fuse-on-hover': '',
    'sound': { src: SOUND_MOVE, on: 'click' },
    'sound__trap': { src: SOUND_TRAP }
  }));

  // SWITCH ACTION ?
  // nodeEl.appendChild(createEntity('a-plane', {
  //   position: { x: pos.x - 1, y: pos.y + 0.1, z: pos.z + 4},
  //   rotation: '0 30 0',
  //   height: 0.375,
  //   width: 1.5,
  //   src: '#actions-switch',
  //   color: '#FFF',
  //   material: 'transparent: true;',
  //   'fuse-on-hover': '',
  //   'scale-on-hover': '',
  //   //'hack-on-click': '',
  //   //'text-on-hover': '',
  //   //'sound': { src: SOUND_TRAP }
  // }));

  // node inside bottom frame
  nodeEl.appendChild(createEntity('a-plane', {
    position: { x: pos.x, y: pos.y - 0.7, z: pos.z },
    color: node.isTrap ? 'red' : color,
    rotation: '-90 45 0',
    material: 'transparent:true',
    src: '#frame',
    height: 1.46,
    width: 1.46
  }));

  nodeEl.appendChild(getTerminal(pos, node));



  // TODO: second terminal ?
  // it needs actions, hint, etc...
  // node terminal text
  // nodeEl.appendChild(createEntity('a-plane', {
  //   'class': 'node-terminal',
  //   position: { x: pos.x + 0.5, y: pos.y - 0.4, z: pos.z + 0.5 },
  //   rotation: '-10 225 0',
  //   height: 0.5,
  //   width: 0.5,
  //   src: `#terminal-${node.isTrap ? 'trap' : node.sector}`,
  //   'fuse-on-hover': '',
  //   'text-on-hover': '',
  //   'hack-on-click': '',
  //   'sound': { src: `url(${jsfxr([1,0.06,0.3,0.2,0.08,0.18,,,,,,,,,,,,,1,,,0.09,,0.5])})`}
  // }));

  nodeEl.data = node;

  return nodeEl;
}



// terminal text
// - code
// - is time ticking
// - time
// - hover (hack) (or other actions?)
// - sector color (?)
function getTerminalText(time, code, action) {
  let min = ~~(time / 60);
  let sec = time % 60;

  let formatted = `0${min}:${sec<10?'0':''}${sec}`; // MM:SS

  let percent = ~~((GAME_TIME - time) * 100 / GAME_TIME); // percent of time going up
  // progress bar line like: [=======  ]
  let progress = '='.repeat(~~(percent / 10) + (percent < 100 ? 1 : 0))
               + ' '.repeat(10 - ~~(percent / 10) + (percent < 10 ? 1 : 0));

  let locating = `LOCATING INTRUDER\n${percent}% [${progress}]\n            ${formatted}`;

  let access = `> access code\n  ${code}`;
  let hacked = `> hack\n  ACCESS DENIED!`;
  let win = `> hack\n\n  ACCESS GRANTED\n\n> sudo rm -rf /\n> kill -9 -1`;
  let prompt = '\n\n> ' + (action || '');
  return (ticking && !terminalWin ? locating + '\n\n' : '') +
         (terminalHacked ? hacked : terminalWin ? win : access) +
         (terminalWin ? '' : prompt);
}

// TODO: draw on traps as well
function drawTerminals(action) {
  sectorCodes.forEach((code, i) => {
    drawText(`terminal-${i}`, getTerminalText(time, code, action), COLOR_VALUES[network.colors[i]], 48);
  });
}

/* exported drawNodes */
function drawNodes(action) {
  sectorCodes.forEach((code, i) => {
    drawText(`node-${i}`, '>' + (action || ''), COLOR_VALUES[network.colors[i]], 112);
  });
}

function reduceTime(amount) {
  time = time - amount;
  if (time < 0) { time = 0; }

  drawTerminals();
}

/* exported initTimer */
function initTimer() {
  if (ticking) return;

  ticking = true;
  time = GAME_TIME;

  drawTerminals();
  timer = setInterval(() => {
    time--;
    if (time < 0) { time = 0; }
    drawTerminals();

    if (!time) {
      gameOver();
      clearInterval(timer);
    }

  }, 1000);
}

// TODO: some text in game over area
function gameOver() {
  console.log('YOU LOSE!');

  drawText('terminal-trap', `\n    INTRUDER  \n   ELIMINATED \n`, 'red');

  document.querySelectorAll('.wall').forEach(wall => wall.setAttribute('color', 'red'));
  // TODO: remove them all together?
  document.querySelectorAll('.node-action-hack').forEach(p => p.parentNode.removeChild(p));
  document.querySelectorAll('.node-action-help').forEach(p => p.parentNode.removeChild(p));
  document.getElementById('camera').setAttribute('position', "0 0 0");
}

function showWinScreen() {
  let blueScreenOfWin = "         ERROR\n" +
                        "Fatal exception 0x54321.\n" +
                        "All processes terminated.\n" +
                        "\n" +
                        "Contact your system admin\n" +
                        "or technical support for\n" +
                        "assistance.\n" +
                        "\n" +
                        "\n" +
                        "YOU WIN!";
  drawText('node-0', blueScreenOfWin, 'transparent', 32);
  var screen = createEntity('a-plane', {
    width: 2,
    height: 2,
    position: { y: 1, z: -4 },
    src: '#node-0',
    material: 'transparent:true',
    rotation: '0 0 0'
  });
  document.getElementById('camera').appendChild(screen);
}

/* exported win */
/* global randomInt */
function win() {
  // show sky and remove floor and ceiling
  document.getElementById('scene').appendChild(createEntity('a-sky', { color: '#00F'} ));
  document.querySelectorAll('.sky').forEach(p => p.parentNode.removeChild(p));
  // TODO: remove them together (duplicated from game over)
  document.querySelectorAll('.node-action-hack').forEach(p => p.parentNode.removeChild(p));
  document.querySelectorAll('.node-action-help').forEach(p => p.parentNode.removeChild(p));

  // cancel animation timer
  clearInterval(timer);

  function removeAll(selector, delay, callback) {
    let nodes = document.querySelectorAll(selector);
    if (nodes.length) {
      let node = nodes[randomInt(nodes.length)];
      node.parentNode.removeChild(node);
      setTimeout(() => removeAll(selector, delay, callback), delay);
    } else {
      callback();
    }
  }

  removeAll('.wall', 20, () => removeAll('.node', 50, showWinScreen));
}

function drawText(canvas, text, bgColor, size = 48, textColor = 'white') {
  text = text.split('\n');
  let ctx = document.getElementById(canvas).getContext('2d');
  ctx.clearRect(0,0,512,512);
  if (bgColor) {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0,0,512,512);
  }
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 1;
  ctx.fillStyle = textColor;
  ctx.font = `${size}px Monaco, monospace`;
  text.forEach((line,i) => ctx.fillText(line, 10, (i+1) * size * 1.2));
  // TODO: stroke twice (bgColor + transparent black)?
  text.forEach((line,i) => ctx.strokeText(line, 10, (i+1) * size * 1.2));
}

/* exported initTextures */
function initTextures() {
  let ctx = document.getElementById('grid').getContext('2d');
  ctx.fillStyle = 'black';
  ctx.strokeStyle = '#FFF';
  ctx.fillRect(0,0,256,256);

  for (let i = 0; i < 6; i++) {
    let y = i*51 + 0.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(256,y);
    ctx.stroke();
  }

  ctx = document.getElementById('frame').getContext('2d');
  ctx.strokeStyle = '#FFF';
  ctx.clearRect(0,0,128,128);
  ctx.strokeRect(0.5,0.5,127,127);

  initHints();
  drawText('actions-hack', '>hack', 'rgba(255,255,255,0.0)', 90);
  drawText('actions-help', '>help', 'rgba(255,255,255,0.0)', 90);
}


function initHints() {
  let ctx = document.getElementById('hint-arrow').getContext('2d');
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(64, 64);
  ctx.lineTo(128, 0);
  ctx.fill();

  let hint = [
    'Read the ACCESS CODES from',
    'terminals to your navigator,',
    'so they can help you find',
    'the TARGET node.',
    '',
    'If you think you\'ve reached',
    'TARGET node hack it to win.',
    'But beware - hacking wrong',
    'terminals will make you',
    'easier to locate and you',
    'will lose when the time',
    'runs out!'
  ].join('\n');

  drawText('hint-1', hint, 'rgba(255,255,255,0.8)', 30, '#333');
}
