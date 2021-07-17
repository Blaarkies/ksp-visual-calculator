import { MockBuilder, MockRender } from 'ng-mocks';
import { AppModule } from '../../app.module';
import { StateDisplayComponent } from './state-display.component';

let componentType = StateDisplayComponent;
describe(componentType.name, () => {

  beforeEach(() => MockBuilder(componentType).mock(AppModule));

  it('should create', () => {
    let fixture = MockRender(componentType);
    expect(fixture.point.componentInstance).toBeDefined();
  });

});
