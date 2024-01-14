import {
  BehaviorSubject,
  map,
  Observable,
  shareReplay,
} from 'rxjs';
import { Antenna } from '../../models/antenna';

function getNewSubject() {
  return new BehaviorSubject<Antenna[]>([]);
}

let antennae$ = getNewSubject();

function getNewMap() {
  return antennae$.pipe(
    map(list => new Map<string, Antenna>(
      list.map(a => [a.label, a]))),
    shareReplay(1),
  );
}

let antennaeMap$ = getNewMap();

export function antennaServiceDestroy() {
  antennae$.complete();
}

export function antennaServiceSetAntennae(value: Antenna[]) {
  if (antennae$.closed) {
    antennae$ = getNewSubject();
    antennaeMap$ = getNewMap();
  }
  antennae$.next(value);
}

export function antennaServiceGetAntennaeMap$(): Observable<Map<string, Antenna>> {
  return antennaeMap$;
}
