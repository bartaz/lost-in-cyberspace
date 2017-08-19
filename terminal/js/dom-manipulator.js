function DomManipulator() {
  this.terminal      = document.getElementById("terminal");
  this.terminalInput = document.getElementById("terminal--input");
};

DomManipulator.prototype.getInputValue = function () {
  return this.terminalInput.value;
};

DomManipulator.prototype.setFocusToInput = function () {
  this.terminalInput.focus();
};

DomManipulator.prototype.showOptionsList = function () {
  this.showSubmittedValue();
  this.createParagraph("<span class=\"uppercase\">List of options </span><ul><li> <b>[map]</b> to display actual status of nodes</li> <li> <b>[help]</b> for list of options</li></ul>");
};

DomManipulator.prototype.showCommandNotFound = function () {
  this.showSubmittedValue();
  this.createParagraph("<span class=\"uppercase\">Command not found: </span>" + this.getInputValue())
};

DomManipulator.prototype.showSubmittedValue = function () {
  this.createParagraph("> " + this.getInputValue());
};

DomManipulator.prototype.createParagraph = function (innerHtml) {
  let p = document.createElement("p");
  p.innerHTML = innerHtml
  this.terminal.appendChild(p);
};
