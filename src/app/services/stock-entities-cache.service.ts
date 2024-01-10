import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, shareReplay, Subject, takeUntil } from 'rxjs';
import { Antenna } from '../common/domain/antenna';
import { AntennaDto } from '../common/domain/dtos/antenna-dto';
import { CraftPart, craftPartFromJson } from '../pages/mining-station/domain/craft-part';
import { StarSystemDto } from '../common/domain/dtos/star-system-dto';

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

  starSystem$ = this.http.get<StarSystemDto>(
    'assets/stock/kerbol-system.json')
    .pipe(
      takeUntil(this.destroy$),
      shareReplay(1),
    );

  antennae$ = this.http.get<AntennaDto[]>(
    'assets/stock/antenna-parts.json')
    .pipe(
      takeUntil(this.destroy$),
      map(parts => parts.map(json => Antenna.fromJson(json))),
      shareReplay(1),
    );

  constructor(private http: HttpClient) {
  }

}
