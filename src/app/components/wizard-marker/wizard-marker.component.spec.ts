import { WizardMarkerComponent } from './wizard-marker.component';
import { MockBuilder, MockRender } from 'ng-mocks';
import { AppModule } from '../../app.module';

let componentType = WizardMarkerComponent;
describe('WizardMarkerComponent', () => {

  beforeEach(() => MockBuilder(componentType).mock(AppModule));

  it('should create', () => {
    let fixture = MockRender(componentType);
    expect(fixture.point.componentInstance).toBeDefined();
  });

  it('when type is set as ring, should show ringHost', () => {
    let fixture = MockRender(componentType, {type: 'ring'});
    let component = fixture.point.componentInstance;

    expect(component.ringHost).toBeTrue();

    component.type = 'pane';
    expect(component.ringHost).toBeFalse();
  });

});
