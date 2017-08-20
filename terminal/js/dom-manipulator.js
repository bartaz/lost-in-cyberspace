function DomManipulator() {
  this.terminal      = document.getElementById("terminal");
  this.terminalInput = document.getElementById("terminal--input");
};

DomManipulator.prototype.getInputValue = function () {
  return this.terminalInput.value;
};

DomManipulator.prototype.setInputValue = function (value) {
  this.terminalInput.value = value;
};

DomManipulator.prototype.setFocusToInput = function () {
  this.terminalInput.focus();
};

DomManipulator.prototype.showOptionsList = function () {
  this.showSubmittedValue();
  this.createParagraph("<span class=\"uppercase\">List of options </span><ul><li> <b>[map]</b> to display actual status of nodes</li> <li> <b>[help]</b> for list of options</li></ul>");
  this.setInputValue("");
};

DomManipulator.prototype.showCommandNotFound = function () {
  this.showSubmittedValue();
  this.createParagraph("<span class=\"uppercase\">Command not found: </span>" + this.getInputValue())
  this.setInputValue("");
};

DomManipulator.prototype.showMap = function (codes) {
  this.showSubmittedValue();
  console.log(codes)
  let testcode = {
    colors: [1, 0, 2, 3],
    target: [1, 4],
    traps: {
      trapsSeed: [5, 4, 9, 9],
      trapsXY: [
        [1, 1],
        [4, 1],
        [1, 6],
        [5, 6]
      ]
    },
    walls: {
      colOffset: 1,
      colSpread: 2,
      colWalls: [4, 1, 5, 2, 6, 3, 7, 0],
      rowOffset: 5,
      rowSpread: 5,
      rowWalls: [1, 6, 3, 0, 5, 2, 7, 4],
    }
  }
  this.createParagraph("<span class=\"uppercase\">Map: </span>")
  this.createParagraph(getNetworkMap(testcode) + this.prepareLegend(testcode), "terminal--map")
  this.setInputValue("");
};

DomManipulator.prototype.prepareLegend = function (code) {
  let result = "<ul class=\"terminal--map-legend\">";
  //codes.forEach(function(code, index) {
    if (code.colors && code.colors.length) {
      result = result + "<li>Colors: &#10003;</li>";
    } else {
      result = result + "<li>Colors: &#10007;</li>";
    }

    if (code.target && code.target.length) {
      result = result + "<li>Target: &#10003;</li>";
    } else {
      result = result + "<li>Target: &#10007;</li>";
    }

    if (code.traps) {
      result = result + "<li>Traps: &#10003;</li>";
    } else {
      result = result + "<li>Traps: &#10007;</li>";
    }

    if (code.walls) {
      result = result + "<li>Walls: &#10003;</li>";
    } else {
      result = result + "<li>Walls: &#10007;</li>";
    }
  //})

  return result + "</ul>";
};

DomManipulator.prototype.showSubmittedValue = function () {
  this.createParagraph("> " + this.getInputValue());
};

DomManipulator.prototype.createParagraph = function (innerHtml, classNames = "", parentNode = this.terminal) {
  let p = document.createElement("p");
  p.setAttribute("class", classNames)
  p.innerHTML = innerHtml
  parentNode.appendChild(p);
};
