import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, shareReplay, Subject, takeUntil } from 'rxjs';
import { CraftPart } from './domain/craft-part';
import { KerbolSystemCharacteristics } from '../../services/json-interfaces/kerbol-system-characteristics';

@Injectable({
  providedIn: 'root'
})
export class StockEntitiesCacheService {

  private destroy$ = new Subject<void>();

  miningParts$ = this.http.get<CraftPart[]>(
    'assets/stock/mining-parts.json')
    .pipe(
      takeUntil(this.destroy$),
      map(parts => parts.map(json => CraftPart.fromJson(json))),
      shareReplay(1),
    );

  planets$ = this.http.get<KerbolSystemCharacteristics>(
    'assets/stock/kerbol-system-characteristics.json')
    .pipe(
      takeUntil(this.destroy$),
      shareReplay(1),
    );

  constructor(private http: HttpClient) {
  }

}
