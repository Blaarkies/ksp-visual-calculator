import { Injectable } from '@angular/core';
import { GridLines, PocketLayout, Widget } from '../pocket-grid/pocket-grid.component';
import { ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'any'
})
export class PocketGridManagerService {

  layoutReload$ = new ReplaySubject<PocketLayout>();
  linesUpdate$ = new ReplaySubject<GridLines>();

  widgets$ = new ReplaySubject<Widget[]>();

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

  setWidgets(widgets: Widget[]) {
    this.widgets$.next(widgets);
  }
}
