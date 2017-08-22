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

  console.group('combineWallsWalls');

  let rowWalls = [0,1,2,3,4,5,6,7];
  let colWalls = [0,3,6,1,4,7,2,5];

  let expected = {
    rowWalls: [[0, 7-0],[1, 7-3],[2, 7-6],[3, 7-1],[4, 7-4],[5, 7-7],[6, 7-2],[7, 7-5]],
    colWalls: [[0, 7-0],[3, 7-1],[6, 7-2],[1, 7-3],[4, 7-4],[7, 7-5],[2, 7-6],[5, 7-7]]
  }
  it('should return combined walls',
    JSON.stringify(combineWalls(rowWalls,colWalls)) === JSON.stringify(expected)
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

  let err;

  err = null;

  try {
    codeToColors('12345678');
  } catch (e) {
    err = e;
  }

  it('should throw when code length is invalid',
    err
  );

  err = null;

  try {
    codeToColors('bączek');
  } catch (e) {
    err = e;
  }

  it('should throw when code is invalid',
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

  err = null;

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

  err = null;

  try {
    codeToColors('C4242');
  } catch (e) {
    err = e;
  }

  it('should throw when code type has duplicated colors',
    err
  );

  let random = randomColors();
  it('should decode the same object that was coded',
    JSON.stringify(codeToColors(colorsToCode(random))) === JSON.stringify(random)
  );

  console.groupEnd();

  console.group('wallsToCode');

  let walls = {
    rowSpread: 1,
    rowOffset: 2,
    colSpread: 3,
    colOffset: 4
  }

  it('should return valid code',
    wallsToCode(walls) === '0xD1234'
  );

  console.groupEnd();

  console.group('codeToWalls');

  walls = codeToWalls('0xD1234');
  it('should return walls for valid code',
    walls.rowSpread === 1 && walls.rowOffset === 2 &&
    walls.colSpread === 3 && walls.colOffset === 4
  );

  walls = codeToWalls('D1234');
  it('should return colors for code without 0x',
    walls.rowSpread === 1 && walls.rowOffset === 2 &&
    walls.colSpread === 3 && walls.colOffset === 4
  );

  err = null;

  try {
    codeToWalls('12345678');
  } catch (e) {
    err = e;
  }

  it('should throw when code length is invalid',
    err
  );

  err = null;

  try {
    codeToWalls('bączek');
  } catch (e) {
    err = e;
  }

  it('should throw when code is invalid',
    err
  );

  walls = codeToWalls('11234');
  it('should return walls for code for code type 1',
    walls.rowSpread === 1 && walls.rowOffset === 2 &&
    walls.colSpread === 3 && walls.colOffset === 4
  );

  walls = codeToWalls('51234');
  it('should return colors for code for code type 5',
    walls.rowSpread === 1 && walls.rowOffset === 2 &&
    walls.colSpread === 3 && walls.colOffset === 4
  );

  walls = codeToWalls('91234');
  it('should return colors for code for code type 9',
    walls.rowSpread === 1 && walls.rowOffset === 2 &&
    walls.colSpread === 3 && walls.colOffset === 4
  );

  err = null;

  try {
    codeToWalls('01234');
  } catch (e) {
    err = e;
  }

  it('should throw when code type is not wall code',
    err
  );

  walls = codeToWalls('D1A3C');
  it('should return walls for code for walls % 8',
    walls.rowSpread === 1 && walls.rowOffset === 2 &&
    walls.colSpread === 3 && walls.colOffset === 4
  );

  err = null;

  try {
    codeToWalls('D0123');
  } catch (e) {
    err = e;
  }

  it('should throw when code has invalid walls definition',
    err
  );

  random = randomWalls();
  it('should decode the same object that was coded',
    JSON.stringify(codeToWalls(wallsToCode(random))) === JSON.stringify(random)
  );

  console.groupEnd();

  console.group('trapsToCode');

  let traps = {
    trapsSeed: [9,10,11,12]
  }

  it('should return valid code',
    trapsToCode(traps) === '0xE9ABC'
  );

  console.groupEnd();

  console.group('codeToTraps');

  it('should return traps for valid code',
    codeToTraps('0xE1234').trapsSeed.join() === [1,2,3,4].join()
  );

  it('should return colors for code without 0x',
    codeToTraps('0xE1234').trapsSeed.join() === [1,2,3,4].join()
  );

  err = null;

  try {
    codeToColors('12345678');
  } catch (e) {
    err = e;
  }

  it('should throw when code length is invalid',
    err
  );

  err = null;

  try {
    codeToColors('bączek');
  } catch (e) {
    err = e;
  }

  it('should throw when code is invalid',
    err
  );

  it('should return traps for code for code type 2',
    codeToTraps('0x21234').trapsSeed.join() === [1,2,3,4].join()
  );

  it('should return colors for code for code type 6',
    codeToTraps('0x61234').trapsSeed.join() === [1,2,3,4].join()
  );

  it('should return colors for code for code type A',
    codeToTraps('0xA1234').trapsSeed.join() === [1,2,3,4].join()
  );

  err = null;

  try {
    codeToTraps('32105');
  } catch (e) {
    err = e;
  }

  it('should throw when code type is not traps code',
    err
  );

  random = randomTraps();
  it('should decode the same object that was coded',
    JSON.stringify(codeToTraps(trapsToCode(random))) === JSON.stringify(random)
  );

  console.groupEnd();

  console.group('targetToCode');

  let target = [4,2];

  it('should return valid code',
    targetToCode(target) === '0xF42CA'
  );

  console.groupEnd();

  console.group('codeToTarget');

  it('should return target for valid code',
    codeToTarget('0xF129A').join() === [1,2].join()
  );

  it('should return colors for code without 0x',
    codeToTarget('0xF129A').join() === [1,2].join()
  );

  err = null;

  try {
    codeToTarget('12345678');
  } catch (e) {
    err = e;
  }

  it('should throw when code length is invalid',
    err
  );

  err = null;

  try {
    codeToTarget('bączek');
  } catch (e) {
    err = e;
  }

  it('should throw when code is invalid',
    err
  );

  it('should return traps for code for code type 3',
    codeToTarget('0xF129A').join() === [1,2].join()
  );

  it('should return colors for code for code type 7',
    codeToTarget('0x7129A').join() === [1,2].join()
  );

  it('should return colors for code for code type B',
    codeToTarget('0xB129A').join() === [1,2].join()
  );

  err = null;

  try {
    codeToTarget('02105');
  } catch (e) {
    err = e;
  }

  it('should throw when code type is not target code',
    err
  );

  err = null;

  try {
    codeToTarget('F1234');
  } catch (e) {
    err = e;
  }

  it('should throw when code does not contain duplicated target',
    err
  );


  random = randomTarget();
  it('should decode the same object that was coded',
    JSON.stringify(codeToTarget(targetToCode(random))) === JSON.stringify(random)
  );

  console.groupEnd();
}
