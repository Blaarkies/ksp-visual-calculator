import { Component, ElementRef, EventEmitter, Output } from '@angular/core';
import { CdkDragEnd, DragDropModule, DragRef, Point } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { GridLines } from '../pocket-grid/pocket-grid.component';
import { PocketGridManagerService } from '../pocket-manager/pocket-grid-manager.service';
import { WithDestroy } from '../../common/with-destroy';
import { takeUntil } from 'rxjs';

type AxisGroup = 'columns' | 'rows';

@Component({
  standalone: true,
  selector: 'cp-pocket-grid-lines',
  templateUrl: './pocket-grid-lines.component.html',
  styleUrls: ['./pocket-grid-lines.component.scss'],
  imports: [
    CommonModule,
    DragDropModule,
  ],
})
export class PocketGridLinesComponent extends WithDestroy() {

  @Output() update = new EventEmitter<GridLines>();

  log = console.log;
  self: HTMLElement;

  columns: number[];
  rows: number[];

  constructor(elementRef: ElementRef,
              gridService: PocketGridManagerService) {
    super();

    this.self = elementRef.nativeElement;
    gridService.layoutReload$
      .pipe(takeUntil(this.destroy$))
      .subscribe(grid => this.setGridLines(grid));
  }

  getConstrainFn(group: AxisGroup, index: number) {
    return (userPointerPosition: Point,
            dragRef: DragRef,
            dimensions: ClientRect,
            pickupPositionInElement: Point): Point => {
      let boundaryElement = dragRef.getRootElement().parentElement;
      let newValue: number;

      let paddingPx = 200;
      switch (group) {
        case 'columns':
          let widthScalePx = .01 * boundaryElement.clientWidth;
          newValue = this.getCoercedX(userPointerPosition.x, widthScalePx, index, paddingPx);
          userPointerPosition.x = newValue;
          userPointerPosition.y = 0;
          break;
        case 'rows':
          let heightScalePx = .01 * boundaryElement.clientHeight;
          newValue = this.getCoercedY(userPointerPosition.y, heightScalePx, index, paddingPx);
          userPointerPosition.y = newValue;
          userPointerPosition.x = 0;
          break;
      }

      return userPointerPosition;
    };
  }

  private getCoercedX(valuePx: number,
                      widthScalePx: number,
                      index: number,
                      paddingPx: number): number {
    return valuePx.coerceIn(
      widthScalePx * (this.columns[index - 1] ?? 0) + paddingPx,
      widthScalePx * (this.columns[index + 1] ?? 100) - paddingPx);
  }


  private getCoercedY(valuePx: number,
                      heightScalePx: number,
                      index: number,
                      paddingPx: number): number {
    return valuePx.coerceIn(
      heightScalePx * (this.rows[index - 1] ?? 0) + paddingPx,
      heightScalePx * (this.rows[index + 1] ?? 100) - paddingPx);
  }

  setGridLines(gridLines: GridLines) {
    this.columns = gridLines.columns;
    this.rows = gridLines.rows;
  }

  updateDragLine<T>(event: CdkDragEnd,
                    group: AxisGroup,
                    index: number) {
    let boundaryElement = event.source.getRootElement().parentElement;

    switch (group) {
      case 'columns':
        let widthScalePx = .01 * boundaryElement.clientWidth;
        let coercedXPx = this.getCoercedX(event.dropPoint.x, widthScalePx, index, 200);
        this.columns.splice(index, 1, coercedXPx / widthScalePx);
        break;
      case 'rows':
        let heightScalePx = .01 * boundaryElement.clientHeight;
        let coercedYPx = this.getCoercedY(event.dropPoint.y, heightScalePx, index, 200);
        this.rows.splice(index, 1, coercedYPx / heightScalePx);
        break;
    }

    this.update.emit({
      columns: this.columns,
      rows: this.rows,
    });
  }

  getValue(index: number, item: number) {
    return item;
  }
}
