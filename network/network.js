
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
  return {
    xSpread: randomInt(6) + 1,
    xOffset: randomInt(7),
    ySpread: randomInt(6) + 1,
    yOffset: randomInt(7)
  }
}

function getWalls(params) {
  return {
    xSpread: params.xSpread,
    xOffset: params.xOffset,
    ySpread: params.ySpread,
    yOffset: params.yOffset,
    xWalls: computeWalls(params.xSpread, params.xOffset),
    yWalls: computeWalls(params.ySpread, params.yOffset)
  }
}

function randomNetwork() {
  return {
    walls: getWalls(randomWalls())
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
