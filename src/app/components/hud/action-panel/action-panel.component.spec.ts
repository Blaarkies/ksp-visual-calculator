import { ActionPanelComponent } from './action-panel.component';
import { MockBuilder, MockRender } from 'ng-mocks';
import { AppModule } from '../../app.module';
import { MatExpansionPanel } from '@angular/material/expansion';
import { ineeda } from 'ineeda';

let componentType = ActionPanelComponent;
describe('ActionPanelComponent', () => {

  beforeEach(() => MockBuilder(componentType).mock(AppModule));

  let params = {color: '', location: ''};

  it('should create', () => {
    let fixture = MockRender(componentType, params);
    expect(fixture.point.componentInstance).toBeDefined();
  });

  it('listenClickAway() calls expander close', () => {
    let fixture = MockRender(componentType, params);
    let component = fixture.point.componentInstance;

    let expanderCloseCalled = false;
    let expander = ineeda<MatExpansionPanel>({
      close: () => expanderCloseCalled = true,
    });
    component.listenClickAway(expander);
    window.dispatchEvent(new PointerEvent('pointerup'));

    expect(expanderCloseCalled).toBeTrue();

    component.ngOnDestroy();
  });

});
