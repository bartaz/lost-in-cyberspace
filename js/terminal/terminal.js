/* global InputManager */
function Terminal() {
  this.inputManager   = new InputManager();
  this.currentValue   = "";

  this.inputManager.on("submit", this.submitInput.bind(this));
  this.inputManager.on("focusedout", this.setFocus.bind(this));
  this.inputManager.on("restorePrevCommand", this.restorePrevCommand.bind(this));
  this.inputManager.on("clear", this.clearInput.bind(this));
}

Terminal.prototype.submitInput = function () {
  this.currentValue = terminalInput.value;

  let args = this.currentValue.split(" ").filter(x => x);
  let cmd = args.splice(0,1)[0];

  let sudo = cmd === 'sudo';

  if (sudo) {
    cmd = args.splice(0,1)[0];
  }

  // if --help is passed as argument redirect to help command
  if (args.indexOf('-h') !== -1 || args.indexOf('--help') !== -1) {
    args = [cmd];
    cmd = 'help';
  }

  if (cmd === 'help' || cmd === 'man') {
    if (args[0]) {
      showCommandHelp(args[0]);
    } else {
      showOptionsList();
    }
  } else if (cmd === 'nmap') {
    showMap(args);
  } else if (cmd === 'top') {
    showTopScore(args);
  } else if (cmd === 'make-me-a-sandwich') {
    showSandwich(sudo, args);
  } else if (cmd === 'cat') {
    showCat();
  } else {
    showCommandNotFound();
  }

  window.scrollTo(0, document.body.scrollHeight);
};

Terminal.prototype.setFocus = function () {
  terminalInput.focus();
};

Terminal.prototype.restorePrevCommand = function () {
  setInputValue(this.currentValue);
  terminalInput.focus();
};

Terminal.prototype.clearInput = function () {
  setInputValue("");
};

new Terminal();
