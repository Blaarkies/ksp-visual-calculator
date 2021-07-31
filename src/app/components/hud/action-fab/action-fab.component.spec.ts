import { MockBuilder, MockRender } from 'ng-mocks';
import { ActionFabComponent } from './action-fab.component';
import { AppModule } from '../../../app.module';
import { ActionOption } from '../../../common/domain/action-option';
import { ineeda } from 'ineeda';
import { ActionGroupType } from '../hud.component';
import { fakeAsync } from '@angular/core/testing';

let componentType = ActionFabComponent;
describe('ActionFabComponent', () => {

  beforeEach(() => MockBuilder(componentType).mock(AppModule));

  it('should create', () => {
    let fixture = MockRender(componentType, {options});
    expect(fixture.point.componentInstance).toBeDefined();
  });

  let options: ActionOption[] = [
    ineeda<ActionOption>({unread: true}),
    ineeda<ActionOption>({unread: false}),
    ineeda<ActionOption>({unread: false}),
  ];

  it('constructing with options should update lastOptions and unreadCount', () => {
    let fixture = MockRender(componentType, {options});
    let component = fixture.point.componentInstance;

    expect(component.lastOptions.length).toBe(options.length);
    expect(component.unreadCount).toBe(1);
  });

  it('actionButton() should output activate.emit()', () => {
    let actionGroupType = ActionGroupType.General;
    let fixture = MockRender(componentType, {options, actionGroupType});
    let component = fixture.point.componentInstance;

    spyOn(component.activate, 'emit');

    component.actionButton();

    expect(component.activate.emit).toHaveBeenCalledWith(
      jasmine.objectContaining({
        group: actionGroupType,
      }));
  });

  it('activate.emit() output a callback to updateUnreadCount()', fakeAsync(() => {
    let fixture = MockRender(componentType, {options});
    let component = fixture.point.componentInstance;

    spyOn(component, 'updateUnreadCount' as any);

    component.activate.subscribe(output => {
      output.callback();
      expect((component as any).updateUnreadCount).toHaveBeenCalled();
    });

    component.actionButton();

    component.activate.complete();
  }));

});
