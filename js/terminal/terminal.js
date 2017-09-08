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

  let args = this.currentValue.split(" ").filter(x => x);
  let cmd = args.splice(0,1)[0];

  // if --help is passed as argument redirect to help command
  if (args.indexOf('-h') !== -1 || args.indexOf('--help') !== -1) {
    args = [cmd];
    cmd = 'help';
  }

  if (cmd === 'help' || cmd === 'man') {
    if (args[0]) {
      if (args[0] === 'nmap') {
        this.domManipulator.showMapDetails();
      } else if (args[0] === 'help') {
        this.domManipulator.showHelpDetails();
      } else {
        this.domManipulator.showHelpCommandNotFound(args);
      }
    } else {
      this.domManipulator.showOptionsList();
    }
  } else if (cmd === 'nmap') {
    this.domManipulator.showMap(args);
  } else if (cmd === 'top') {
    this.domManipulator.showTopScore(args);
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
