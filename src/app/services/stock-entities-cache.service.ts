import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, shareReplay, Subject, takeUntil } from 'rxjs';
import { Antenna } from '../common/domain/antenna';
import { AntennaPart } from './json-interfaces/antenna-part';
import { CraftPart, craftPartFromJson } from '../pages/mining-station/domain/craft-part';
import { KerbolSystemCharacteristics } from './json-interfaces/kerbol-system-characteristics';

@Injectable({providedIn: 'root'})
export class StockEntitiesCacheService {

  private destroy$ = new Subject<void>();

  miningParts$ = this.http.get<CraftPart[]>(
    'assets/stock/mining-parts.json')
    .pipe(
      takeUntil(this.destroy$),
      map(parts => parts.map(json => craftPartFromJson(json))),
      shareReplay(1),
    );

  planets$ = this.http.get<KerbolSystemCharacteristics>(
    'assets/stock/kerbol-system-characteristics.json')
    .pipe(
      takeUntil(this.destroy$),
      shareReplay(1),
    );

  antennae$ = this.http.get<AntennaPart[]>(
    'assets/stock/antenna-parts.json')
    .pipe(
      takeUntil(this.destroy$),
      map(parts => parts.map(json => Antenna.fromAntennaPart(json))),
      shareReplay(1),
    );

  constructor(private http: HttpClient) {
  }

}
