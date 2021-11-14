import { WizardMarkerComponent } from './wizard-marker.component';
import { MockBuilder, MockRender } from 'ng-mocks';
import { AppModule } from '../../app.module';
import { ineeda } from 'ineeda';

let componentType = WizardMarkerComponent;
describe('WizardMarkerComponent', () => {

  beforeEach(() => MockBuilder(componentType).mock(AppModule));

  it('should create', () => {
    let fixture = MockRender(componentType);
    expect(fixture.point.componentInstance).toBeDefined();
  });

  it('when type is set as ring, should show ring-marker class', async () => {
    let target = ineeda<HTMLDivElement>({
      getBoundingClientRect: () => ({
        width: 0,
        height: 0,
        left: 0,
        top: 0,
      }) as any,
    });

    let fixture = MockRender(componentType, {type: 'ring', target});
    fixture.detectChanges();

    let ringElement = fixture.debugElement.nativeElement.querySelector('.ring-marker');
    expect(!!ringElement).toBe(true);
  });

});
