import { SimpleDialogComponent, SimpleDialogData } from './simple-dialog.component';
import { MockBuilder, MockRender } from 'ng-mocks';
import { AppModule } from '../../app.module';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ineeda } from 'ineeda';

let componentType = SimpleDialogComponent;
describe(componentType.name, () => {

  beforeEach(() => MockBuilder(componentType)
    .mock(AppModule)
    .mock(MAT_DIALOG_DATA, ineeda<SimpleDialogData>({
      title: '',
      descriptions: [],
    })));

  it('should create', () => {
    let fixture = MockRender(componentType);
    expect(fixture.point.componentInstance).toBeDefined();
  });

});
