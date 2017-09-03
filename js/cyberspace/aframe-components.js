/* global AFRAME */

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

/* global animate */
AFRAME.registerComponent('fuse-on-hover', {
  init: function () {
    let defaultRadius = 0.007;
    let el = this.el;
    let cursor = document.getElementById("cursor");
    let cancel;

    el.addEventListener('mouseenter', () => {
      cursor.setAttribute('scale', { x: 1.2, y: 1.2, z: 1.2 });
      cancel = animate(progress => {
        let val = defaultRadius - (defaultRadius - 0.0001) * progress;
        cursor.setAttribute('geometry', { radiusInner: val });
      }, 1500);
    });

    let handleCancel = () => {
      cursor.setAttribute('scale', { x: 1, y: 1, z: 1 });
      cursor.setAttribute('material', { color: 'white' });
      cursor.setAttribute('geometry', { radiusInner: defaultRadius });
      cancel();
    };

    el.addEventListener('mouseleave', handleCancel);
    el.addEventListener('click', handleCancel);
  }
});

/* global drawTerminals drawNodes */
AFRAME.registerComponent('text-on-hover', {
  init: function () {
    let el = this.el;
    el.addEventListener('mouseenter', () => {
      if (el.className === 'node-box') {
        // we change the texture for all nodes in same sector,
        // but it doesn't matter as player sees only one ;)
        drawNodes('switch');
      } else if (el.className === 'node-action-hack') {
        drawTerminals('hack');
      }
    });
    el.addEventListener('mouseleave', () => {
      if (el.className === 'node-box') {
        drawNodes();
      } else if (el.className === 'node-action-hack') {
        drawTerminals();
      }
    });
  }
});

/* global initTimer enterNode */
AFRAME.registerComponent('move-on-click', {
  init: function () {

    let el = this.el;
    let camera = document.getElementById("camera");
    let moving = false;

    el.addEventListener('click', () => {
      if (moving) return;

      let cPos = camera.getAttribute('position');
      let elPos = el.getAttribute('position');

      animate(progress => {
        let currentPos = {
          x: cPos.x + ((elPos.x - cPos.x) * progress),
          y: cPos.y,
          z: cPos.z + ((elPos.z - cPos.z) * progress),
        };
        camera.setAttribute('position', currentPos );
      }, 1000);

      let data = el.parentEl.data;

      if (data) {
        initTimer();
        moving = true;
        setTimeout(() => {
          enterNode(data, true);
          moving = false;
        }, 900);
      }
    });
  }
});

/* global win reduceTime terminalWin terminalHacked */
AFRAME.registerComponent('hack-on-click', {
  init: function () {
    let el = this.el;
    let parent = el.parentNode.parentNode;

    el.addEventListener('click', () => {
      console.log("HACK");
      if (parent.data) {
        if (parent.data.isTarget) {
          console.log("YOU WIN");
          terminalWin = true;
          drawTerminals();
          win();
        } else {
          initTimer();
          console.log("WRONG!");

          parent.data.isHacked = true;
          terminalHacked = true;
          el.components.sound.playSound();
          reduceTime(10);
        }
      }
    });
  }
});

/* global drawText network randomNetwork getNetworkCodes randomInt initTextures sectorCodes getBox COLOR_VALUES getNode */
AFRAME.registerComponent('cyberspace', {
  init: function () {
    let scene = this.el;

    network = randomNetwork();
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

    drawText('terminal-trap', `\n    INTRUDER  \n    DETECTED  \n`, 'red');

    drawNodes();

    // init node object values
    for (let i = 0; i < 8; i++) {
      nodes[i] = [];
      for (let j = 0; j < 8; j++) {
        let node = {
          colorId: null,
          colorValue: null,
          isTrap: false,
          isTarget: false,
          isHacked: false,
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

    let i,j;
    for (i = 0; i < 8; i++) {
      for (j = 0; j < 8; j++) {
        let pos = {
          x: ((i * 2 + 1) * 4),
          y: 1.7,
          z: ((j * 2 + 1) * 4),
        };

        nodes[i][j].el = getNode(pos, nodes[i][j]);
        scene.appendChild(nodes[i][j].el);
      }
    }

    // prison
    let prison = {
      colorValue: 'red',
      isTrap: true
    };
    prison.el = getNode({ x: 0, y: 1.7, z: 0}, prison);
    scene.appendChild(prison.el);


    tmp = getNetworkCodes(network);

    let node;
    do {
      i = randomInt(8);
      j = randomInt(8);
      node = nodes[i][j];
    } while (
      //node.isTrap || !(node.code === tmp[0] || node.code === tmp[1])
      !node.isTarget
    );

    let camera = document.getElementById('camera');
    // TODO: read position from the node el?
    // TODO: set position on node el and position the rest relatively
    let pos = {
      x: ((i * 2 + 1) * 4),
      y: 0,
      z: ((j * 2 + 1) * 4),
    };
    camera.setAttribute('position', pos);
    camera.setAttribute('rotation', '0 45 0');
    enterNode(node);
  }
});
