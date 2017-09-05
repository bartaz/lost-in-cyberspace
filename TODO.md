### Terminal:
- [ ] typo in 'help comand'
- [ ] review help text ('actual map of nodes' sounds strange)
- [ ] choose some font and test in in Firefox and Chrome (IE?) in different systems (Mac, Windows, Linux)
- [ ] cannot copy example code
- [x] what characters to use for nodes/traps/target ?
- [x] add a legend to map explaining what symbols mean (nodes, traps, etc)
- [x] update map command layout to be more 'command line'
- [x] maybe help displays list of commands and `help map` or `help help` displays details
- [x] add example map image to the `help map` command
- [ ] easter eggs (some additional commands?)

- [x] there is no cursor at the end of input after copying value
- [x] font in map doesn't work in Firefox (lines don't align)
- [ ] "top" command to display top 10 scores (?)
  - "top" without arguments just displays top 10 (with hardcoded initial values)
  - "top WIN_CODE NAME" adds entry to top 10 for given win code (from final screen and team name)

## VR

- [ ] count time, moves (hacks, traps?) and display in the end
  - generate a code from it for a hi score in terminal?
- [ ] test game and adjust timings
- [ ] better sounds
  - sound when entering the trap
  - sound when time is ticking
  - sound on win?
- [ ] more help?
  - [ ] help hint on trap?
- [ ] more node actions? access (to show the code) + hack?
- [x] show 2 terminals in nodes
- [x] win screen - better text
- [x] lose screen - better text
- [x] show timer on traps
- [x] start not on target
- [x] save current node (instead of color and hack, etc)
- [x] keep trap color in COLOR_VALUES
- [x] slow performance of painting walls on mobile
- [x] target not in sector with target code
- [x] bug - moving/clicking when game ends?

## sounds
- wrong terminal/trap: [1,0.06,0.3,0.2,0.08,0.18,,,,,,,,,,,,,1,,,0.09,,0.5]
- timer ticking: 1,,0.163,,0.0169,0.4782,,,,,,,,,,,,,1,,,0.1,,0.5
- jump: 2,0.3,0.11,,0.56,0.4091,,0.1027,,,,-0.02,,0.3075,,,,,0.83,,,0.3,,0.5

## Network

- [ ] list errors of invalid or conflicting codes
- [x] detect dead ends and put target there?
- [x] more traps (?)

## Help and tips

- [ ] we need to better explain how to play the game both in VR and terminal
- [ ] VR needs some tips on reading codes, hacking and navigating
- [x] Description in README and credits for codepen demo https://codepen.io/somethingformed/pen/raWJXV

### General:

- test main menu on mobile + FF
- add favicon?


### HI SCORE TOP 10 hackers:

bartaz & calanthe // our best score

Oracle & ?? (Braniac) / Black Canary
The Lone Gunmen
Acid Burn & Crash Override
Wasp & Bob the Dog
Johnny Mnemonic & Jones
Motoko & Project 2501
Martin Brice and Cosmo
Elliot Alderson & Mr. Robot (fsociety)
Neo & Trinity
