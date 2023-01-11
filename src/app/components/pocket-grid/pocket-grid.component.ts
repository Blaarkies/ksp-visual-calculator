import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { PocketGridLinesComponent } from '../pocket-grid-lines/pocket-grid-lines.component';
import { firstValueFrom, takeUntil, timer } from 'rxjs';
import { PocketGridManagerService } from '../pocket-manager/pocket-grid-manager.service';
import { WithDestroy } from '../../common/with-destroy';

export class Pocket {
  index: number;
}

export class GridLines {
  columns: number[];
  rows: number[];
}

export class PocketLayout extends GridLines {
  pockets: Pocket[];
}

@Component({
  standalone: true,
  selector: 'cp-pocket-grid',
  templateUrl: './pocket-grid.component.html',
  styleUrls: ['./pocket-grid.component.scss'],
  imports: [
    PocketGridLinesComponent,
  ],
})
export class PocketGridComponent extends WithDestroy() {

  templateColumns: string;
  templateRows: string;

  constructor(private gridService: PocketGridManagerService) {
    super();

    gridService.layoutReload$
      .pipe(takeUntil(this.destroy$))
      .subscribe(layout => this.setNewTemplateAxis(layout));
  }

  // async ngAfterViewInit() {
  //   await firstValueFrom(timer(0));
  //
  //   let gridLines = {
  //     columns: this.pocketLayout.columns,
  //     rows: this.pocketLayout.rows,
  //   };
  //   this.updateGridLines(gridLines);
  //   this.gridLines.setGridLines(gridLines);
  // }

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
