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
      } if (el.className === 'node-action-help') {
        drawTerminals('help');
      }
    });
    el.addEventListener('mouseleave', () => {
      drawNodes();
      drawTerminals();
    });
  }
});

/* global isGameOver cancelMove initTimer enterNode paintWalls COLOR_VALUES currentNode */
AFRAME.registerComponent('move-on-click', {
  init: function () {

    let el = this.el;
    let camera = document.getElementById("camera");
    let moving = false;

    el.addEventListener('click', () => {
      if (moving || isGameOver) return;

      let cPos = camera.getAttribute('position');
      let elPos = el.getAttribute('position');

      let data = el.parentEl.data;

      let fromColor = currentNode.isTrap ? COLOR_TRAP : COLOR_VALUES[network.colors[currentNode.sector]];
      let nextColor = data.isTrap ? COLOR_TRAP : COLOR_VALUES[network.colors[data.sector]];

      // get array of RGB values from #RGB notation (just 16 steps per channel)
      let fromRGB = fromColor.split('').splice(1).map(h => parseInt(h, 16));
      let nextRGB = nextColor.split('').splice(1).map(h => parseInt(h, 16));

      cancelMove = animate(progress => {
        let currentPos = {
          x: cPos.x + ((elPos.x - cPos.x) * progress),
          y: cPos.y,
          z: cPos.z + ((elPos.z - cPos.z) * progress),
        };
        camera.setAttribute('position', currentPos );

        // if nodes have different colors, animate the walls
        if (fromColor !== nextColor) {
          paintWalls('#' + fromRGB.map((from, i) => {
            // simple animation of each #RGB value
            // each represented by single hex value (so just 16 steps instead of 256)
            // but it's good enough to keep it that simple
            return (~~(from + ((nextRGB[i] - from) * progress))).toString(16);
          }).join(''));
        }
      }, 1000);


      if (data) {
        initTimer();
        moving = true;
        setTimeout(() => {
          if (!isGameOver) {
            enterNode(data, true);
            moving = false;
          }
        }, 900);
      }
    });
  }
});

/* global win reduceTime */
AFRAME.registerComponent('hack-on-click', {
  init: function () {
    let el = this.el;

    // action > terminal entity > node inside entity > node (with data)
    let parent = el.parentNode.parentNode.parentNode;

    el.addEventListener('click', () => {
      console.log('hack-on-click', el);
      if (parent.data) {
        if (parent.data.isTarget) {
          win();
        } else {
          initTimer();
          parent.data.isHacked = true;
          el.components.sound.playSound();
          reduceTime(16);
        }
      }
    });
  }
});

AFRAME.registerComponent('help-on-click', {
  init: function () {
    let el = this.el;
    let hint = el.parentNode.querySelector('.hint');

    el.addEventListener('click', () => {
      console.log('help-on-click', el);
      hint.setAttribute('visible', !hint.getAttribute('visible'));
    });
  }
});

/* global prison network randomNetwork getNetworkCodes randomInt initTextures sectorCodes getBox getNode */
AFRAME.registerComponent('cyberspace', {
  init: function () {
    let scene = this.el;

    network = randomNetwork();
    console.log("NETWORK", network);

    // get network codes and randomize their order
    // initial order is color / connections / traps / target
    let networkCodes = getNetworkCodes(network);

    let target = network.target;
    let targetCodeSector;

    // put target code in opposite sector then target itself
    // 0 1        3 2
    // 2 3   =>   1 0
    if (target[1] < 4) {
      targetCodeSector = (target[0] < 4) ? 3 : 2;
    } else {
      targetCodeSector = (target[0] < 4) ? 1 : 0;
    }

    // node sector colors and codes
    // take all codes except target code (which luckly is last in the array)
    let tmp = networkCodes.slice(0,3);
    // randomize the 3 codes
    sectorCodes = [];
    sectorCodes.push(tmp.splice(randomInt(tmp.length),1)[0]);
    sectorCodes.push(tmp.splice(randomInt(tmp.length),1)[0]);
    sectorCodes.push(tmp[0]);

    // put target code at proper index into sector codes
    sectorCodes.splice(targetCodeSector, 0, networkCodes[3]);

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

    // init node object values
    for (let i = 0; i < 8; i++) {
      nodes[i] = [];
      for (let j = 0; j < 8; j++) {
        let node = {
          isTrap: false,
          isTarget: false,
          isHacked: false,
          el: null,
        };

        // node sector colors and codes
        if (j < 4) {
          node.code = (i < 4) ? sectorCodes[0] : sectorCodes[1];
          node.sector = (i < 4) ? 0 : 1;
        } else {
          node.code = (i < 4) ? sectorCodes[2] : sectorCodes[3];
          node.sector = (i < 4) ? 2 : 3;
        }

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
    prison = {
      isTrap: true,
      sector: 0
    };
    prison.el = getNode({ x: 0, y: 1.7, z: 0}, prison);
    scene.appendChild(prison.el);

    let node;
    do {
      i = randomInt(8);
      j = randomInt(8);
      node = nodes[i][j];
    } while (
      node.isTrap || node.isTarget || !(node.code === networkCodes[0] || node.code === networkCodes[1])
      //!node.isTarget
    );

    let camera = document.getElementById('camera');
    // TODO: read position from the node el?
    // TODO: set position on node el and position the rest relatively
    let pos = {
      x: ((i * 2 + 1) * 4),
      z: ((j * 2 + 1) * 4)
    };
    camera.setAttribute('position', pos);
    camera.setAttribute('rotation', '0 45 0');

    paintWalls( node.isTrap ? COLOR_TRAP : COLOR_VALUES[network.colors[node.sector]] );
    enterNode(node);
  }
});
