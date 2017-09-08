### Terminal:
- [ ] don't depend on number of spaces between arguments: (nmap   c1234      d1234)
- [ ] ignore space at the beginning?
- [ ] review help text
- [ ] add help for top command
- [ ] prepare list of top 10 scores
- [ ] choose some font and test in in Firefox and Chrome (IE?) in different systems (Mac, Windows, Linux)
- [ ] cannot copy example code
- [ ] easter eggs (some additional commands?) - cat?
- [x] "top" command to display top 10 scores (?)
  - "top" without arguments just displays top 10 (with hardcoded initial values)
  - "top WIN_CODE NAME" adds entry to top 10 for given win code (from final screen and team name)
- [x] what characters to use for nodes/traps/target ?
- [x] add a legend to map explaining what symbols mean (nodes, traps, etc)
- [x] update map command layout to be more 'command line'
- [x] maybe help displays list of commands and `help map` or `help help` displays details
- [x] add example map image to the `help map` command
- [x] typo in 'help comand'
- [x] there is no cursor at the end of input after copying value
- [x] font in map doesn't work in Firefox (lines don't align)

## VR

- [ ] better sounds
  - sound when entering the trap
  - sound when time is ticking
  - sound on win?
- [ ] more help?
  - [ ] help hint on trap?
- [ ] more node actions? access (to show the code) + hack?
- [x] test game and adjust timings
- [x] stroke on hint looks bad
- [x] count time, moves (hacks, traps?) and display in the end
  - generate a code from it for a hi score in terminal?
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
- wrong terminal/trap:
[1,0.06,0.3,0.2,0.08,0.18,,,,,,,,,,,,,1,,,0.09,,0.5]
1,,0.19,0.13,0.12,0.22,,-0.02,,,,0.02,,,,,-0.0799,0.08,1,,,0.12,,0.5

- timer ticking: 1,,0.163,,0.0169,0.4782,,,,,,,,,,,,,1,,,0.1,,0.5
- jump: 2,0.3,0.11,,0.56,0.4091,,0.1027,,,,-0.02,,0.3075,,,,,0.83,,,0.3,,0.5
0,,0.54,0.2,0.1442,0.4647,,0.1048,0.12,,,,,0.5751,,,,,1,,,0.2745,,0.5
0,,0.39,,0.1515,0.3899,,0.203,,,,,,0.3676,,,,,1,,,0.0245,,0.5
0,0.002,0.0234,0.1937,0.7505,0.2288,,0.2736,0.0139,-0.1929,-0.2634,-0.818,-0.532,,,,-0.3047,0.8316,0.7164,-0.0983,,0.1088,0.0009,0.5

- lose: 0,0.0107,0.4818,0.1177,0.1103,0.5301,,-0.001,-0.2314,,0.8409,0.6064,-0.8357,-0.2814,-0.1833,,-0.1204,-0.0006,0.9992,0.2134,0.7968,0.9975,-0.8724,0.5
select:
- 0,,0.1906,,0.0556,0.4761,,,,,,,,0.1562,,,,,1,,,0.1,,0.5


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


// czasy gry solo

13 01:15, 1 pułapka (z 3 minut) => 45 sek -> najpierw kolory potem cel
?? 01:14, 1 pułapka

19 00:12, 2 pułapki             => 48 sek
 8 00:18, 2 pułapki             => 42 sek

10 01:04, 1 pułapka             => 56 (niepotrzebnie spisywałem kod)

20 01:45, 0 pułapek             => 1:15

19 01:57, 0 pułapek             => 1:03
14 00:49, 1 pułapka             => 1:11

---

12 0:22, 1 pułapka (128 - 32 - 22 = 74)
-
-
-
14 0:49, 1 pułapke (128 - 32 - 49 = 47)
11 0:50, 0          78
13 0:10, 2 pułapki (54)
