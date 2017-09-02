/* global AFRAME, jsfxr */

/* global randomNetwork getNetworkCodes randomInt */

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

let network;
let sectorCodes;

let terminalHover;

AFRAME.registerComponent('scale-on-hover', {
  init: function() {
    let el = this.el;
    el.addEventListener('mouseenter', () => {
      el.setAttribute('scale', { x: 1.1, y: 1.1, z: 1.1 });
    });
    el.addEventListener('mouseleave', () => {
      el.setAttribute('scale', { x: 1, y: 1, z: 1 });
    });
  }
});

AFRAME.registerComponent('fuse-on-hover', {
  init: function () {
    let el = this.el;
    let cursor = document.getElementById("cursor");
    let cancel;
    el.addEventListener('mouseenter', () => {
      //cursor.setAttribute('material', { color: '#002' });
      cursor.setAttribute('scale', { x: 1.2, y: 1.2, z: 1.2 });
      cancel = animate(function(progress){
        let val = 0.007 - (0.007 - 0.0001) * progress;
        cursor.setAttribute('geometry', { radiusInner: val });
      }, 1500);
    });

    let handleCancel = () => {
      cursor.setAttribute('scale', { x: 1, y: 1, z: 1 });
      cursor.setAttribute('material', { color: 'white' });
      cancel();
      cursor.setAttribute('geometry', { radiusInner: 0.007 });
    };

    el.addEventListener('mouseleave', handleCancel);
    el.addEventListener('click', handleCancel);
  }
});

AFRAME.registerComponent('text-on-hover', {
  init: function () {
    let el = this.el;
    el.addEventListener('mouseenter', () => {
      if (el.className === 'node-box') {
        if (el.parentNode.data) {
          let data = el.parentNode.data;
          // we change the texture for all nodes in same sector,
          // but it doesn't matter as player sees only one ;)
          drawText(`node-${data.sector}`, '>switch', data.colorValue, 112);
        }
      } else if (el.className === 'node-action-hack') {
        terminalHover = true;
        drawTerminals();
      }
    });
    el.addEventListener('mouseleave', () => {
      if (el.className === 'node-box') {
        if (el.parentNode.data) {
          let data = el.parentNode.data;
          drawText(`node-${data.sector}`, '>', data.colorValue, 112);
        }
      } else if (el.className === 'node-action-hack') {
        terminalHover = false;
        drawTerminals();
      }
    });
  }
});

AFRAME.registerComponent('move-on-click', {
  init: function () {

    let el = this.el;
    let camera = document.getElementById("camera");

    el.addEventListener('click', () => {

      let cPos = camera.getAttribute('position');
      let elPos = el.getAttribute('position');

      animate(function(progress){
        let currentPos = {
          x: cPos.x + ((elPos.x - cPos.x) * progress),
          y: cPos.y,
          z: cPos.z + ((elPos.z - cPos.z) * progress),
        };
        camera.setAttribute('position', currentPos );
      }, 1000);

      let data = el.parentEl.data;
      if (data) {
        if (data.isTrap) {
          setTimeout(() => {
            el.components.sound__trap.playSound();
            reduceTime(60);
          }, 1000);
        }
        if (data.colorValue) {
          // TODO: animate?
          setTimeout(() => {
            document.querySelectorAll('.wall').forEach(wall => wall.setAttribute('color', data.colorValue));
          }, 1000);
        }
      }
    });
  }
});

AFRAME.registerComponent('hack-on-click', {
  init: function () {
    let el = this.el;
    let parent = el.parentNode.parentNode;

    el.addEventListener('click', () => {
      console.log("HACK");
      if (parent.data) {
        if (parent.data.isTarget) {
          console.log("YOU WIN");
          // TODO:
          // draw something on terminal?
          win();
        } else {
          console.log("WRONG!");
          el.components.sound.playSound();
          reduceTime(10);
          // TODO:
          // draw something on terminal
        }
      }
    });
  }
});

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
      value = value.x + " " + value.y + " " + value.z;
    }
    entity.setAttribute(key, value);
  }

  return entity;
}

function getBox(pos) {
  return createEntity('a-box', {
    class: 'wall',
    src: '#grid',
    position: pos,
    color: '#FFF', // TODO: change 'ambient color'
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
    position: { x: 0, y: -0.4, z: 0 },
    rotation: '-10 0 0',
    height: 0.5,
    width: 0.5,
    src: `#terminal-${node.isTrap ? 'trap' : node.sector}`,
  }));

  // TODO: help action
  // nodeEl.appendChild(createEntity('a-plane', {
  //   position: { x: pos.x - 0.15, y: pos.y - 0.2, z: pos.z - 0.75 },
  //   rotation: '-10 30 0',
  //   height: 0.1,
  //   width: 0.4,
  //   src: '#actions-help',
  //   material: 'transparent: true;',
  //   'fuse-on-hover': '',
  //   'scale-on-hover': ''
  // }));

  terminal.appendChild(createEntity('a-plane', {
    'class': 'node-action-hack',
    position: { x: -0.30, y: -0.2, z: 0 },
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
  //
  // // TODO: extract to its own entity
  // // hint text
  terminal.appendChild(createEntity('a-plane', {
    position: { x: 0, y: 0.2, z: -0.1 },
    height: 0.5,
    width: 0.5,
    src: `#hint-1`,
    material: 'transparent:true',
  }));

  // hint arrow
  terminal.appendChild(createEntity('a-plane', {
    position: { x: 0, y: -0.1125, z: -0.1 },
    height: 0.125,
    width: 0.125,
    src: `#hint-arrow`,
    material: 'transparent:true',
  }));

  return terminal;
}

function getNode(pos, node) {
  let color = node.colorValue;
  let nodeEl = document.createElement('a-entity');
  nodeEl.className = 'node';

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
  //   //'class': 'node-action-hack',
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
function getTerminalText(time, code) {
  let min = ~~(time / 60);
  let sec = time % 60;

  let formatted = `0${min}:${sec<10?'0':''}${sec}`; // MM:SS

  let percent = ~~((GAME_TIME - time) * 100 / GAME_TIME); // percent of time going up
  // progress bar line like: [=======  ]
  let progress = '='.repeat(~~(percent / 10) + (percent < 100 ? 1 : 0))
               + ' '.repeat(10 - ~~(percent / 10) + (percent < 10 ? 1 : 0));

  let locating = `LOCATING INTRUDER\n${percent}% [${progress}]\n            ${formatted}`;
  let access = `> access code\n  ${code}\n\n> ${terminalHover ? 'hack' : ''}`;

  return locating + '\n\n' + access;
}

// TODO: draw on traps as well
function drawTerminals() {
  sectorCodes.forEach((code, i) => {
    drawText(`terminal-${i}`, getTerminalText(time, code), COLOR_VALUES[network.colors[i]], 48);
  });
}

function reduceTime(amount) {
  time = time - amount;
  if (time < 0) { time = 0; }

  drawTerminals();
}

function initTimer() {
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
  console.log('YOU LOOSE!');
  document.querySelectorAll('.wall').forEach(wall => wall.setAttribute('color', 'red'));
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
    position: { x: 0, y: 1, z: -4 },
    src:'#node-0',
    material:'transparent:true',
    rotation: '0 0 0'
  });
  document.getElementById('camera').appendChild(screen);
}

function win() {
  // show sky and remove floor and ceiling
  document.getElementById('scene').appendChild(createEntity('a-sky', { color: '#00F'} ));
  document.querySelectorAll('a-plane').forEach(p => p.parentNode.removeChild(p));

  // cancel animation timer
  clearInterval(timer);

  // TODO: DRY
  function removeNode() {
    let nodes = document.querySelectorAll('.node');
    if (nodes.length) {
      let node = nodes[randomInt(nodes.length)];
      node.parentNode.removeChild(node);
      setTimeout(removeNode, 50);
    } else {
      showWinScreen();
    }
  }

  function removeWall() {
    let walls = document.querySelectorAll('.wall');
    if (walls.length) {
      let wall = walls[randomInt(walls.length)];
      wall.parentNode.removeChild(wall);
      setTimeout(removeWall, 20);
    } else {
      removeNode();
    }
  }

  removeWall();
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
  initActions();
}

function initActions() {
  drawText('actions-hack', '>hack', 'rgba(255,255,255,0.0)', 100);
  // drawText('actions-help', '>help', 'rgba(255,255,255,0.0)', 100);
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

function initNetwork() {
  return randomNetwork();
  //return networkFromCodes(["0xC2130", "0xD6451", "0xEFCDE", "0xF058D"]);
}

AFRAME.registerComponent('cyberspace', {
  init: function () {
    let scene = this.el;

    network = initNetwork();
    console.log("NETWORK", network);

    // get network codes and randomize their order
    // initial order is color / connections / traps / target
    let tmp = getNetworkCodes(network);
    let codes = [];
    codes.push(tmp.splice(randomInt(tmp.length),1)[0]);
    codes.push(tmp.splice(randomInt(tmp.length),1)[0]);
    codes.push(tmp.splice(randomInt(tmp.length),1)[0]);
    codes.push(tmp[0]);

    sectorCodes = codes;
    initTextures();
    initTimer(network, COLOR_VALUES, codes);

    // walls
    for (let i = 0; i <= 16; i++) {
      for (let j = 0; j <= 16; j++) {
        // position of walls cube
        let pos = {
          x: (i * 4),
          y: 2,
          z: (j * 4),
        };

        if (i === 0 || i === 16 || // fill walls around the maze
            j === 0 || j === 16 ||
            ((i % 2 === 0) && (j % 2 === 0))// fill every second sqare in the maze (corners)
        ) {
          scene.appendChild(getBox(pos));
        }
      }
    }

    // additional game over walls
    scene.appendChild(getBox({ x:-4, y: 2, z: 0 }));
    scene.appendChild(getBox({ x: 0, y: 2, z:-4 }));

    // additional walls from network definition
    network.walls.rowWalls.forEach((walls, i) => {
      walls.forEach((wall, j) => {
        if (wall && wall !== walls[j-1]) {
          scene.appendChild(getBox({
            x: (wall * 2 * 4), // wall x * 2 grid columns * 4 units
            y: 2,
            z: ((i * 2 + 1) * 4) // row * 2 grid rows starting from 1 * 4 units
          }));
        }
      });
    });
    network.walls.colWalls.forEach((walls, i) => {
      walls.forEach((wall, j) => {
        if (wall && wall !== walls[j-1]) {
          scene.appendChild(getBox({
            x: ((i * 2 + 1) * 4), // col * 2 grid cols starting from 1 * 4 units
            y: 2,
            z: (wall * 2 * 4) // wall y * 2 grid rows * 4 units
          }));
        }
      });
    });

    // nodes
    let nodes = [];

    // TODO:
    // find sectors to put hacker in useful sector first
    let colorSector = codes.indexOf(tmp[0]); // color
    let wallsSector = codes.indexOf(tmp[1]); // connections

    drawText('terminal-trap', `\n  INTRUDER  \n  DETECTED  \n`, 'red');

    network.colors.forEach((color, i) => {
      drawText(`node-${i}`, '>', COLOR_VALUES[color], 112);
    });

    // init node object values
    for (let i = 0; i < 8; i++) {
      nodes[i] = [];
      for (let j = 0; j < 8; j++) {
        let node = {
          colorId: null,
          colorValue: null,
          isTrap: false,
          isTarget: false,
          el: null,
        };

        // node sector colors and codes
        if (j < 4) {
          node.colorId = (i < 4) ? network.colors[0] : network.colors[1];
          node.code = (i < 4) ? codes[0] : codes[1];
          node.sector = (i < 4) ? 0 : 1;
        } else {
          node.colorId = (i < 4) ? network.colors[2] : network.colors[3];
          node.code = (i < 4) ? codes[2] : codes[3];
          node.sector = (i < 4) ? 2 : 3;
        }

        node.colorValue = COLOR_VALUES[node.colorId];
        nodes[i][j] = node;
      }
    }

    // traps
    network.traps.trapsXY.forEach((trap) => {
      nodes[trap[0]][trap[1]].isTrap = true;
    });

    // target
    nodes[network.target[0]][network.target[1]].isTarget = true;

    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        let pos = {
          x: ((i * 2 + 1) * 4),
          y: 1.7,
          z: ((j * 2 + 1) * 4),
        };

        nodes[i][j].el = getNode(pos, nodes[i][j]);
        scene.appendChild(nodes[i][j].el);
      }
    }

    // TODO:
    // - put in sector with colors or connections
    // - don't put on traps
    let camera = document.getElementById('camera');
    camera.setAttribute('position', {
      x: ~~(Math.random() * 8) * 8 + 4,
      y: 0,
      z: ~~(Math.random() * 8) * 8 + 4,
    });
    camera.setAttribute('rotation', '0 45 0');
  }
});
