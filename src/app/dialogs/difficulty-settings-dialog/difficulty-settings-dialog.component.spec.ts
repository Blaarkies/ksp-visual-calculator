import { DifficultySettingsDialogComponent } from './difficulty-settings-dialog.component';
import { MockBuilder, MockRender } from 'ng-mocks';
import { AppModule } from '../../app.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DifficultySetting } from './difficulty-setting';

let componentType = DifficultySettingsDialogComponent;
describe(componentType.name, () => {

  beforeEach(() => MockBuilder(componentType)
    .mock(AppModule)
    .mock(MatDialogRef)
    .mock(MAT_DIALOG_DATA, DifficultySetting.normal));

  it('should create', () => {
    let fixture = MockRender(componentType);
    expect(fixture.point.componentInstance).toBeDefined();
  });

});
