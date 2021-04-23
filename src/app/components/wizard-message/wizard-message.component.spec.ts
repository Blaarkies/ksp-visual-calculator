import { WizardMessageComponent } from './wizard-message.component';
import { MockBuilder, MockRender } from 'ng-mocks';
import { AppModule } from '../../app.module';
import { Vector2 } from '../../common/domain/vector2';

let componentType = WizardMessageComponent;
describe(componentType.name, () => {

  beforeEach(() => MockBuilder(componentType).mock(AppModule));

  it('should create', () => {
    let fixture = MockRender(componentType, {location: new Vector2()});
    expect(fixture.point.componentInstance).toBeDefined();
  });

});
