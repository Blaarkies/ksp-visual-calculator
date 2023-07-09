#### KSP Visual Calculator

[Website](https://ksp-visual-calculator.blaarkies.com)

<a href="https://ksp-visual-calculator.blaarkies.com">
  <p align="center">
      <img src="./storage/logo-git-repo.png?raw=true"
           alt="The logo of KSP Visual Calculator"
           height="200" />
  </p>
</a>

## A calculator for Kerbal Space Program

Helping players visualize and plan out missions in Kerbal Space Program.
- [Delta-v Planner](#Delta-v-Planner), calculates how much delta-v is required to complete a mission with your specified checkpoints
- [CommNet Planner](#CommNet-Planner), simulates KerbNet signals with multiple craft to build efficient communication networks
- [ISRU Mining Station Planner](#ISRU-Mining-Station-Planner), highlights potential issues in the design of a surface mining base

KSP Visual Calculator is designed for use on desktop, tablet, and mobile. This allows playing Kerbal Space Program while also using a 
mobile device guide you towards great mission designs.

### Delta-v Planner

This page imitates the map view from Kerbal Space Program, showing all planets and moons.

Using the Mission Checkpoints panel, the user can set multiple checkpoints in the order that they should be visited. The required 
delta-v for this mission will be calculated automatically.

Each checkpoint can be configured with specific requirements:
- Flight situation; the craft could be launching from the surface, or from Low Orbit, etc. 
- Route Types; a simple direct route, or an efficient route used to determine the trip details
- Aerobraking; whether the craft intends on using aerobraking to reduce the delta-v requirements
- Plane change cost; the more patient the mission is, the less delta-v needs to be expended to correct for inclination changes between planets

![A footsteps on the moons mission](./storage/map-dv-preview.jpg?raw=true "A footsteps on the moons mission")


### CommNet Planner

Simulates the map view from Kerbal Space Program, showing all planets, moons, and spacecraft.

From here the user can drag planets/moons along their orbits, and spacecraft can be dragged to be anywhere on the map.

![A relay network](./storage/map-signal-preview.jpg?raw=true "A relay network")

#### Modify in real-time

The user can add/edit spacecraft at any time to change their name, map icon, and attached antennae.

Planets and moons can also be modified. For example, you can change the Tracking Station's level on Kerbin to match
whatever level the player currently has in-game.

The difficulty settings can be modified to match those in-game. The settings relate to the CommNet that limits the range on harder difficulties:
- Range modifier 
- DSN modifier

#### Communication lines

Spacecraft with relay type antennae will relay any other spacecraft signals. This is helpful to determine if a multi-hop
network is capable of relaying a signal from a distant planet, back to Kerbin.

By dragging planets into specific positions, the user can determine where/when the satellite will have a connection.

The communication lines appear between spacecraft and/or Kerbin, and imitate those seen in-game: 

A solid green line shows that both ends have a good connection to each other.

![Good signal](./storage/green-line.jpg?raw=true "Good signal")

A red color line shows that the connection is very weak.

![Bad signal](./storage/red-line.jpg?raw=true "Bad signal")

### ISRU Mining Station Planner

Provides a sandbox environment where you can dream up any moon base design, and validate its resource production capabilities.

Add all the parts that you plan on using, set the environment controls to match your intended location, and get immediate results.

The error messages will guide you on fixing the issues your craft might encounter in real operation.

#
