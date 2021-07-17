import { MockBuilder, MockRender } from 'ng-mocks';
import { AppModule } from '../../app.module';
import { ActionBottomSheetComponent, ActionBottomSheetData } from './action-bottom-sheet.component';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { ineeda } from 'ineeda';

let componentType = ActionBottomSheetComponent;
describe('ActionBottomSheetComponent' /*componentType.name*/, () => {

  beforeEach(() => MockBuilder(componentType)
    .mock(AppModule)
    .mock(MatBottomSheetRef)
    .mock(MAT_BOTTOM_SHEET_DATA, ineeda<ActionBottomSheetData>({
      startTitle: '',
      actionOptions: [],
    })));

  it('should create', () => {
    let fixture = MockRender(componentType);
    expect(fixture.point.componentInstance).toBeDefined();
  });

});
