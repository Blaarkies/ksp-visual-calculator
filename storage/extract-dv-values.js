/**
 * This script can run in the browser on https://alexmoon.github.io/ksp/
 * It will test planetary transfers between every celestial body, and extract the delta-v requirements for each transfer.
 * This info is used by the .\src\app\common\data-structures\delta-v-map\delta-v-graph.ts to build a node graph data structure.
 */

Array.prototype.joinSelf = function () {
  return this.map((item, i, list) =>
    list.map(innerItem => [item, innerItem]))
    .flat();
};

Array.prototype.distinct
  = function (indexCallback) {
  return indexCallback
    ? this.filter((parentItem, index, list) => indexCallback(parentItem, list) !== index)
    : this.filter((item, index, list) => list.indexOf(item) !== index);
};

let controlIds = {
  originSelect: 'originSelect',
  initialOrbit: 'initialOrbit',
  destinationSelect: 'destinationSelect',
  finalOrbit: 'finalOrbit',
  earliestDepartureYear: 'earliestDepartureYear',
  earliestDepartureDay: 'earliestDepartureDay',
  latestDepartureYear: 'latestDepartureYear',
  latestDepartureDay: 'latestDepartureDay',
  shortestTimeOfFlight: 'shortestTimeOfFlight',
  longestTimeOfFlight: 'longestTimeOfFlight',
  departureTime: 'departureTime',
  timeOfFlight: 'timeOfFlight',
  porkchopSubmit: 'porkchopSubmit',
  ejectionDeltaV: 'ejectionDeltaV',
  insertionDeltaV: 'insertionDeltaV',
  planeChangeDeltaV: 'planeChangeDeltaV',
  progressBar: '.progressContainer .progress .progress-bar',
};

let bodies = {
  moho: ['moho', 10, 1],
  eve: ['eve', 100, 2],
  gilly: ['gilly', 10, 1],
  kerbin: ['kerbin', 80, 3],
  mun: ['mun', 10, 1],
  minmus: ['minmus', 10, 2],
  duna: ['duna', 60, 4],
  ike: ['ike', 10, 1],
  dres: ['dres', 10, 5],
  jool: ['jool', 210, 6],
  laythe: ['laythe', 60, 1],
  vall: ['vall', 10, 2],
  tylo: ['tylo', 10, 3],
  bop: ['bop', 10, 4],
  pol: ['pol', 10, 5],
  eeloo: ['eeloo', 10, 7],
};

let groups = [
  [
    bodies.moho,
    bodies.eve,
    bodies.kerbin,
    bodies.duna,
    bodies.dres,
    bodies.jool,
    bodies.eeloo,
  ],
  [
    bodies.mun,
    bodies.minmus,
  ],
  [
    bodies.laythe,
    bodies.vall,
    bodies.tylo,
    bodies.bop,
    bodies.pol,
  ],
];

let isNodeEnv;

async function globalAsync() {
  try {
    isNodeEnv = !!process;
  } catch {
    isNodeEnv = false;
  }

  if (isNodeEnv) {
    console.log('Environment: node-js');
    globalThis.rxjs = require('rxjs');
  } else {
    console.log('Environment: browser');
    let scriptRxjs = document.createElement('script');
    scriptRxjs.src = "https://cdnjs.cloudflare.com/ajax/libs/rxjs/6.1.0/rxjs.umd.js";
    document.head.appendChild(scriptRxjs);
    await new Promise(r => setTimeout(() => r(), 1000));
  }

  if (!rxjs) {
    throw new Error('RxJS not initialized');
  }

  await extractDvNumbers();
}

globalAsync()
  .catch(e => console.error(e));

function setOriginControl([bodyName, altitude, fakeIndex]) {
  if (isNodeEnv) return;
  let selectElement = document.getElementById(controlIds.originSelect);
  let index = Array.from(selectElement.options)
    .findIndex(o => o.value.toLowerCase() === bodyName);
  index = index === -1 ? fakeIndex : index;
  selectElement.selectedIndex = index;
  selectElement.dispatchEvent(new Event('change'));
  document.getElementById(controlIds.initialOrbit).value = altitude;

  if (index < 0) {
    throw new Error(`Could not find ${bodyName}`);
  }
}

function setDestinationControl([bodyName, altitude, fakeIndex]) {
  if (isNodeEnv) return;
  let selectElement = document.getElementById(controlIds.destinationSelect);
  let index = Array.from(selectElement.options)
    .findIndex(o => o.value.toLowerCase() === bodyName);
  index = index === -1 ? fakeIndex : index;
  selectElement.selectedIndex = index;
  selectElement.dispatchEvent(new Event('change'));
  document.getElementById(controlIds.finalOrbit).value = altitude;

  if (index < 0) {
    throw new Error(`Could not find ${bodyName}`);
  }
}

function setFlightDates(startDepartureYear, lastDepartureYear, tofLow, tofHigh) {
  if (isNodeEnv) return;

  document.getElementById(controlIds.earliestDepartureYear).value = Math.round(startDepartureYear);
  document.getElementById(controlIds.earliestDepartureDay).value = 1;

  document.getElementById(controlIds.latestDepartureYear).value = Math.round(lastDepartureYear);
  document.getElementById(controlIds.latestDepartureDay).value = 1;

  document.getElementById(controlIds.shortestTimeOfFlight).value = Math.round(tofLow);
  document.getElementById(controlIds.longestTimeOfFlight).value = Math.round(tofHigh);
}

function plot() {
  if (isNodeEnv) return;
  document.getElementById(controlIds.porkchopSubmit).click();
}

async function waitForCalculation() {
  if (isNodeEnv) return;
  await rxjs.timer(2000).pipe(
    rxjs.operators.switchMap(() => rxjs.interval(500)),
    rxjs.operators.filter(() => document.querySelector(controlIds.progressBar).style.width === '0%'),
    rxjs.operators.take(1))
    .toPromise();
}

function getInfo() {
  if (isNodeEnv) return;
  let ejectDv = document.getElementById(controlIds.ejectionDeltaV).innerText;
  let captureDv = document.getElementById(controlIds.insertionDeltaV).innerText;
  let planeChangeDv = document.getElementById(controlIds.planeChangeDeltaV).innerText;
  let departureTime = document.getElementById(controlIds.departureTime).title;
  let timeOfFlight = document.getElementById(controlIds.timeOfFlight).title;

  ejectDv = ejectDv.replace(',', '').replace(' m/s', '');
  captureDv = captureDv.replace(',', '').replace(' m/s', '');
  planeChangeDv = planeChangeDv.replace(',', '').replace(' m/s', '');

  ejectDv = ejectDv ? Number(ejectDv) : 0;
  captureDv = captureDv ? Number(captureDv) : 0;
  planeChangeDv = planeChangeDv ? Number(planeChangeDv) : 0;

  departureTime = departureTime.replace('UT: ', '').replace('s', '');
  timeOfFlight = timeOfFlight.replace('s', '');

  let secondsToKerbinYear = 60 * 60 * 6 * 426;
  let secondsToKerbinDay = 60 * 60 * 6;
  let departureYear = Number(departureTime) / secondsToKerbinYear;
  let flightDays = Number(timeOfFlight) / secondsToKerbinDay;

  return {
    ejectDv,
    captureDv,
    planeChangeDv,
    departureYear,
    flightDays,
  };
}

async function getDvRequirementsForTrip(origin, destination) {
  setOriginControl(origin);
  setDestinationControl(destination);
  setFlightDates(1, 100, 10, 426 * 10);
  await rxjs.timer(500).toPromise();

  plot();
  await waitForCalculation();

  let info = getInfo();
  setFlightDates(info.departureYear * .5, info.departureYear * 2, info.flightDays * .5, info.flightDays * 2);
  await rxjs.timer(500).toPromise();

  plot();
  await waitForCalculation();

  let {ejectDv, captureDv, planeChangeDv} = getInfo();

  return {
    origin: origin[0],
    destination: destination[0],
    ejectDv,
    captureDv,
    planeChangeDv,
  };
}

async function extractDvNumbers() {
  let steps = groups.map(g => g.joinSelf()
    .filter(([a, b]) => a !== b)
    .distinct((parentItem, list) => list.findIndex(item => item.every(so => parentItem.includes(so)))))
    .flat()
    .filter(([[a], [b]]) => ![a, b].every(e => 'kerbin moho'.includes(e)));

  let results = [];
  for (let [a, b] of steps) {
    let value = await getDvRequirementsForTrip(a, b);
    results.push(value);
  }

  let output = JSON.stringify(results);

  console.log(output);
}
