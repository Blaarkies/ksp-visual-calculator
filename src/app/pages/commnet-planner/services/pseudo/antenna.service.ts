import {
  BehaviorSubject,
  map,
  Observable,
  shareReplay,
} from 'rxjs';
import { Antenna } from '../../../../common/domain/antenna';

let antennae$ = new BehaviorSubject<Antenna[]>([]);
let antennaeMap$ = antennae$.pipe(
  map(list => new Map<string, Antenna>(
    list.map(a => [a.label, a]))),
  shareReplay(1),
);

export function antennaServiceDestroy() {
  antennae$.complete();
}

export function antennaServiceSetAntennae(value: Antenna[]) {
  antennae$.next(value);
}

export function antennaServiceGetAntennaeMap$(): Observable<Map<string, Antenna>> {
  return antennaeMap$;
}
