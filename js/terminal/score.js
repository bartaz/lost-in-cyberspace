let defaultTop = {
  "0xD4C0D2": "bartaz + calanthe",
  "0x2FE011": "Project 2501",
  "0x1D2065": "Oracle/Braniac",
  "0x6A60AA": "The Lone Gunmen",
  "0xE6F0E1": "Acid Burn 'n' Crash Override",
  "0x8A014C": "Wasp & Bob the Dog",
  "0xC6010C": "Johnny Mnemonic and Jones",
  "0xA40139": "Martin Brice with Cosmo",
  "0x92A18F": "fsociety",
  "0x310203": "Neo & Trinity"
};

function readTopScores() {
  let scores;
  if (localStorage) {
    try {
      scores = localStorage.getItem('LOST_IN_CYBERSPACE_TOP_HACKERS');
      scores = JSON.parse(scores);
    } catch (e) {
      // just ignore and return default
    }
  }
  return scores || JSON.parse(JSON.stringify(defaultTop));
}

function saveTopScores(scores) {
  if (localStorage) {
    localStorage.setItem('LOST_IN_CYBERSPACE_TOP_HACKERS', JSON.stringify(scores));
  }
}

function getTopScores(code, name) {
  let scores = readTopScores();

  if (code) {
    scores[code] = name;
  }

  saveTopScores(scores);

  let scoresList = [];
  Object.keys(scores).forEach(key => scoresList.push([ key, scores[key] ]));

  scoresList = scoresList.map(entry => {
    let score = codeToScore(entry[0]);
    return { code: entry[0], name: entry[1], time: score.time, moves: score.moves }
  });

  scoresList.sort((a, b) => a.time !== b.time ? b.time - a.time : a.moves - b.moves);

  return scoresList;
}
