
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

// combine 2 arrays of walls into 2 arrays of pairs
function combineWalls(rowWalls, colWalls) {
  return {
    rowWalls: rowWalls.map(function(w, i) { return [w, 7 - colWalls[i]]; }),
    colWalls: colWalls.map(function(w, i) { return [w, 7 - rowWalls[i]]; })
  };
}

/* exported randomInt */ // used by cyberspace
function randomInt(max) {
  return ~~(Math.random() * max);
}

function createWallsObject(rowSpread, rowOffset, colSpread, colOffset) {
  if (rowSpread === 0 || colSpread === 0) {
    return null;
  }

  let rowWalls = computeWalls(rowSpread, rowOffset);
  let colWalls = computeWalls(colSpread, colOffset);

  let walls = combineWalls(rowWalls, colWalls);

  // make sure all nodes are connected
  if (!areAllNodesConnected(walls.rowWalls, walls.colWalls)) {
    return null;
  }

  return {
    rowSpread: rowSpread,
    rowOffset: rowOffset,
    colSpread: colSpread,
    colOffset: colOffset,
    rowWalls: walls.rowWalls,
    colWalls: walls.colWalls
  };
}

function areAllNodesConnected(rowWalls, colWalls) {
  let nodes = [];

  for (let i = 0; i < 8; i++) {
    nodes[i] = [];
    for (let j = 0; j < 8; j++) {
      nodes[i][j] = 0;
    }
  }
  visitNode(nodes, 0,0, rowWalls, colWalls);

  nodes = nodes.reduce((a, b) => a.concat(b));
  return (nodes.indexOf(0) === -1);
}

function visitNode(nodes, x, y, rowWalls, colWalls) {
  if (nodes[x][y]) { // if node already visited
    nodes[x][y]++;
    return;
  }
  //console.log('visiting', x, y);

  nodes[x][y] = 1; // mark visited

  let nx, ny; // neighbour coords

  // neighbour to the right (x+1, y)
  nx = x+1;
  ny = y;
  if (nx < 8) {
    //console.log("going right", nx, ny);
    if (rowWalls[y].indexOf(nx) === -1) {  // is neighbour connected to left?
      visitNode(nodes, nx, ny, rowWalls, colWalls);
    } else {
      //console.log('wall');
    }
  }

  // neighbour to the bottom (x, y+1)
  nx = x;
  ny = y+1;
  if (ny < 8) {
    //console.log("going down", nx, ny);
    if (colWalls[x].indexOf(ny) === -1) {  // is neighbour connected to top?
      visitNode(nodes, nx, ny, rowWalls, colWalls);
    } else {
      //console.log('wall');
    }
  }

  // neighbour to the left (x-1, y)
  nx = x-1;
  ny = y;
  if (nx >= 0) {
    //console.log("going left", nx, ny);
    if (rowWalls[y].indexOf(x) === -1) {  // is this node connected to left?
      visitNode(nodes, nx, ny, rowWalls, colWalls);
    } else {
      //console.log('wall');
    }
  }

  // neighbour to the top (x, y-1)
  nx = x;
  ny = y-1;
  if (ny >= 0) {
    //console.log("going up", nx, ny);
    if (colWalls[x].indexOf(y) === -1) {  // is this node connected to top?
      visitNode(nodes, nx, ny, rowWalls, colWalls);
    } else {
      //console.log('wall');
    }
  }
}

function randomWalls() {
  let rowSpread = randomInt(6) + 1;
  let rowOffset = randomInt(7);
  let colSpread = randomInt(6) + 1;
  let colOffset = randomInt(7);

  let walls = createWallsObject(rowSpread, rowOffset, colSpread, colOffset);

  // try until valid walls are created
  while (!walls) {
    colSpread = randomInt(6) + 1;
    colOffset = randomInt(7);
    walls = createWallsObject(rowSpread, rowOffset, colSpread, colOffset);
  }

  return walls;
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
  ];
}

function randomTarget() {
  return [randomInt(8), randomInt(8)];
}

function createTrapsObject(trapsSeed) {
  let trapsXY = [];

  for (let i = 0; i < 4; i++) {
    let seed = trapsSeed[i];
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
  };
}

function randomTraps() {
  let trapsSeed = [
    randomInt(16),
    randomInt(16),
    randomInt(16),
    randomInt(16),
  ];

  return createTrapsObject(trapsSeed);
}

/* exported randomNetwork */ // used by cyberspace
function randomNetwork() {
  let traps = randomTraps();
  let target = randomTarget();

  // prevent target from appearing on traps
  while (
    traps.trapsXY.some((xy) => xy.join() === target.join())
  ) {
    traps = randomTraps();
    target = randomTarget();
  }

  return {
    traps: traps,
    target: target,
    colors: randomColors(),
    walls: randomWalls()
  };
}

/* exported getNetworkMap */ // used by terminal (and network.html for testing)
function getNetworkMap(network) {
  const colorCodes = ['#3E5', '#3CF', '#FF3', '#F3C'];

  // 0 - wall (nothing)
  // 1 - connection h
  // 2 - connection v
  // 3 - node
  // 4 - trap
  // 5 - target
  const nodesLine = [3,1,3,1,3,1,3,1,3,1,3,1,3,1,3];
  const linksLine = [2,0,2,0,2,0,2,0,2,0,2,0,2,0,2];
  let networkGrid = [];

  // create a default empty network map
  for (let i = 0; i < 8; i++) {
    networkGrid.push(nodesLine.slice(0));
    if (i < 7) {
      networkGrid.push(linksLine.slice(0));
    }
  }

  // TODO: refactor DRY
  // if network has definition of walls/connections put them into map
  if (network && network.walls) {
    let walls;
    if (network.walls.rowWalls) {
      walls = network.walls.rowWalls;
      for (let i = 0; i < 8; i++) {
        if (walls[i][0]) {
          networkGrid[i * 2][walls[i][0] * 2 - 1] = 0;
        }
        if (walls[i][1]) {
          networkGrid[i * 2][walls[i][1] * 2 - 1] = 0;
        }
      }
    }

    if (network.walls.colWalls) {
      walls = network.walls.colWalls;
      for (let i = 0; i < 8; i++) {
        if (walls[i][0]) {
          networkGrid[walls[i][0] * 2 - 1][i * 2] = 0;
        }
        if (walls[i][1]) {
          networkGrid[walls[i][1] * 2 - 1][i * 2] = 0;
        }
      }
    }
  }

  // if network has definition of traps put them on the map
  if (network.traps && network.traps.trapsXY) {
    for (let trap of network.traps.trapsXY) {
      networkGrid[trap[1] * 2][trap[0] * 2] = 4;
    }
  }

  // if network has definition of target
  if (network.target) {
    networkGrid[network.target[1] * 2][network.target[0] * 2] = 5;
  }

  // turn magic numbers into HTML friendly string representation
  let networkString = networkGrid.map(function(line, i){
    var x = 0;
    return line.join('')
      .replace(/0/g, '<span class="char"></span>') // print walls
      .replace(/1|2/g, function(value) { // print connections
        if (network && network.walls) { //if network has connections
          if (value === '1') {
            return '<span class="char">-</span>';
          }
          if (value === '2') {
            return '<span class="char">|</span>';
          }
        } else { //by default dont show connections at all
          return '<span class="char"></span>';
        }
      })
      .replace(/3|4|5/g, function(value) { // print nodes (including traps & target)
        let y = i / 2;
        var node = '&#9830;'; // standard node

        if (value === '4') { // it's a trap!
          node = '&#8709;';
        }

        if (value === '5') { // target
          node = 'X';
        }

        if (network.colors) {
          var color;

          if (y < 4) {
            color = (x < 4) ? colorCodes[network.colors[0]] : colorCodes[network.colors[1]];
          } else {
            color = (x < 4) ? colorCodes[network.colors[2]] : colorCodes[network.colors[3]];
          }

          x++;

          return '<span class="char" style="color: '+ color +'">' + node + '</span>';
        }

        return node;
      });
  }).join('\n');

  return networkString;
}

// GENERATING NETWORK CODES
// ==========================

// Code structure
// ----------------
//
// 0xTCCCC
//
// 0x - just a prefix to make it fancy
//
// T  - hex value [0-F] defining type of the code (colors, walls, traps, target)
//      T % 4 gives a number 0-3: (0: colors, 1: walls, 2: traps, 3: target)
//
// C - 4 hex values [0-F] defining the code value (depends on code type)

function parseCode(code) {
  code = code
    .replace('0x','')
    .split(''); // turn into array of hex characters

  if (code.length !== 5) {
    throw new Error('Invalid code. Code length is not valid.');
  }

  code = code
    .map(x => parseInt(x, 16)) // parse hex values
    .filter(n => !isNaN(n)); // get only numbers

  if (code.length !== 5) {
    throw new Error('Invalid code. Code contains invalid characters');
  }

  return code;
}

// Colors codes
// -------------
//
// 0xTABCD
//
// T - color code value T % 4 = 0: [0,4,8,C]
// ABCD - colors of corresponding sectors (A, B, C, D)
//        number on each position % 4 gives 0-3: id of a color
//
// Color of each sector needs to be different, otherwise code is invalid.
//
// Examples:
// 0xC16F8
// C % 4 = 0 (code defines color, C for color ;)
// 1 % 4 = 1 (color of sector A is 1)
// 6 % 4 = 2 (color of sector B is 2)
// F % 4 = 3 (color of sector C is 3)
// 8 % 4 = 0 (color of sector D is 0)
//
// 0x44206
// 4 % 4 = 0 (code defines color)
// 4 % 4 = 0 (color of sector A is 0)
// 2 % 4 = 2 (color of sector B is 2)
// 0 % 4 = 0 (color of sector C is 0)
// 6 % 4 = 2 (color of sector D is 2)
// Code is invalid as it has duplicated colors

function colorsToCode(colors) {
  let type = 'C'; // TODO: make it 0,4,8,C later?
  let code = '0x' + type + colors.join(''); // TODO: shift colors % 4

  return code;
}

// returns colors array for given color code
// throws if code is invalid
function decodeColors(values) {
  let colors = values.map(n => n % 4);

  let hasDuplicates = colors.some((c,i) => colors.indexOf(c) !== i);

  if (hasDuplicates) {
    throw new Error('Invalid code. Duplicated colors in different sectors');
  }

  return colors;
}
// Walls/connections codes
// -------------
//
// 0xT Sr Or Sc Oc
//
// T - walls code value T % 4 = 1: [1,5,9,D]
// Sr - row spread value for computing walls
//      Sr % 8 gives value of spread [1-7]
// Or - row offset value for computing walls
//      0r % 8 gives value of offset [0-7]
// Sc - column spread value for computing walls
//      Sr % 8 gives value of spread [1-7]
// Oc - column offset value for computing walls
//      0r % 8 gives value of offset [0-7]
//
// Spread may not have value of 0.
// Walls may not generate not connected corners.
// In such cases code is invalid.
//
// Examples:
// 0xD1234
// D % 4 = 1 (code defines walls)
// 1 % 8 = 1 (row spread value is 1)
// 2 % 8 = 2 (row offset value is 2)
// 3 % 8 = 3 (column spread value is 3)
// 4 % 8 = 4 (column spread value is 4)
//
// 0x1298E
// 1 % 4 = 1 (code defines walls)
// 2 % 8 = 2 (row spread value is 2)
// 9 % 8 = 1 (row offset value is 1)
// 8 % 8 = 0 (column spread value is 0)
// E % 8 = 6 (column spread value is 6)
// Code is invalid because spread can't be 0

function wallsToCode(walls) {
  let type = 'D'; // TODO: make it 1,5,9,D later?
  let code = '0x' + type;

  code = code + walls.rowSpread +
                walls.rowOffset +
                walls.colSpread +
                walls.colOffset; // TODO: shift values % 8

  return code;
}

// returns walls definition array for given wall code
// throws if code is invalid
function decodeWalls(values) {
  values = values.map(n => n % 8);

  let walls = createWallsObject(values[0], values[1], values[2], values[3]);

  if (!walls) {
    throw new Error('Invalid code. Code contains invalid walls definition');
  }

  return walls;
}

// Traps codes
// -------------
//
// 0xTABCD
//
// T - traps code value T % 4 = 2: [2,6,A,E]
// ABCD - traps positions in corresponding sectors (A, B, C, D)
//        number on each position [0-15] defines position of trap in given sector:
//            0  1  2  3
//            4  5  6  7
//            8  9 10 11
//           12 13 14 15
//
// Examples:
// 0xEF4D0
// E % 4 = 2 (code defines traps)
// F = 15 (trap position in sector A is 15, so its coors are [3,3] in whole network)
// 4      (trap position in sector B is 4, so its coors are [4,1] in whole network)
// D = 1  (trap position in sector C is 1, so its coors are [1,4] in whole network)
// 0      (trap position in sector D is 1, so its coors are [4,4] in whole network)

function trapsToCode(traps) {
  let type = 'E'; // TODO: make it 2,6,A,E later?
  let code = '0x' + type;

  code = code + traps.trapsSeed
    .map(t => t.toString(16).toUpperCase())
    .join('');

  return code;
}

// returns traps definition for given traps code
// throws if code is invalid
// TODO: not needed?
function decodeTraps(values) {
  return createTrapsObject(values);
}

// Target codes
// -------------
//
// 0xTXYXY
//
// T - traps code value T % 4 = 3: [3,7,B,F]
// XY - target coordinates in the network
//      each number % 8 is a X/Y coordinate 0-7
//
// Second pair of XY in the code is currently not used for any additional data.
// It should contain duplicated values of previous XY, which can be used to
// verify if code is valid.
//
// Examples:
// 0xB129A
// B % 4 = 3 (code defines target)
// 1 % 8 = 1 (X coordinate of target in network is 1)
// 2 % 8 = 2 (Y coordinate of target in network is 2)
// 9 % 8 = 1 (duplicated X coordinate of target in network is 1)
// A % 8 = 2 (duplicated Y coordinate of target in network is 2)
//
// 0xF298E
// F % 4 = 3 (code defines target)
// 2 % 8 = 2 (X coordinate of target in network is 2)
// 9 % 8 = 1 (Y coordinate of target in network is 1)
// 8 % 8 = 0 (duplicated X coordinate of target in network is 0)
// E % 8 = 6 (duplicated Y coordinate of target in network is 6)
// Code is invalid because duplicated coordinates don't match

function targetToCode(target) {
  let type = 'F'; // TODO: make it 3,7,B,F later?
  let code = '0x' + type;

  code = code + target.join('') + target
    .map(t => (t + 8).toString(16).toUpperCase())
    .join('');

  return code;
}

// returns target definition for given target code
// throws if code is invalid
function decodeTarget(values) {
  values = values.map(n => n % 8);

  if (values[0] !== values[2] || values[1] !== values[3]) {
    throw new Error('Invalid code. Code contains invalid target definition');
  }

  return values.splice(0,2);
}

// Generating network definition from list of codes
/* exported getNetworkCodes */ // used by cyberspace
function getNetworkCodes(network) {
  return [
    colorsToCode(network.colors),
    wallsToCode(network.walls),
    trapsToCode(network.traps),
    targetToCode(network.target)
  ];
}

/* exported networkFromCodes */ // used by terminal (and cyberspace for testing)
function networkFromCodes(codes) {
  let network = {};
  let errors = [];

  if (!codes || !codes.length) {
    errors.push("No codes defined");
  } else {
    for (let i = 0; i < codes.length; i++) {
      let code = codes[i];
      let parsed = null;

      try {
        parsed = parseCode(code);
      } catch(e) {
        errors.push(code + ": " + e.message);
      }

      if (parsed) {
        let type = parsed.shift() % 4;

        try {
          switch(type) {
            case 0:
              network.colors = decodeColors(parsed);
              network.colors.code = code;
              break;
            case 1:
              network.walls = decodeWalls(parsed);
              network.walls.code = code;
              break;
            case 2:
              network.traps = decodeTraps(parsed);
              network.traps.code = code;
              break;
            case 3:
              network.target = decodeTarget(parsed);
              network.target.code = code;
              break;
          }
          // TODO: check if multiple codes of same type are given
          // TODO: check if traps conflict with target
        } catch (e) {
          errors.push(code + ": " + e.message);
        }
      }
    }
  }

  if (errors.length) {
    network.errors = errors;
  }

  return network;
}
