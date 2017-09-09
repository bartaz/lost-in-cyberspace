let terminal      = document.getElementById("terminal");
let terminalInput = document.getElementById("ti");

function setInputValue(value) {
  // hack to make sure cursor appears at the end of the input
  setTimeout(() => {
    terminalInput.value = value;
    terminalInput.focus();
  }, 1);
}

function showCat() {
  showSubmittedValue();

  createParagraph(
    "<span class='color-red'>,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`</span><br>"
    + "<span style='color: "+ COLOR_VALUES[2] +"'>.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,</span><br>"
    + "<span style='color: "+ COLOR_VALUES[0] +"'>*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;,---/V\\<br>"
    + "<span style='color: "+ COLOR_VALUES[1] +"'>`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.</span>&nbsp;&nbsp;&nbsp;&nbsp;~|__(o.o)<br>"
    + "<span style='color: "+ COLOR_VALUES[3] +"'>^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'</span>&nbsp;&nbsp;UU&nbsp;&nbsp;UU"
  );

  setInputValue("");
}

/* global networkFromCodes getNetworkMap */
function showCommandHelp(cmd) {
  showSubmittedValue();

  if (cmd === 'help') {
    createParagraph("<div>NAME</div>"
    + "<div class='pad'><b>help</b> -- display help for given command or list of available commands.</div>"
    + "<div>SYNOPSIS</div>"
    + "<div class='pad'><b>help</b> [COMMAND]</div>"
    + "<div>DESCRIPTION</div>"
    + "<div class='pad'>The <b>help</b> command will display list of available commands."
    + "<br/><br/>If COMMAND is given as argument <b>help</b> will show details given COMMAND.</div>"
    + "<div>EXAMPLES</div>"
    + "<div class='pad'>The following is how to display help for <b>nmap</b> command:</div>"
    + "<div class='pad'>`help nmap`</div>"
    + "<div>ALIASES</div>"
    + "<div class='pad'><b>man</b></div>"
  );
  } else if (cmd === 'nmap') {
    createParagraph("<div>NAME</div>"
    + "<div class='pad'><b>nmap</b> -- display the map of network nodes</div>"
    + "<div>SYNOPSIS</div>"
    + "<div class='pad'><b>nmap</b> [ACCESS_CODE ...]</div>"
    + "<div>DESCRIPTION</div>"
    + "<div class='pad'>The <b>nmap</b> command displays the map of network nodes based on the ACCESS_CODEs provided as arguments."
    + "<br><br>There are 4 ACCESS_CODEs that can be found by HACKER in 4 sectors of the network. Each ACCESS_CODE provides different data to the map: Sectors, Connections, Traps and Target."
    + "<br><br>The <b>nmap</b> command accepts between 0-4 ACCESS_CODEs, case insensitive with optional 0x prefix.</div>"
    + "<div>EXAMPLES</div>"
    + "<div class='pad'>The following is how to display map of nodes with [Sectors], [Traps] and [Connections]:</div>"
    + "<div class='pad'>`nmap 0xC16F8 D1234 EF4D0`</div>");
    let network = networkFromCodes("0xC16F8 D1234 EF4D0".split(" "));
    createParagraph(getNetworkMap(network) + prepareTopLegend() + prepareBtmLegend(network), "tm pad");
  } else if (cmd === 'top') {
    createParagraph("<div>NAME</div>"
    + "<div class='pad'><b>top</b> -- display the list of top hacker teams' scores.</div>"
    + "<div>SYNOPSIS</div>"
    + "<div class='pad'><b>top</b> [NETWORK_TOP_HACKER_CODE] [TEAM_NAME]</div>"
    + "<div>DESCRIPTION</div>"
    + "<div class='pad'>The <b>top</b> command displays the list of the scores of top hackers teams."
    + "<br/><br/>If the NETWORK_TOP_HACKER_CODE and optionally the TEAM_NAME is provided new top score record will be added to the list, so you can compare your performance with the best of the best.</div>"
    + "<div>EXAMPLES</div>"
    + "<div class='pad'>The following is how to add your noob score to top hackers list:</div>"
    + "<div class='pad'>`top 0xF0020F N00BS`</div>");
  } else if (cmd === 'make-me-a-sandwich') {
    createParagraph("<div>NAME</div>"
    + "<div class='pad'><b>make-me-a-sandwich</b> -- makes you a sandwich.</div>"
    + "<div>SYNOPSIS</div>"
    + "<div class='pad'><b>make-me-a-sandwich</b></div>"
    + "<div>DESCRIPTION</div>"
    + "<div class='pad'>The <b>make-me-a-sandwich</b> command will make you a sandwich.<br>If you know how to ask for it.</div>"
    + "<div>EXAMPLES</div>"
    + "<div class='pad'>The following is not how to get a sandwich:</div>"
    + "<div class='pad'>`make-me-a-sandwich`</div>");
  } else if (cmd === 'cat') {
    createParagraph("<div>NAME</div>"
    + "<div class='pad'><b>cat</b></div>"
    + "<div>SYNOPSIS</div>"
    + "<div class='pad'><b>cat</b></div>"
    + "<div>DESCRIPTION</div>"
    + "<div class='pad'>The <b>cat</b> command.</div>"
    + "<div>EXAMPLES</div>"
    + "<div class='pad'>`cat`</div>");
  } else {
    createParagraph("No help entry for " + cmd);
  }

  setInputValue("");
}

function showOptionsList() {
  showSubmittedValue();
  createParagraph("<div>Available commands:</div>"
  + "<div class='pad'>- <b>nmap [ACCESS_CODE...]</b> -- display the map of network nodes</div>"
  + "<div class='pad'>- <b>help [COMMAND]</b> -- display detailed help for given command</div>"
  + "<div class='pad'>- <b>top</b> -- display the list of top hacker teams' scores</div>"
  + "<div class='pad'>- <b>make-me-a-sandwich</b></div>"
  + "<div class='pad'>- <b>cat</b></div>"
  );
  setInputValue("");
}

function showCommandNotFound() {
  showSubmittedValue();
  createParagraph("COMMAND NOT FOUND: " + terminalInput.value);
  setInputValue("");
}

function showMap(codes) {
  showSubmittedValue();
  let network = networkFromCodes(codes);
  // map 0xD1234 0xC16F8 0xEF4D0 0xB129A correct
  // map 0xF298E 0xEF4D0 0x1298E 0x44206 invalid
  createParagraph("MAP OF THE NETWORK:");
  createParagraph(getNetworkMap(network) + prepareTopLegend() + prepareBtmLegend(network), "tm");
  showErrors(codes, network.errors);
  setInputValue("");
}

/* global getTopScores codeToScore */
function showTopScore(args) {
  showSubmittedValue();

  let code = args[0];
  let name = args.slice(1).join(" ");

  let error;

  if (code) {
    try {
      // TODO: validate in getTopScores?
      codeToScore(code); // just validate the code
      code = formatCode(code);
    } catch(e) {
      error = "<b>" + code + "</b> is not a valid NETWORK_TOP_HACKER_CODE. You can get one after successfully hacking the network.";
      code = null;
    }
  }

  let scores = getTopScores(code, name);

  createParagraph("<div>&nbsp;&nbsp;&nbsp;TOP HACKERS<br>&nbsp;&nbsp;-------------</div>"
  + "<div>&nbsp;&nbsp;&nbsp;<span class='col'>TIME LEFT:</span> <span class='col'>SWITCHES:</span> <span>TEAM:</span><br>"
  + scores.map(s => {
    return (s.code === formatCode(args[0]) ? "<div class='color-green'>~&nbsp;" : "<div>&nbsp;&nbsp;") +
       " <span class='col'>" + `0${~~(s.time / 60)}:${(s.time % 60)<10?'0':''}${s.time % 60}` +
       "</span> <span class='col'>" + s.moves +
       "</span> <span>" + (s.name || 'Anonymous') + "</span></div>";
  }).join('') + "</div>");

  if (error) {
    createParagraph(error);
  }

  setInputValue("");
}

function showSandwich(sudo, args) {
  showSubmittedValue();
  createParagraph((sudo || (args.indexOf('--please') > -1) || (args.indexOf('please') > -1)) ? "Okay. <a href='https://www.xkcd.com/149/'>https://www.xkcd.com/149/</a>" : "What? Make it yourself.");
  setInputValue("")
}

function showErrors(codes, errors) {
  if (!codes.length) {
    createParagraph("Network codes not provided.");
    return;
  }
  if (!errors || !errors.length) return;

  errors.forEach((error) => createParagraph('<b>'+ error + '</b> is not a valid ACCESS_CODE.'));
}

function formatCode(code) {
  return code ? '0x' + code.replace('0x','').toUpperCase() : 'unknown';
}

function formatLine(colorClass, name, code) {
  return "<li class='" + colorClass + "'>["+ formatCode(code) +"] " + name + "</li>";
}

function prepareBtmLegend(network) {
  let result = "<ul class='tm-l'>";
  if (network.colors && network.colors.length) {
    result = result + formatLine('color-springgreen', 'Sectors', network.colors.code);
  } else {
    result = result + formatLine('color-red', 'Sectors');
  }

  if (network.walls) {
    result = result + formatLine('color-springgreen', 'Connections', network.walls.code);
  } else {
    result = result + formatLine('color-red', 'Connections');
  }

  if (network.traps) {
    result = result + formatLine('color-springgreen', 'Traps', network.traps.code);
  } else {
    result = result + formatLine('color-red', 'Traps');
  }

  if (network.target && network.target.length) {
    result = result + formatLine('color-springgreen', 'Target coordinates', network.target.code);
  } else {
    result = result + formatLine('color-red', 'Target coordinates');
  }

  return result + "</ul>";
}

function prepareTopLegend() {
  let result = "<div class='tm-lt'>Legend:<ul>";
  result = result + "<li>&#9670; - node</li>";
  result = result + "<li>| - connection</li>";
  result = result + "<li>&#8709; - trap</li>";
  result = result + "<li>X - target</li>";

  return result + "</ul></div>";
}

function showSubmittedValue () {
  createParagraph("<span class='color-green'>> " + terminalInput.value + "</span>");
}

function createParagraph(innerHtml, classNames = "", parentNode = terminal) {
  let p = document.createElement("p");
  p.setAttribute("class", "out " + classNames);
  p.innerHTML = innerHtml;
  parentNode.appendChild(p);
}
