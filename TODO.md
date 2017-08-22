### Terminal:
- [ ] choose some font and test in in Firefox and Chrome (IE?) in different systems (Mac, Windows, Linux)
- [ ] cannot copy example code
- [ ] what characters to use for nodes/traps/target ?
- [ ] add a legend to map explaining what symbols mean (nodes, traps, etc)
- [ ] update map command layout to be more 'command line'
- [ ] maybe help displays list of commands and `help map` or `help help` displays details
- [ ] easter eggs (some additional commands?)

- [x] there is no cursor at the end of input after copying value
- [x] font in map doesn't work in Firefox (lines don't align)

## VR

- show something on win/loose
- canvas textures - refactor it a bit?
- canvas textures for walls and boxes?
- display timer (better)
- traps should reduce time
  - trap = -1m (30sec?)
  - hack = -10sec (so it's not worth hacking blindly)
- better sounds
  - sound when entering the trap
  - sound when time is ticking
  - sound on win?
- trigger actions on nodes (hack)
  - show something on hack
  - more actions? access + hack?
  - how not to trigger hack by mistake when looking?
    - confirm? - another interaction to implement
    - hack on wrong node is not harmful? (less harmful then trap?)
- hints (text overlays with some tips?)
- put player in sector with colors or connection codes
- don't put player on traps

## sounds
- wrong terminal/trap: [1,0.06,0.3,0.2,0.08,0.18,,,,,,,,,,,,,1,,,0.09,,0.5]
- timer ticking: 1,,0.163,,0.0169,0.4782,,,,,,,,,,,,,1,,,0.1,,0.5
- jump: 2,0.3,0.11,,0.56,0.4091,,0.1027,,,,-0.02,,0.3075,,,,,0.83,,,0.3,,0.5

## Network

- more traps
- list errors of invalid or conflicting codes
- refactor it not to keep everything in global scope
- detect dead ends and put target there?
- possible bug with target on trap?

## Build

- [x] there is some issue with injecting aframe script on the end of body
- [x] textures need to be canvas, not images
- [x] injecting scripts into HTML doesn't support external files (like aframe from CDN)
- [x] build process doesn't copy other files (images, etc)
- [x] use ES6? we need different uglify package

## Help and tips

- we need to better explain how to play the game both in VR and terminal
- VR needs some tips on reading codes, hacking and navigating
- terminal needs some help on using codes and reading the map
- Description in README and credits for codepen demo https://codepen.io/somethingformed/pen/raWJXV

### General:
- what ES6 features can we use natively (to make code nicer and shorter)?
- [x] main menu
  - one single index.html to launch both VR and Terminal
    - maybe we could use terminal as starting point and have a command to launch VR from there? - [it will not work well on mobile]
- test main menu on mobile + FF
- add favicon?
