import { Component } from '@angular/core';
import { PocketGridLinesComponent } from '../pocket-grid-lines/pocket-grid-lines.component';
import { Observable, takeUntil } from 'rxjs';
import { PocketGridManagerService } from '../pocket-manager/pocket-grid-manager.service';
import { WithDestroy } from '../../common/with-destroy';
import { CommonModule } from '@angular/common';
import { WidgetWindowComponent } from '../widget-window/widget-window.component';

export class WidgetDetails {
  // TODO: allow all widget types to pass data through this
  modifiedTimestamp: Date;
}

export class WidgetType {
  static isruHeatPower = 'ISRU-heat-power';
  static visViva = 'vis-viva';
  static ionProbe = 'ion-probe';
  static planetStats = 'planet-stats';
}

export class Widget {
  index: number;
  type: WidgetType;
  savedDetails?: WidgetDetails;
}

export class GridLines {
  columns: number[];
  rows: number[];
}

export class PocketLayout extends GridLines {
  pockets: Widget[];
}

@Component({
  standalone: true,
  selector: 'cp-pocket-grid',
  templateUrl: './pocket-grid.component.html',
  styleUrls: ['./pocket-grid.component.scss'],
  imports: [
    PocketGridLinesComponent,
    CommonModule,
    WidgetWindowComponent,
  ],
})
export class PocketGridComponent extends WithDestroy() {

  templateColumns: string;
  templateRows: string;
  pockets$: Observable<Widget[]>;

  constructor(private gridService: PocketGridManagerService) {
    super();

    gridService.layoutReload$
      .pipe(takeUntil(this.destroy$))
      .subscribe(layout => this.setNewTemplateAxis(layout));

    this.pockets$ = gridService.widgets$;
  }

  private getCellSize(list: number[]) {
    return [0, ...list, 100]
      .windowed(2)
      .map(([a, b]) => b - a + '%')
      .join(' ');
  }

  updateGridLines(gridLines: GridLines) {
    this.gridService.updateGridLines(gridLines);
    this.setNewTemplateAxis(gridLines);
  }

  private setNewTemplateAxis(gridLines: GridLines) {
    this.templateColumns = this.getCellSize(gridLines.columns);
    this.templateRows = this.getCellSize(gridLines.rows);
  }
}
