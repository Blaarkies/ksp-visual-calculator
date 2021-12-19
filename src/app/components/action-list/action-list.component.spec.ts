import { MockBuilder, MockInstance, MockRender } from 'ng-mocks';
import { AppModule } from '../../app.module';
import { ActionListComponent } from './action-list.component';
import { ActionOption } from '../../common/domain/action-option';
import { firstValueFrom, of, take } from 'rxjs';
import { fakeAsync, tick } from '@angular/core/testing';
import { AnalyticsService } from '../../services/analytics.service';
import createSpy = jasmine.createSpy;

let componentType = ActionListComponent;
describe('ActionListComponent', () => {

  let makeOption = (letter, actionMeta) => new ActionOption(
    `label${letter}`,
    `icon${letter}`,
    actionMeta);
  let options: ActionOption[];

  beforeEach(() => {
    options = [
      makeOption('A', {action: () => void 0}),
      makeOption('B', {route: 'route2'}),
      makeOption('C', {externalRoute: 'externalRoute3'}),
    ];

    return MockBuilder(componentType).mock(AppModule);
  });

  it('should create', () => {
    let fixture = MockRender(componentType);
    expect(fixture.point.componentInstance).toBeDefined();
  });

  it('update unreadCount on new options', fakeAsync(() => {
    let fixture = MockRender(componentType);
    let component = fixture.point.componentInstance;

    let list2Unreads = [
      makeOption('A', {route: ''}),
      makeOption('B', {route: ''}),
      makeOption('C', {route: ''}),
    ];
    list2Unreads[0].unread = true;
    list2Unreads[1].unread = true;

    component.options = list2Unreads;
    tick();

    expect(component.unreadCount).toBe(2);

    let list3Unreads = [
      makeOption('A', {route: ''}),
      makeOption('B', {route: ''}),
      makeOption('C', {route: ''}),
    ];
    list3Unreads[0].unread = true;
    list3Unreads[1].unread = true;
    list3Unreads[2].unread = true;

    component.options = list3Unreads;
    tick();

    expect(component.unreadCount).toBe(3);
  }));

  it('updateUnreads()', fakeAsync(() => {
    let onReadCalled = false;
    options[0] = new ActionOption('', '', {route: ''}, '', true,
      () => onReadCalled = true);

    let fixture = MockRender(componentType, {options});
    let component = fixture.point.componentInstance;
    tick();

    expect(component.unreadCount).toBe(1);
    expect(onReadCalled).toBeFalse();

    component.updateUnreads(options[0]);
    expect(onReadCalled).toBeTrue();
    expect(options[0].unread).toBeFalse();
    expect(component.unreadCount).toBe(0);
  }));

  it('logExternalLink() calls analyticsService.logEvent()', () => {
    let spyAnalyticsService = MockInstance(AnalyticsService, 'logEvent', createSpy());

    let fixture = MockRender(componentType);
    let component = fixture.point.componentInstance;

    component.logExternalLink('');
    expect(spyAnalyticsService).toHaveBeenCalled();
  });

  it('logRoute calls analyticsService.logEvent()', () => {
    let spyAnalyticsService = MockInstance(AnalyticsService, 'logEvent', createSpy());

    let fixture = MockRender(componentType);
    let component = fixture.point.componentInstance;

    component.logRoute('');
    expect(spyAnalyticsService).toHaveBeenCalled();
  });

  it('create matching list options from input', () => {
    let fixture = MockRender(componentType, {options});

    let listOptions = fixture.debugElement.nativeElement.querySelectorAll('mat-list-option');
    expect(listOptions.length).toBe(3);
    expect(listOptions[0].innerText.includes(options[0].label)).toBeTrue();
    expect(listOptions[1].innerText.includes(options[1].label)).toBeTrue();
    expect(listOptions[2].innerText.includes(options[2].label)).toBeTrue();
  });

  it('create matching actions in list', () => {
    let action1Called = false;
    options[0].actionMeta = {action: () => action1Called = true};

    let fixture = MockRender(componentType, {options});

    let listOptions = Array.from(
      fixture.debugElement.nativeElement.querySelectorAll('mat-list-option')) as HTMLDivElement[];

    expect(action1Called).toBeFalse();
    listOptions[0].click();
    expect(action1Called).toBeTrue();

    let routerLink = listOptions[1].attributes.getNamedItem('ng-reflect-router-link').value;
    expect(routerLink).toBe(`/${options[1].actionMeta.route}`);

    let href = listOptions[2].querySelector('a').href;
    expect(href).toContain(options[2].actionMeta.externalRoute);
  });

  it('emit action when option clicked', () => {
    let fixture = MockRender(componentType, {options});
    let component = fixture.point.componentInstance;

    let listOptions = Array.from(
      fixture.debugElement.nativeElement.querySelectorAll('mat-list-option')) as HTMLDivElement[];

    spyOn(component.action, 'emit');
    expect(component.action.emit).toHaveBeenCalledTimes(0);

    listOptions[0].click();
    expect(component.action.emit).toHaveBeenCalledTimes(1);

    listOptions[1].click();
    expect(component.action.emit).toHaveBeenCalledTimes(2);

    listOptions[2].click();
    expect(component.action.emit).toHaveBeenCalledTimes(3);
  });

  it('update unreads when action when option clicked', () => {
    let fixture = MockRender(componentType, {options});
    let component = fixture.point.componentInstance;

    let listOptions = Array.from(
      fixture.debugElement.nativeElement.querySelectorAll('mat-list-option')) as HTMLDivElement[];

    spyOn(component, 'updateUnreads');
    expect(component.updateUnreads).toHaveBeenCalledTimes(0);

    listOptions[0].click();
    expect(component.updateUnreads).toHaveBeenCalledTimes(1);

    listOptions[1].click();
    expect(component.updateUnreads).toHaveBeenCalledTimes(2);

    listOptions[2].click();
    expect(component.updateUnreads).toHaveBeenCalledTimes(3);
  });

  it('log to analytics when routes are clicked', () => {
    let fixture = MockRender(componentType, {options});
    let component = fixture.point.componentInstance;

    let listOptions = Array.from(
      fixture.debugElement.nativeElement.querySelectorAll('mat-list-option')) as HTMLDivElement[];

    spyOn(component, 'logRoute');
    spyOn(component, 'logExternalLink');

    listOptions[1].click();
    expect(component.logRoute).toHaveBeenCalled();

    listOptions[2].click();
    expect(component.logExternalLink).toHaveBeenCalled();
  });

  it('stop unavailable options when clicked', async () => {
    let action1Called = false;
    options[0].actionMeta = {action: () => action1Called = true};

    let unavailableActionCalled = false;
    options[0].unavailableMeta = {
      action: () => unavailableActionCalled = true,
      unavailable$: of(true),
      tooltip: 'unavailableMeta',
    };

    let fixture = MockRender(componentType, {options});

    await firstValueFrom(options[0].unavailableMeta.unavailable$);
    fixture.detectChanges();

    let listOptions = Array.from(
      fixture.debugElement.nativeElement.querySelectorAll('mat-list-option')) as HTMLDivElement[];

    expect(unavailableActionCalled).toBeFalse();

    let option0Button = listOptions[0].querySelector('div.action-button') as HTMLButtonElement;
    option0Button.click();

    expect(action1Called).toBeFalse();
    expect(unavailableActionCalled).toBeTrue();

    let tooltip = option0Button.attributes.getNamedItem('ng-reflect-message').value;
    expect(tooltip).toBe('unavailableMeta');
  });

});
