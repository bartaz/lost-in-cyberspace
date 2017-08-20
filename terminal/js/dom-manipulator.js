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
  let network = networkFromCodes(codes);
  // map 0xD1234 0xC16F8 0xEF4D0 0xB129A correct
  // map 0xF298E 0xEF4D0 0x1298E 0x44206 invalid
  this.createParagraph("<span class=\"uppercase\">Map: </span>");
  this.createParagraph(getNetworkMap(network) + this.prepareLegend(network), "terminal--map");
  this.showErrors(codes, network.errors);
  this.setInputValue("");
};

DomManipulator.prototype.showErrors = function (codes, errors) {
  if (codes.length === 1 && codes[0] === "") {
    this.createParagraph("Invalid empty code.");
    return;
  }
  if (!errors || !errors.length) return;

  let that = this;

  errors.forEach(function(error) {
    that.createParagraph(error);
  })
}

DomManipulator.prototype.prepareLegend = function (code) {
  let result = "<ul class=\"terminal--map-legend\">";
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
      result = result + "<li>Connections: &#10003;</li>";
    } else {
      result = result + "<li>Connections: &#10007;</li>";
    }

  return result + "</ul>";
};

DomManipulator.prototype.showSubmittedValue = function () {
  this.createParagraph("> " + this.getInputValue());
};

DomManipulator.prototype.createParagraph = function (innerHtml, classNames = "", parentNode = this.terminal) {
  let p = document.createElement("p");
  p.setAttribute("class", classNames);
  p.innerHTML = innerHtml;
  parentNode.appendChild(p);
};
