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

function animate(draw, duration) {
  let start = performance.now();

  requestAnimationFrame(function animate(time) {
    // timeFraction goes from 0 to 1
    let timeFraction = (time - start) / duration;
    if (timeFraction > 1) timeFraction = 1;

    // calculate the current animation state
    let progress = timeFraction

    draw(progress); // draw it

    if (timeFraction < 1) {
      requestAnimationFrame(animate);
    }
  });
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
    position: pos,
    color: color,
    height: 1.5,
    width: 1.5,
    depth: 1.5,
    rotation: '0 45 0',
    'move-on-click': '',
    'scale-on-hover': ''
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
  nodeEl.appendChild(createEntity('a-plane', {
    position: { x: pos.x - 0.5, y: pos.y - 0.4, z: pos.z - 0.5 },
    color: node.isTrap ? 'red' : color,
    rotation: '-10 45 0',
    height: 0.5,
    width: 0.5
  }));

  // node terminal text
  let text = 'node\n' + node.code;
  if (node.isTrap) {
    text = 'intruder\ndetected!'
  }
  if (node.isTarget) {
    text = 'target'
  }
  nodeEl.appendChild(createEntity('a-text', {
    position: { x: pos.x - 0.5, y: pos.y - 0.35, z: pos.z - 0.5 },
    color: '#fff',
    rotation: '-10 45 0',
    height: 0.45,
    width: 0.45,
    anchor: 'center',
    'wrap-count': 10,
    font: 'sourcecodepro',
    value: text + "\n\n>hack"
  }));

  nodeEl.data = node;

  return nodeEl;
}

function initNetwork() {
  // TODO: not hardcoded network
  return randomNetwork();
  //return networkFromCodes(["0xC2130", "0xD6451", "0xEFCDE", "0xF058D"]);
}

AFRAME.registerComponent('cyberspace', {
  init: function () {
    // TODO: share with terminal
    const colorCodes = ['#3E5', '#3CF', '#FF3', '#F3C'];

    let scene = this.el;

    let network = initNetwork();

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
    let tmp = getNetworkCodes(network);
    let codes = [];
    codes.push(tmp.splice(randomInt(tmp.length),1)[0]);
    codes.push(tmp.splice(randomInt(tmp.length),1)[0]);
    codes.push(tmp.splice(randomInt(tmp.length),1)[0]);
    codes.push(tmp[0]);

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
        } else {
          node.colorId = (i < 4) ? network.colors[2] : network.colors[3];
          node.code = (i < 4) ? codes[2] : codes[3];
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
    })
  }
});
