# KSP CommNet Planner

[Demo](https://ksp-commnet-planner.blaarkies.com)

## A tool for Kerbal Space Program

This helps players visualize and plan out their communication networks in Kerbal Space Program.

### Map preview

The Signal Check page imitates the map view from Kerbal Space Program, showing all planets, moons, and spacecraft.

From here the user can drag planets/moons along their orbits, and spacecraft can be dragged to anywhere on the map.

![A relay network](./storage/map-preview.jpg?raw=true "A relay network")

### Modify in real-time

The user can add/edit spacecraft at any time to change their name, map icon, and attached antennae.

Planets and moons can also be modified. A great example is to change the Tracking Station's level on Kerbin to match
whatever level the player currently has in-game.

The difficulty menu item can change the difficulty settings (to match those in-game) relating to a CommNet:
a range modifier, and a DSN modifier that limits the range on harder difficulties.

### Communication lines

Spacecraft with relay type antennae will relay any other spacecraft signals. This is helpful to determine if a multi-hop
network is capable of relaying a signal from a distant planet, back to Kerbin.

By dragging planets into specific positions, the user can determine where/when the satellite will have a connection.

The communication lines appear between spacecraft and/or Kerbin, and imitate those seen in-game: a solid green line
shows that both ends have a good connection to each other.

![Good signal](./storage/green-line.jpg?raw=true "Good signal")

A red color line shows that the connection is very weak.

![Bad signal](./storage/red-line.jpg?raw=true "Bad signal")

#

___

## *Developer info*

#### Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change
any of the source files.

#### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag
for a production build.

#### Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

#### Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

#### Further help

To get more help on the Angular CLI use `ng help` or go check out
the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
