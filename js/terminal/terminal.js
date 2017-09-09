let currentValue   = "";

function submitInput() {
  currentValue = terminalInput.value;

  let args = currentValue.split(" ").filter(x => x);
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

document.addEventListener("keydown", (event) => {
  let modifiers = event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;

  if (!modifiers) {
    terminalInput.focus();
    if (event.which === 13) { // Enter key submits the command
      submitInput();
    } else if (event.which === 38) { //Arrow up shows 1 previous command
      setInputValue(currentValue);
      terminalInput.focus();
    } else if (event.which === 40) { //Arrow down clears input
      setInputValue("");
    }
  }
});

document.addEventListener("click", (event) => {
  // if clicking outside of terminal, focus on the input
  if (event.target === document.documentElement ||
      event.target === document.body ||
      event.target === document.querySelector('.container')) {
    terminalInput.focus()
  }
});
