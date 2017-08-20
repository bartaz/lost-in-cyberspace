
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
  let networkGrid = []

  // create a default empty network map
  for (let i = 0; i < 8; i++) {
    networkGrid.push(nodesLine.slice(0));
    if (i < 7) {
      networkGrid.push(linksLine.slice(0));
    }
  }

  // if network has definition of walls put them into map
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
      .replace(/0/g, ' ') // print walls
      .replace(/1/g, '-').replace(/2/g, '|') // print connections
      .replace(/3|4|5/g, function(value) { // print nodes (including traps & target)
          let y = i / 2;
          var node = '&#9670;'; // standard node

          if (value === '4') { // it's a trap!
            node = '!'
          }

          if (value === '5') { // target
            node = 'X'
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
  let code = '0x' + type;

  for (let i = 0; i < 4; i++) {
    code = code + colors[i]; // TODO: shift colors
  }

  return code;
}

// returns colors array for given color code
// throws if code is invalid
function codeToColors(code) {
  code = code
    .replace('0x','')
    .split(''); // turn into array of hex characters

  if (code.length !== 5) {
    throw new Error('Invalid code. Code length is not valid.');
  }

  code = code
    .map(function(x) { return parseInt(x, 16)} ) // parse hex values
    .filter(function(n) { return !isNaN(n)} ) // get only numbers

  if (code.length !== 5) {
    throw new Error('Invalid code. Code contains invalid characters');
  }

  let type = code.shift();

  if (type % 4 !== 0) {
    throw new Error('Invalid code. Code type is not a color code');
  }

  let colors = code.map(function(n) { return n % 4 });

  let hasDuplicates = colors.some(function (c,i) { return colors.indexOf(c) !== i });

  if (hasDuplicates) {
    throw new Error('Invalid code. Duplicated colors in different sectors');
  }

  return colors;
}


// TESTS

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

  console.group('colorsToCode');

  let colors = [0,1,2,3];

  it('should return valid code',
    colorsToCode(colors) === '0xC0123'
  );

  console.groupEnd();

  console.group('codeToColors');

  it('should return colors for valid code',
    codeToColors('0xC0123').join() === [0,1,2,3].join()
  );

  it('should return colors for code without 0x',
    codeToColors('C0123').join() === [0,1,2,3].join()
  );

  let err = null;

  try {
    codeToColors('12345678');
  } catch (e) {
    err = e;
  }

  it('should throw when code length is invalid',
    err
  );

  try {
    codeToColors('bączek');
  } catch (e) {
    err = e;
  }

  it('should throw when code length is invalid',
    err
  );

  it('should return colors for code for code type 0',
    codeToColors('00123').join() === [0,1,2,3].join()
  );

  it('should return colors for code for code type 4',
    codeToColors('40123').join() === [0,1,2,3].join()
  );

  it('should return colors for code for code type 8',
    codeToColors('80123').join() === [0,1,2,3].join()
  );

  try {
    codeToColors('12345');
  } catch (e) {
    err = e;
  }

  it('should throw when code type is not color code',
    err
  );

  it('should return colors for code for colors % 4',
    codeToColors('C05AF').join() === [0,1,2,3].join()
  );

  try {
    codeToColors('C4242');
  } catch (e) {
    err = e;
  }

  it('should throw when code type has duplicated colors',
    err
  );

  console.groupEnd();
}
