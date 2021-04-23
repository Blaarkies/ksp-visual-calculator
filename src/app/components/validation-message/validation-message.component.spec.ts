import { ValidationMessageComponent } from './validation-message.component';
import { MockBuilder, MockRender } from 'ng-mocks';
import { AppModule } from '../../app.module';

let componentType = ValidationMessageComponent;
describe(componentType.name, () => {

  beforeEach(() => MockBuilder(componentType).mock(AppModule));

  it('should create', () => {
    let fixture = MockRender(componentType);
    expect(fixture.point.componentInstance).toBeDefined();
  });

});
