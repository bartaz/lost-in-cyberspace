
// spread: 1-7
// offset: 0-7

function computeWalls(spread, offset) {
  let walls = [];
  let error = 0;

  for (let i = 0; i < 8; i++) {
    let j = (i * spread + error) % 8;

    if (walls[j] !== undefined) {
      error++;
      j = (i * spread + error) % 8;
    }

    walls[j] = i;
  }

  if (offset) {
    walls = walls.concat(walls.splice(0,offset));
  }

  return walls;
}

function randomInt(max) {
  return ~~(Math.random() * max)
}

function randomWalls() {
  let rowSpread = randomInt(6) + 1;
  let rowOffset = randomInt(7);
  let rowWalls = computeWalls(rowSpread, rowOffset);

  let colSpread = randomInt(6) + 1;
  let colOffset = randomInt(7);
  let colWalls = computeWalls(colSpread, colOffset);

  // prefent non connected nodes from appearing in the corners
  while (
    (rowWalls[0] === 1 && colWalls[0] === 1) ||
    (rowWalls[7] === 7 && colWalls[7] === 7) ||
    (rowWalls[0] === 7 && colWalls[7] === 1) ||
    (rowWalls[7] === 1 && colWalls[0] === 7)
  ) {
    colSpread = randomInt(6) + 1;
    colOffset = randomInt(7);
    colWalls = computeWalls(colSpread, colOffset);
  }

  return {
    rowSpread: rowSpread,
    rowOffset: rowOffset,
    colSpread: colSpread,
    colOffset: colOffset,
    rowWalls: rowWalls,
    colWalls: colWalls
  }
}

function randomColors() {
  let colors = [0,1,2,3];
  let sectorAColor = colors.splice(randomInt(colors.length),1)[0];
  let sectorBColor = colors.splice(randomInt(colors.length),1)[0];
  let sectorCColor = colors.splice(randomInt(colors.length),1)[0];
  let sectorDColor = colors[0];

  return [
    sectorAColor,
    sectorBColor,
    sectorCColor,
    sectorDColor
  ]
}

function randomTarget() {
  return [randomInt(8), randomInt(8)];
}

function randomTraps() {
  let trapsSeed = [
    randomInt(16),
    randomInt(16),
    randomInt(16),
    randomInt(16),
  ];
  let trapsXY = [];

  for (let i = 0; i < 4; i++) {
    let seed = trapsSeed[i]
    let xy = [seed % 4, ~~(seed / 4)];
    if (i === 1 || i === 3) {
      xy[0] = xy[0] + 4; // move x coord for sectors B and D
    }
    if (i === 2 || i === 3) {
      xy[1] = xy[1] + 4; // move y coord for sectors C and D
    }
    trapsXY.push(xy);
  }

  return {
    trapsSeed: trapsSeed,
    trapsXY: trapsXY
  }
}

function randomNetwork() {
  let traps = randomTraps();
  let target = randomTarget();

  // prevent target from appearing on traps
  while (
    target.join() === traps.trapsXY[0].join() ||
    target.join() === traps.trapsXY[1].join() ||
    target.join() === traps.trapsXY[2].join() ||
    target.join() === traps.trapsXY[3].join()
  ) {
    target = randomTarget();
  }

  return {
    traps: randomTraps(),
    target: randomTarget(),
    colors: randomColors(),
    walls: randomWalls()
  }
}

function runTests() {

  function it(message, condition) {
    console[condition ? 'info' : 'error'](message);
  }

  console.group('computeWalls');

  it('should return sorted array for spread and offset 0',
    computeWalls(0,0).join() === [0,1,2,3,4,5,6,7].join()
  );

  it('should return array with defined spread of values',
    computeWalls(3,0).join() === [0,3,6,1,4,7,2,5].join()
  );

  it('should return valid array for spread that would overlap',
    computeWalls(4,0).join() === [0,2,4,6,1,3,5,7].join()
  );

  it('should offset array by given number',
    computeWalls(0,5).join() === [5,6,7,0,1,2,3,4].join()
  );

  console.groupEnd();
}

function getNetworkMap(network) {
  // 0 - wall (nothing)
  // 1 - connection h
  // 2 - connection v
  // 3 - node
  //const nodesLine = '&block;&boxh;&block;&boxh;&block;&boxh;&block;&boxh;&block;&boxh;&block;&boxh;&block;&boxh;&block;';
  //const linksLine = '&boxv; &boxv; &boxv; &boxv; &boxv; &boxv; &boxv; &boxv;';
  const colorCodes = ['#3E5', '#3CF', '#FF3', '#F3C'];
  const nodesLine = [3,1,3,1,3,1,3,1,3,1,3,1,3,1,3];
  const linksLine = [2,0,2,0,2,0,2,0,2,0,2,0,2,0,2];
  let networkGrid = []

  for (let i = 0; i < 8; i++) {
    networkGrid.push(nodesLine.slice(0));
    if (i < 7) {
      networkGrid.push(linksLine.slice(0));
    }
  }

  if (network && network.walls) {
    let walls;
    if (network.walls.rowWalls) {
      walls = network.walls.rowWalls;
      for (i = 0; i < 8; i++) {
        if (walls[i]) {
          networkGrid[i * 2][walls[i] * 2 - 1] = 0;
        }
      }
    }

    if (network.walls.colWalls) {
      walls = network.walls.colWalls;
      for (i = 0; i < 8; i++) {
        if (walls[i]) {
          networkGrid[walls[i] * 2 - 1][i * 2] = 0;
        }
      }
    }
  }
  // turn magic numbers into HTML friendly string representation
  let networkString = networkGrid.map(function(line, i){
    var x = 0;
    return line.join('').replace(/0/g, ' ').replace(/1/g, '-').replace(/2/g, '|')
      .replace(/3/g, function(){
          let y = i / 2;
          var node = '&#9670;';

          if (network.target) {
            if ((y === network.target[1]) && (x === network.target[0])) {
              node = 'X';
            }
          }

          if (network.traps && network.traps.trapsXY) {
            for (let trap of network.traps.trapsXY) {
              if ((x === trap[0]) && (y === trap[1])) {
                node = '!';
              }
            }
          }

          if (network.colors) {
            var color;

            if (y < 4) {
              color = (x < 4) ? colorCodes[network.colors[0]] : colorCodes[network.colors[1]];
            } else {
              color = (x < 4) ? colorCodes[network.colors[2]] : colorCodes[network.colors[3]];
            }

            x++;

            return '<span style="color: '+ color +'">' + node + '</span>';
          };

          return node;
      });
  }).join('\n');

  return networkString;
}

var n = randomNetwork();
console.log(n);
document.body.innerHTML = getNetworkMap(n);
