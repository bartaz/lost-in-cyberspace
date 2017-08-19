function InputManager() {
  this.events = {};

  this.listen();
};

InputManager.prototype.on = function (event, callback) {
  if (!this.events[event]) {
    this.events[event] = [];
  }
  this.events[event].push(callback);
};

InputManager.prototype.emit = function (event, data = {}) {
  var callbacks = this.events[event];
  if (callbacks) {
    callbacks.forEach(function (callback) {
      callback(data);
    });
  }
};

InputManager.prototype.listen = function () {
  var self = this;

  document.addEventListener("keydown", function (event) {
    var modifiers = event.altKey || event.ctrlKey || event.metaKey ||
                    event.shiftKey;

    // Enter key submits the command
    if (!modifiers && event.which === 13) {
      self.emit("submit");
    }
  });

  document.addEventListener("click", function (event) {
      self.emit("focusedout");
  });
}
