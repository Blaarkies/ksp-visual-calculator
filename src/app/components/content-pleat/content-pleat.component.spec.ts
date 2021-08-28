import { ContentPleatComponent } from './content-pleat.component';
import { MockBuilder, MockRender } from 'ng-mocks';
import { AppModule } from '../../app.module';

let componentType = ContentPleatComponent;
describe('ContentPleatComponent', () => {

  beforeEach(() => MockBuilder(componentType).mock(AppModule));

  it('should create', () => {
    let fixture = MockRender(componentType);
    expect(fixture.point.componentInstance).toBeDefined();
  });

  it('open() should call panel.open()', () => {
    let fixture = MockRender(componentType);
    let component = fixture.point.componentInstance;

    spyOn(component.panel, 'open');
    component.open();

    expect(component.panel.open).toHaveBeenCalled();
  });

});
