import { WizardMessageComponent } from './wizard-message.component';
import { MockBuilder, MockRender } from 'ng-mocks';
import { AppModule } from '../../app.module';
import { Vector2 } from '../../common/domain/vector2';

let componentType = WizardMessageComponent;
describe('WizardMessageComponent', () => {

  beforeEach(() => MockBuilder(componentType).mock(AppModule));

  let location = new Vector2();

  it('should create', () => {
    let fixture = MockRender(componentType, {location});
    expect(fixture.point.componentInstance).toBeDefined();
  });

  it('set location should update host style', () => {
    let fixture = MockRender(componentType, {location});
    let component = fixture.point.componentInstance;
    fixture.detectChanges();

    let self: HTMLElement = fixture.debugElement.nativeElement.firstChild;

    let oldStyle = JSON.stringify(self.style);

    component.location = new Vector2(69, 420);
    fixture.detectChanges();

    let newStyle = JSON.stringify(self.style);
    expect(oldStyle).not.toBe(newStyle);
  });

});
