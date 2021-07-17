import { FaqDialogComponent } from './faq-dialog.component';
import { MockBuilder, MockRender } from 'ng-mocks';
import { AppModule } from '../../app.module';
import { HttpClient } from '@angular/common/http';
import { ineeda } from 'ineeda';
import { EMPTY, of } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';

let componentType = FaqDialogComponent;
describe(componentType.name, () => {

  beforeEach(() => MockBuilder(componentType)
    .mock(AppModule)
    .mock(HttpClient, ineeda<HttpClient>({get: url => EMPTY}))
    .mock(BreakpointObserver, ineeda<BreakpointObserver>({
      observe: () => of(),
    })));

  it('should create', () => {
    let fixture = MockRender(componentType);
    expect(fixture.point.componentInstance).toBeDefined();
  });

});
