import { Injectable } from '@angular/core';
import { GridLines, PocketLayout } from '../pocket-grid/pocket-grid.component';
import { ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'any'
})
export class PocketGridManagerService {

  layoutReload$ = new ReplaySubject<PocketLayout>();
  linesUpdate$ = new ReplaySubject<GridLines>();

  constructor() {
  }

  destroy() {
    this.layoutReload$.complete();
    this.linesUpdate$.complete();
  }

  updateLayout(pocketLayout: PocketLayout) {
    this.layoutReload$.next(pocketLayout);
  }

  updateGridLines(gridLines: GridLines) {
    this.linesUpdate$.next(gridLines);
  }
}
