import { FaqDialogComponent } from './faq-dialog.component';
import { MockBuilder, MockRender } from 'ng-mocks';
import { AppModule } from '../../app.module';
import { HttpClient } from '@angular/common/http';
import { ineeda } from 'ineeda';
import { EMPTY } from 'rxjs';

let componentType = FaqDialogComponent;
describe(componentType.name, () => {

  beforeEach(() => MockBuilder(componentType)
    .mock(AppModule)
    .mock(HttpClient, ineeda<HttpClient>({get: url => EMPTY})));

  it('should create', () => {
    let fixture = MockRender(componentType);
    expect(fixture.point.componentInstance).toBeDefined();
  });

});
