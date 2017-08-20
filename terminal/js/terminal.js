function Terminal() {
  this.inputManager   = new InputManager();
  this.domManipulator = new DomManipulator();

  this.inputManager.on("submit", this.submitInput.bind(this));
  this.inputManager.on("focusedout", this.domManipulator.setFocusToInput.bind(this.domManipulator));
};

Terminal.prototype.submitInput = function () {
  let currentValue = this.domManipulator.getInputValue();

  if (currentValue === "help") {
    this.domManipulator.showOptionsList()
  } else if (currentValue === "map" || currentValue.substring(0, 4) === "map ") {
    let codes = currentValue.substring(4).split(" ")
    this.domManipulator.showMap(codes)
  } else {
    this.domManipulator.showCommandNotFound()
  }
};

new Terminal();
