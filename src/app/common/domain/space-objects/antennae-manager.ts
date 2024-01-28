import { Injectable } from '@angular/core';
import {
  map,
  shareReplay,
} from 'rxjs';
import { Antenna } from '../../../pages/commnet-planner/models/antenna';
import { StockEntitiesCacheService } from '../../../services/stock-entities-cache.service';

@Injectable({providedIn: 'root'})
export class AntennaeManager {

  antennaeMap$ = this.cacheService.antennae$.pipe(
    map(list => new Map<string, Antenna>(
      list.map(a => [a.label, a]))),
    shareReplay(1));

  constructor(private cacheService: StockEntitiesCacheService) {
  }

}
