
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
  let xSpread = randomInt(6) + 1;
  let xOffset = randomInt(7);
  let xWalls = computeWalls(xSpread, xOffset);

  let ySpread = randomInt(6) + 1;
  let yOffset = randomInt(7);
  let yWalls = computeWalls(ySpread, yOffset);

  // prefent non connected nodes from appearing in the corners
  if (
    (xWalls[0] === 1 && yWalls[0] === 1) ||
    (xWalls[7] === 7 && yWalls[7] === 7) ||
    (xWalls[0] === 7 && yWalls[7] === 1) ||
    (xWalls[7] === 1 && yWalls[0] === 7)
  ) {
    ySpread = randomInt(6) + 1;
    yOffset = randomInt(7);
    yWalls = computeWalls(ySpread, yOffset);
  }

  return {
    xSpread: xSpread,
    xOffset: xOffset,
    ySpread: ySpread,
    yOffset: yOffset,
    xWalls: xWalls,
    yWalls: yWalls
  }
}

function randomNetwork() {
  return {
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
    if (network.walls.xWalls) {
      walls = network.walls.xWalls;
      for (i = 0; i < 8; i++) {
        if (walls[i]) {
          networkGrid[i * 2][walls[i] * 2 - 1] = 0;
        }
      }
    }

    if (network.walls.yWalls) {
      walls = network.walls.yWalls;
      for (i = 0; i < 8; i++) {
        if (walls[i]) {
          networkGrid[walls[i] * 2 - 1][i * 2] = 0;
        }
      }
    }
  }
  // turn magic numbers into HTML friendly string representation
  let networkString = networkGrid.map(function(line){
    return line.join('').replace(/0/g, ' ').replace(/1/g, '&boxh;').replace(/2/g, '&boxv;').replace(/3/g, '@');
  }).join('\n');

  return networkString;
}

var n = randomNetwork();
console.log(n);
document.body.innerHTML = getNetworkMap(n);
