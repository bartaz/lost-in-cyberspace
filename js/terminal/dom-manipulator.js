function DomManipulator() {
  this.terminal      = document.getElementById("terminal");
  this.terminalInput = document.getElementById("terminal--input");
}

DomManipulator.prototype.getInputValue = function () {
  return this.terminalInput.value;
};

DomManipulator.prototype.setInputValue = function (value) {
  setTimeout(() => {
    this.terminalInput.value = value;
    this.terminalInput.focus();
  }, 1);
};

DomManipulator.prototype.setFocusToInput = function () {
  this.terminalInput.focus();
};

/* global networkFromCodes getNetworkMap */
DomManipulator.prototype.showMapDetails = function () {
  this.showSubmittedValue();
  this.createParagraph("<div class='mar-ver--sm'>NAME</div>"
  + "<div class='pad-lft--md mar-ver--sm'><b>nmap</b> -- Display the map of network nodes</div>"
  + "<div class='mar-ver--sm'>SYNOPSIS</div>"
  + "<div class='pad-lft--md mar-ver--sm'><b>nmap</b> [NODE_CODE ...]</div>"
  + "<div class='mar-ver--sm'>DESCRIPTION</div>"
  + "<div class='pad-lft--md wide mar-ver--sm'><b>nmap</b> is a command to display the map of network nodes. The user must provide node codes [NODE_CODE] to include node details and hints on the map. "
  + "<br/><br/>The code structure is built of 5 hex values preceded with `0x`. "
  + "<br/><br/>There are 4 types of hints that can be shown on the map: [Sectors], [Target], [Traps] and [Connections]. "
  + "<br/><br/>The <b>nmap</b> command accepts multiple codes with or without preceded `0x`.</div>"
  + "<div class='mar-ver--sm'>EXAMPLES</div>"
  + "<div class='pad-lft--md mar-ver--sm'>The following is how to display map of nodes with [Sectors], [Traps] and [Connections]:</div>"
  + "<div class='pad-lft--lg mar-ver--sm'>`nmap 0xC16F8 D1234 EF4D0`</div>");
  let network = networkFromCodes("0xC16F8 D1234 EF4D0".split(" "));
  this.createParagraph(getNetworkMap(network) + this.prepareTopLegend() + this.prepareBtmLegend(network), "terminal--map");
  this.setInputValue("");
};

DomManipulator.prototype.showHelpDetails = function () {
  this.showSubmittedValue();
  this.createParagraph("<div class='mar-ver--sm'>NAME</div>"
  + "<div class='pad-lft--md mar-ver--sm'><b>help</b> -- Display list of options</div>"
  + "<div class='mar-ver--sm'>SYNOPSIS</div>"
  + "<div class='pad-lft--md mar-ver--sm'><b>help</b> [COMMAND]</div>"
  + "<div class='mar-ver--sm'>DESCRIPTION</div>"
  + "<div class='pad-lft--md mar-ver--sm'><b>help</b> is a command to display list of available options."
  + "<br/><br/>The user can provide [COMMAND] to get details about particular [COMMAND].</div>");
  this.setInputValue("");
};

DomManipulator.prototype.showOptionsList = function () {
  this.showSubmittedValue();
  this.createParagraph("<div class='mar-ver--sm'>List of available commands:</div>"
  + "<div class='pad-lft--md mar-ver--sm'>- <b>nmap [NODE_CODE...]</b> -- Display the map of network nodes</div>"
  + "<div class='pad-lft--md mar-ver--sm'>- <b>help [COMMAND]</b> -- Display detailed help for given command or list of available commands.</div>"
  + "<br/>"
  + "<div class='mar-ver--sm'>EXAMPLES</div>"
  + "<div class='pad-lft--md mar-ver--sm'>The following is how to display detailed information about <b>nmap</b> command:</div>"
  + "<div class='pad-lft--lg mar-ver--sm'>`help nmap`</div>");
  this.setInputValue("");
};

DomManipulator.prototype.showCommandNotFound = function () {
  this.showSubmittedValue();
  this.createParagraph("COMMAND NOT FOUND: " + this.getInputValue());
  this.setInputValue("");
};

DomManipulator.prototype.showHelpCommandNotFound = function () {
  this.showSubmittedValue();
  this.createParagraph("COMMAND NOT FOUND: " + this.getInputValue() + ". Try with different argument");
  this.setInputValue("");
};

DomManipulator.prototype.showMap = function (codes) {
  this.showSubmittedValue();
  let network = networkFromCodes(codes);
  // map 0xD1234 0xC16F8 0xEF4D0 0xB129A correct
  // map 0xF298E 0xEF4D0 0x1298E 0x44206 invalid
  this.createParagraph("MAP OF THE NETWORK:");
  this.createParagraph(getNetworkMap(network) + this.prepareTopLegend() + this.prepareBtmLegend(network), "terminal--map");
  this.showErrors(codes, network.errors);
  this.setInputValue("");
};


// 1. read code from args (may be empty)
// 2. read name from args (may be empty)
// 3. if code is present try to read score from it
// 3a. if invalid, keep the error
// 3b. if valid, keep the score
// 4. get top scores (with current score included to be saved)
// 5. print top scores (including current one, marked)
// 6. print errors if any

/* global getTopScores codeToScore */
DomManipulator.prototype.showTopScore = function (args) {
  this.showSubmittedValue();

  let code = args[0];
  let name = args.slice(1).join(" ");

  let error;

  if (code) {
    try {
      // TODO: validate in getTopScores?
      codeToScore(code); // just validate the code
      code = formatCode(code);
    } catch(e) {
      code = null;
      error = e.message;
    }
  }

  let scores = getTopScores(code, name);

  this.createParagraph("TOP HACKERS");
  this.createParagraph("=============");

  this.createParagraph("&nbsp;&nbsp;&nbsp;<span class='col'>TIME LEFT:</span> <span class='col'>SWITCHES:</span> <span>TEAM:</span>");
  scores.forEach((s) => {

    this.createParagraph(
      (s.code === formatCode(args[0]) ? "~&nbsp;" : "&nbsp;&nbsp;") +
       " <span class='col'>" + `0${~~(s.time / 60)}:${(s.time % 60)<10?'0':''}${s.time % 60}` +
       "</span> <span class='col'>" + s.moves +
       "</span> <span>" + (s.name || 'Anonymous') + "</span>");
  });
  this.setInputValue("");
};

DomManipulator.prototype.showErrors = function (codes, errors) {
  if (codes.length === 1 && codes[0] === "") {
    this.createParagraph("Network codes not provided.");
    return;
  }
  if (!errors || !errors.length) return;

  let that = this;

  errors.forEach(function(error) {
    that.createParagraph(error);
  });
};

function formatCode(code) {
  return code ? '0x' + code.replace('0x','').toUpperCase() : 'unknown';
}

DomManipulator.prototype.prepareBtmLegend = function (network) {

  function formatLine(colorClass, name, code) {
    return "<li class='" + colorClass + "'>["+ formatCode(code) +"] " + name + "</li>";
  }

  let result = "<ul class='terminal--map-legend'>";
  if (network.colors && network.colors.length) {
    result = result + formatLine('color-springgreen', 'Sectors', network.colors.code);
  } else {
    result = result + formatLine('color-red', 'Sectors');
  }

  if (network.target && network.target.length) {
    result = result + formatLine('color-springgreen', 'Target coordinates', network.target.code);
  } else {
    result = result + formatLine('color-red', 'Target coordinates');
  }

  if (network.traps) {
    result = result + formatLine('color-springgreen', 'Traps', network.traps.code);
  } else {
    result = result + formatLine('color-red', 'Traps');
  }

  if (network.walls) {
    result = result + formatLine('color-springgreen', 'Connections', network.walls.code);
  } else {
    result = result + formatLine('color-red', 'Connections');
  }

  return result + "</ul>";
};

DomManipulator.prototype.prepareTopLegend = function () {
  let result = "<div class='terminal--map-legend-top'>Legend:<ul>";
  result = result + "<li>&#9670; - node</li>";
  result = result + "<li>| - connection</li>";
  result = result + "<li>&#8709; - trap</li>";
  result = result + "<li>X - target</li>";

  return result + "</ul></div>";
};

DomManipulator.prototype.showSubmittedValue = function () {
  this.createParagraph("<span class='color-green'>> " + this.getInputValue() + "</span>");
};

DomManipulator.prototype.createParagraph = function (innerHtml, classNames = "", parentNode = this.terminal) {
  let p = document.createElement("p");
  p.setAttribute("class", classNames);
  p.innerHTML = innerHtml;
  parentNode.appendChild(p);
};

DomManipulator.prototype.scrollToBottom = function () {
  window.scrollTo(0, document.body.scrollHeight);
};
