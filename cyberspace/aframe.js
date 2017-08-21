AFRAME.registerComponent('scale-on-hover', {
  init: function () {
    var el = this.el;
    el.addEventListener('mouseenter', function () {
      el.setAttribute('scale', { x: 1.1, y: 1.1, z: 1.1 });
    });
    el.addEventListener('mouseleave', function () {
      el.setAttribute('scale', { x: 1, y: 1, z: 1 });
    });
  }
});

AFRAME.registerComponent('fuse-on-hover', {
  init: function () {
    var el = this.el;
    var cursor = document.getElementById("cursor");
    var cancel;
    el.addEventListener('mouseenter', function () {
      cursor.setAttribute('material', { color: '#002' });
      cursor.setAttribute('scale', { x: 2, y: 2, z: 2 });
      cancel = animate(function(progress){
        var val = 0.007 - (0.007 - 0.0001) * progress;
        cursor.setAttribute('geometry', { radiusInner: val });
      }, 1500);
    });
    el.addEventListener('mouseleave', function () {
      cursor.setAttribute('scale', { x: 1, y: 1, z: 1 });
      cursor.setAttribute('material', { color: 'white' });
      cancel();
      cursor.setAttribute('geometry', { radiusInner: 0.007 });
    });
    el.addEventListener('click', function () {
      cursor.setAttribute('scale', { x: 1, y: 1, z: 1 });
      cursor.setAttribute('material', { color: 'white' });
      cancel();
      cursor.setAttribute('geometry', { radiusInner: 0.007 });
    });

  }
});

AFRAME.registerComponent('text-on-hover', {
  init: function () {
    var el = this.el;
    el.addEventListener('mouseenter', function () {
      if (el.parentNode.data) {
        var data = el.parentNode.data;

        if (el.className === 'node-box') {
          drawText(`node-${data.sector}`, '>switch', data.colorValue, 112);
        } else if (el.className === 'node-terminal') {
          drawText(`terminal-${data.sector}`, `>access code\n${data.code}\n\n>hack`, data.colorValue);
        }
      }
    });
    el.addEventListener('mouseleave', function () {
      if (el.parentNode.data) {
        var data = el.parentNode.data;
        if (el.className === 'node-box') {
          drawText(`node-${data.sector}`, '>', data.colorValue, 112);
        } else if (el.className === 'node-terminal') {
          drawText(`terminal-${data.sector}`, `>access code\n${data.code}\n\n>`, data.colorValue);
        }
      }
    });
  }
});

AFRAME.registerComponent('move-on-click', {
  init: function () {

    var el = this.el;
    var camera = document.getElementById("camera");

    el.addEventListener('click', function () {

      var cPos = camera.getAttribute('position');
      var elPos = el.getAttribute('position');

      animate(function(progress){
        var currentPos = {
          x: cPos.x + ((elPos.x - cPos.x) * progress),
          y: cPos.y,
          z: cPos.z + ((elPos.z - cPos.z) * progress),
        }
        camera.setAttribute('position', currentPos );
      }, 1000);

      // TODO: this is a hack and it doesn't work in VR mode :(
      // only in browser preview body is visible through transparency
      if (el.parentEl.data) {
        if (el.parentEl.data.isTrap) {
          document.body.style.backgroundColor = 'red';
        } else {
          document.body.style.backgroundColor = el.parentEl.data.colorValue;
        }
      } else {
        document.body.style.backgroundColor = el.getAttribute('color');
      }
    });
  }
});

AFRAME.registerComponent('hack-on-click', {
  init: function () {

    var el = this.el;

    el.addEventListener('click', function () {
      console.log("HACK");
      if (el.parentNode.data) {
        if (el.parentNode.data.isTarget) {
          console.log("YOU WIN");
        } else {
          console.log("WRONG!");
          el.components.sound.playSound();
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
    src: '#grid',
    position: pos,
    color: '#FFF', // TODO: change 'ambient color'
    height: 4,
    width: 4,
    depth: 4
  });
}

function getNode(pos, node) {
  let color = node.colorValue;
  var nodeEl = document.createElement('a-entity');

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
    'sound': { src: `url(${jsfxr([2,0.3,0.11,,0.56,0.4091,,0.1027,,,,-0.02,,0.3075,,,,,0.83,,,0.3,,0.5])})`, on: 'click' }
  }));

  // node inside bottom frame
  nodeEl.appendChild(createEntity('a-plane', {
    position: { x: pos.x, y: pos.y - 0.7, z: pos.z },
    color: node.isTrap ? 'red' : color,
    rotation: '-90 45 0',
    material: 'transparent:true',
    src: '#frame',
    height: 1.4,
    width: 1.4
  }));

  // node terminal
  // nodeEl.appendChild(createEntity('a-plane', {
  //   position: { x: pos.x - 0.5, y: pos.y - 0.4, z: pos.z - 0.5 },
  //   color: node.isTrap ? 'red' : color,
  //   rotation: '-10 45 0',
  //   height: 0.5,
  //   width: 0.5,
  //   'scale-on-hover': ''
  // }));

  // node terminal text
  nodeEl.appendChild(createEntity('a-plane', {
    'class': 'node-terminal',
    position: { x: pos.x - 0.5, y: pos.y - 0.4, z: pos.z - 0.5 },
    rotation: '-10 45 0',
    height: 0.5,
    width: 0.5,
    src: `#terminal-${node.isTrap ? 'trap' : node.sector}`,
    'fuse-on-hover': '',
    'text-on-hover': '',
    'hack-on-click': '',
    'sound': { src: `url(${jsfxr([1,0.06,0.3,0.2,0.08,0.18,,,,,,,,,,,,,1,,,0.09,,0.5])})`}
  }));

  nodeEl.data = node;

  return nodeEl;
}

function initNetwork() {
  // TODO: not hardcoded network
  return randomNetwork();
  //return networkFromCodes(["0xC2130", "0xD6451", "0xEFCDE", "0xF058D"]);
}

function drawTime(time, network, colorCodes) {
  let min = ~~(time / 60);
  let sec = time % 60;

  let formatted = `0${min}:${sec<10?'0':''}${sec}`;

  console.log(formatted);
  network.colors.forEach((color, i) => {
    drawText(`node-${i}`, `>\n\n\n ${formatted}`, colorCodes[color], 112);
  });
}

function initTimer(network, colorCodes) {
  var time = 5 * 60;

  drawTime(time, network, colorCodes);
  var timer = setInterval(() => {
    time--;
    drawTime(time, network, colorCodes);

    if (time <= 0) {
      console.log('YOU LOOSE!')
      clearInterval(timer);
    }

  }, 1000);
}

function drawText(canvas, text, bgColor, size = 64) {
  text = text.split('\n');
  var ctx = document.getElementById(canvas).getContext('2d');
  ctx.clearRect(0,0,512,512);
  if (bgColor) {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0,0,512,512);
  }
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 1;
  ctx.fillStyle = 'white';
  ctx.font = `${size}px Monaco, monospace`;
  text.forEach((line,i) => ctx.fillText(line, 10, (i+1) * size));
  text.forEach((line,i) => ctx.strokeText(line, 10, (i+1) * size));
}

AFRAME.registerComponent('cyberspace', {
  init: function () {
    // TODO: share with terminal
    // TODO: use darker colors (get rid of yellow?);
    //const colorCodes = ['#1B3', '#1AD', '#F70', '#D1A'];
    const colorCodes = ['#3E5', '#3CF', '#FF3', '#F3C'];


    let scene = this.el;

    let network = initNetwork();
    console.log("NETWORK", network);
    initTimer(network, colorCodes);

    // walls
    for (let i = 0; i <= 16; i++) {
      for (let j = 0; j <= 16; j++) {
        // position of walls cube
        let pos = {
          x: (i * 4),
          y: 2,
          z: (j * 4),
        }

        if (i === 0 || i == 16 || // fill walls around the maze
            j == 0 || j == 16 ||
            ((i % 2 === 0) && (j % 2 === 0))// fill every second sqare in the maze (corners)
        ) {
          scene.appendChild(getBox(pos));
        }
      }
    }

    // TODO: refactor it DRY
    // additional walls from network definition
    for (let i = 0; i < 8; i++) {
      let walls = network.walls.rowWalls[i];
      let wall = walls[0];

      if (wall) {
        let pos = {
          x: (wall * 2 * 4), // wall x * 2 grid columns * 4 units
          y: 2,
          z: ((i * 2 + 1) * 4) // row * 2 grid rows starting from 1 * 4 units
        }
        scene.appendChild(getBox(pos));
      }
      if (walls[1] && walls[1] !== walls) {
        wall = walls[1];
        let pos = {
          x: (wall * 2 * 4), // wall x * 2 grid columns * 4 units
          y: 2,
          z: ((i * 2 + 1) * 4) // row * 2 grid rows starting from 1 * 4 units
        }
        scene.appendChild(getBox(pos));
      }

      walls = network.walls.colWalls[i];
      wall = walls[0];

      if (wall) {
        let pos = {
          x: ((i * 2 + 1) * 4), // col * 2 grid cols starting from 1 * 4 units
          y: 2,
          z: (wall * 2 * 4) // wall y * 2 grid rows * 4 units
        }
        scene.appendChild(getBox(pos));
      }
      if (walls[1] && walls[1] !== wall) {
        wall = walls[1]
        let pos = {
          x: ((i * 2 + 1) * 4), // col * 2 grid cols starting from 1 * 4 units
          y: 2,
          z: (wall * 2 * 4) // wall y * 2 grid rows * 4 units
        }
        scene.appendChild(getBox(pos));
      }
    }

    // nodes
    let nodes = [];

    // get network codes and randomize their order
    // initial order is color / connections / traps / target
    let tmp = getNetworkCodes(network);
    let codes = [];
    codes.push(tmp.splice(randomInt(tmp.length),1)[0]);
    codes.push(tmp.splice(randomInt(tmp.length),1)[0]);
    codes.push(tmp.splice(randomInt(tmp.length),1)[0]);
    codes.push(tmp[0]);

    // find sectors to put hacker in useful sector first
    let colorSector = codes.indexOf(tmp[0]);
    let wallsSector = codes.indexOf(tmp[1]);

    codes.forEach((code, i) => {
      drawText(`terminal-${i}`, `>access code\n${code}\n\n>`, colorCodes[network.colors[i]]);
    });
    drawText('terminal-trap', `\n  INTRUDER  \n  DETECTED  \n`, 'red');

    network.colors.forEach((color, i) => {
      drawText(`node-${i}`, '>', colorCodes[color], 112);
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
        }

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

        node.colorValue = colorCodes[node.colorId];
        nodes[i][j] = node;
      }
    }

    // traps
    for (let i = 0; i < 4; i++) {
      let trap = network.traps.trapsXY[i];
      console.log(trap);
      nodes[trap[0]][trap[1]].isTrap = true;
      console.log(nodes[trap[0], trap[1]]);
    }

    // target
    nodes[network.target[0]][network.target[1]].isTarget = true;

    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        let pos = {
          x: ((i * 2 + 1) * 4),
          y: 1.7,
          z: ((j * 2 + 1) * 4),
        }

        nodes[i][j].el = getNode(pos, nodes[i][j]);
        scene.appendChild(nodes[i][j].el);
      }
    }

    var camera = document.getElementById('camera');
    camera.setAttribute('position', {
      x: ~~(Math.random() * 8) * 8 + 4,
      y: 0,
      z: ~~(Math.random() * 8) * 8 + 4,
    });
    camera.setAttribute('rotation', '0 45 0');
  }
});
