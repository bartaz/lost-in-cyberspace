function Terminal() {
  this.inputManager   = new InputManager();
  this.domManipulator = new DomManipulator();
  this.currentValue   = "";

  this.inputManager.on("submit", this.submitInput.bind(this));
  this.inputManager.on("focusedout", this.setFocus.bind(this));
  this.inputManager.on("restorePrevCommand", this.restorePrevCommand.bind(this));
  this.inputManager.on("clear", this.clearInput.bind(this));
}

Terminal.prototype.submitInput = function () {
  this.currentValue = this.domManipulator.getInputValue();

  if (this.currentValue === "help") {
    this.domManipulator.showOptionsList();
  } else if (this.currentValue.substring(0, 5) === "help ") {
    let command = this.currentValue.substring(5);
    if (command === "nmap") {
      this.domManipulator.showMapDetails();
    } else if (command === "help") {
      this.domManipulator.showHelpDetails();
    } else {
      this.domManipulator.showHelpCommandNotFound();
    }
  } else if (this.currentValue === "nmap" || this.currentValue.substring(0, 5) === "nmap ") {
    let codes = this.currentValue.substring(5).split(" ");
    this.domManipulator.showMap(codes);
  } else {
    this.domManipulator.showCommandNotFound();
  }

  this.domManipulator.scrollToBottom();
};

Terminal.prototype.setFocus = function () {
  this.domManipulator.setFocusToInput();
};

Terminal.prototype.restorePrevCommand = function () {
  this.domManipulator.setInputValue(this.currentValue);
  this.domManipulator.setFocusToInput();
};

Terminal.prototype.clearInput = function () {
  this.domManipulator.setInputValue("");
};

new Terminal();
