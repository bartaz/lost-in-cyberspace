### Terminal:
- [ ] there is no cursor at the end of input after copying value
- [ ] cannot copy example code
- [ ] what characters to use for nodes/traps/target ?
- [ ] add a legend to map explaining what symbols mean (nodes, traps, etc)
- [ ] update map command layout to be more 'command line'
- [ ] maybe help displays list of commands and `help map` or `help help` displays details
- [ ] easter eggs (some additional commands?)

## VR

- can't load fonts - use local or canvas
- display timer
- show when cursor fuse will trigger click
- sounds
- trigger actions on nodes (hack)
- hints (text overlays with some tips?)
- put player in sector with colors or connection codes

## Network

- better connections: allow only valid maze
  - make code invalid if it creates invalid maze
  - update VR code to display new walls
  - refactor new walls code not to rely on rowWalls and colWalls
- list errors of invalid or conflicting codes
- refactor it not to keep everything in global scope
- more traps
- detect dead ends and put target there?


## Build

- use npm del package for deleting files
- injecting scripts into HTML doesn't support external files (like aframe from CDN)
- build process doesn't copy other files (images, etc)
- use ES6? we need different uglify package

### General:
- what ES6 features can we use natively (to make code nicer and shorter)?
- [ ] main menu
  - one single index.html to launch both VR and Terminal
    - maybe we could use terminal as starting point and have a command to launch VR from there? - [it will not work well on mobile]
