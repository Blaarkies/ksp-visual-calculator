## Version {next}

#### {featureName}, Improvements, Bug fixes, etc.

---

## Version 1.3.3

#### Improvements
- Copy a craft; When editing a craft, click the 'Copy' button to transfer all details to a brand-new craft
- Fine-tune an existing craft's location with pre-filled 'Advanced Placement' options in the edit craft dialog; These let you create/move a craft to a specific location, i.e. around Minmus, at altitude 69420m, at orbit location 45°.
  - The new angle-input makes this even more intuitive
- The planet in focus is now highlighted in the focus panel
- Smoother camera animations

#### Bug fixes
- Missing Zoom Indicator element on the CommNet Planner page
- Tab presses on dialogs caused the planet focus selection to trigger

#### Dev
- New library for unit-tests and end-to-end tests; Helps prevent regressions such as the missing Zoom Indicator
- Upgrade to Angular 17
- Test validation on automatic deployments

---

## Version 1.3.2

#### [CommNet Remote Guidance](https://ksp-visual-calculator.blaarkies.com/commnet-planner) 
- Adds a ‘No Connection’ indicator to craft that have no control through a CommNet signal
  - At a glance, spot any craft that require attention due to a missing relay antenna, or an inadequate network
- Implements the [Probe Control Point](https://wiki.kerbalspaceprogram.com/wiki/Probe_Control_Point) mechanics; these let you setup piloted remote control stations and bases, without a signal back to Kerbin
- New parts in the antennae list:
  - RC-001S Remote Guidance Unit
  - RC-L01 Remote Guidance Unit
  - Mk1-3 Command Pod
  - Mk2 Lander Can
  - Munar Excursion Module (Making History)
- These parts have a ‘Single-Hop’ functionality, except for the ‘RC-L01’ which has ‘Multi-Hop’ capability:
  - Multi-Hop can control other craft if a relay connection is present from the pilot station to the other craft, even if it needs multiple relay satellites between them
  - Single-Hop can also control other craft, but only in the first link of the signal chain
  - Add these parts to a craft’s antennae list to have remote guidance capability onboard
    
#### Improvements
- Add a Preferences dialog in the blue menu; this can set light/dark theme without a login, or hide the holiday decorations if they get too distracting
- Fix craft icon-and-edit-button layout; this prevents accidental ‘edit’ button taps while dragging space objects around
- Allow ‘undo’ after deleting a savegame
- Save camera position and zoom in savegames; now loading (or importing) a savegame will adjust the camera to where it was intended by the author

#### Bug fixes
- Savegame json files that were exported from older versions of the website can now be imported into any new version
- Kerbin occasionally had the wrong level of tracking station by default; It now starts with ‘Tracking Station 1’ on new starts

---

