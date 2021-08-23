import { MockBuilder, MockInstance, MockRender } from 'ng-mocks';
import { AppModule } from '../app.module';
import { StateService } from './state.service';
import { UsableRoutes } from '../usable-routes';
import { SetupService } from './setup.service';
import { EMPTY, of, Subject } from 'rxjs';
import { SpaceObjectContainerService } from './space-object-container.service';
import { catchError, take, timeout } from 'rxjs/operators';
import { ineeda } from 'ineeda';
import { Antenna } from '../common/domain/antenna';
import { SpaceObject } from '../common/domain/space-objects/space-object';
import { DifficultySetting } from '../overlays/difficulty-settings-dialog/difficulty-setting';
import { SpaceObjectService } from './space-object.service';
import { DataService } from './data.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StateEntry } from '../overlays/manage-state-dialog/state-entry';
import { StateRow } from '../overlays/manage-state-dialog/state-row';
import objectContaining = jasmine.objectContaining;
import anything = jasmine.anything;
import arrayContaining = jasmine.arrayContaining;
import createSpy = jasmine.createSpy;
import stringMatching = jasmine.stringMatching;

let serviceType = StateService;
describe('StateService', () => {

  beforeEach(() => MockBuilder(serviceType).mock(AppModule));

  it('should be created', () => {
    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;
    expect(service).toBeDefined();
  });

  it('setStateRecord() should set lastStateRecord with the stringified state', () => {
    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;

    spyOnProperty(service, 'state', 'get')
      .and.returnValue({name: 'test-state'});

    service.setStateRecord();

    expect((service as any).lastStateRecord).toContain('test-state');
  });

  it('stateIsUnsaved should return true when lastStateRecord differs from state', () => {
    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;

    (service as any).lastStateRecord = 'old-not-saved';
    spyOnProperty(service, 'state', 'get')
      .and.returnValue({name: 'test-state'});

    expect(service.stateIsUnsaved).toBe(true);
  });

  it('stateIsUnsaved should return false when lastStateRecord matches state', () => {
    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;

    let state = {name: 'test-state'};
    (service as any).lastStateRecord = JSON.stringify(state);
    spyOnProperty(service, 'state', 'get')
      .and.returnValue(state);

    expect(service.stateIsUnsaved).toBe(false);
  });

  it('set pageContext should also reset name', () => {
    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;

    let serviceAsAny = service as any;
    serviceAsAny.name = 'test-name';
    service.pageContext = UsableRoutes.SignalCheck;

    expect(serviceAsAny.context).toBe(UsableRoutes.SignalCheck);
    expect(serviceAsAny.name).toBe(undefined);
  });

  it('earlyState should wait on setupService assets to be available', async (done) => {
    let stockPlanets$ = new Subject();
    let availableAntennae$ = new Subject();
    MockInstance(SetupService, instance => ({
      ...instance,
      stockPlanets$,
      availableAntennae$,
    } as any));

    MockInstance(SpaceObjectContainerService, instance => ({
      ...instance,
      celestialBodies$: of([]),
      crafts$: of([]),
    } as any));

    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;
    spyOnProperty(service, 'state', 'get')
      .and.returnValue({name: 'test-name'});

    let noAssetsResult = await service.earlyState
      .pipe(timeout(10), catchError(() => of('timeout')))
      .toPromise();

    expect(noAssetsResult).toBe('timeout');

    service.earlyState
      .pipe(timeout(10), catchError(() => of('timeout')))
      .subscribe((value: any) => {
        expect(value).toEqual({name: 'test-name'});
        done();
      });
    stockPlanets$.next([ineeda<SpaceObject>()]);
    availableAntennae$.next([ineeda<Antenna>()]);
  });

  it('state should return the current state', () => {
    MockInstance(SetupService, instance => ({
      ...instance,
      difficultySetting: DifficultySetting.hard,
    }));

    MockInstance(SpaceObjectContainerService, instance => ({
      ...instance,
      celestialBodies$: {value: [ineeda<SpaceObject>({toJson: () => 'test-planet'})]},
      crafts$: {value: [ineeda<SpaceObject>({toJson: () => 'test-craft'})]},
    } as any));

    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;
    let serviceAsAny = service as any;

    serviceAsAny.name = 'test-name';
    serviceAsAny.context = 'test-context';

    let state = service.state;
    expect(state).toEqual(objectContaining({
      name: 'test-name',
      timestamp: anything(),
      context: 'test-context',
      version: anything(),
      settings: objectContaining({
        difficulty: objectContaining({
          ...DifficultySetting.hard,
        }),
      }),
      celestialBodies: arrayContaining(['test-planet']),
      craft: arrayContaining(['test-craft']),
    }));
  });

  it('when name is undefined, get state should create a random name', () => {
    MockInstance(SetupService, instance => ({
      ...instance,
      difficultySetting: DifficultySetting.hard,
    }));

    MockInstance(SpaceObjectContainerService, instance => ({
      ...instance,
      celestialBodies$: {value: []},
      crafts$: {value: []},
    } as any));

    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;

    let state = service.state;
    expect(state.name).not.toBe(undefined);
    expect(state.name.length).toBeGreaterThan(5);
    expect(state.name).toBe((service as any).name);
  });

  it('stateRow should get a StateRow version of state', () => {
    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;

    spyOnProperty(service, 'state', 'get')
      .and.returnValue({
      name: 'test-name',
      timestamp: new Date(9000),
      version: [1, 2, 3],
    });

    let state = service.stateRow;
    expect(state).toEqual(objectContaining({
      name: 'test-name',
      timestamp: anything(),
      version: 'v1.2.3',
      state: '{"name":"test-name","timestamp":"1970-01-01T00:00:09.000Z","version":[1,2,3]}',
    }));
  });

  it('with no state, loadState() should return a stock state', () => {
    let spyDifficultySetting = MockInstance(SetupService, 'difficultySetting', createSpy(), 'set');
    let spyBuildStockState = MockInstance(SpaceObjectService, 'buildStockState', createSpy()
      .and.returnValue(EMPTY));

    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;
    let serviceAsAny = service as any;

    spyOnProperty(serviceAsAny, 'earlyState', 'get')
      .and.returnValue(EMPTY);

    service.loadState();

    expect(spyBuildStockState).toHaveBeenCalled();
    expect(serviceAsAny.name.length).toBeGreaterThan(3);
    expect(spyDifficultySetting).toHaveBeenCalled();
  });

  it('with state, loadState() should return a built State', () => {
    let spyDifficultySetting = MockInstance(SetupService, 'difficultySetting', createSpy(), 'set');
    let spyBuildState = MockInstance(SpaceObjectService, 'buildState', createSpy()
      .and.returnValue(EMPTY));

    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;
    let serviceAsAny = service as any;

    spyOnProperty(serviceAsAny, 'earlyState', 'get')
      .and.returnValue(EMPTY);
    spyOn(DifficultySetting, 'fromObject');

    let state = {
      name: 'test-name',
      settings: {
        difficulty: 'test-difficulty',
      },
    };
    service.loadState(JSON.stringify(state));

    expect(spyBuildState).toHaveBeenCalled();
    expect(serviceAsAny.name).toBe('test-name');
    expect(spyDifficultySetting).toHaveBeenCalled();
    expect(DifficultySetting.fromObject).toHaveBeenCalledWith('test-difficulty');
  });

  it('addStateToStore() should call dataService.write', () => {
    let spyWrite = MockInstance(DataService, 'write', createSpy());

    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;

    let state = {
      name: 'test-name',
      context: 'test-context',
      timestamp: 'test-timestamp',
      version: 'test-version',
    } as any;
    service.addStateToStore(state);

    expect(spyWrite).toHaveBeenCalledWith(
      'states',
      objectContaining({
        'test-name': {
          name: 'test-name',
          context: 'test-context',
          timestamp: 'test-timestamp',
          version: 'test-version',
          state: '{"name":"test-name","context":"test-context","timestamp":"test-timestamp","version":"test-version"}',
        },
      }),
      objectContaining({merge: true}));
  });

  it('removeStateFromStore() should call dataService.delete', async () => {
    let spyDelete = MockInstance(DataService, 'delete', createSpy()
      .and.returnValue(EMPTY.toPromise()));

    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;

    await service.removeStateFromStore('test-name');

    expect(spyDelete).toHaveBeenCalledWith('states', 'test-name');
  });

  it('removeStateFromStore() to call snackBar on error', async () => {
    MockInstance(DataService, 'delete', createSpy()
      .and.rejectWith(`it can't even 😭😢😥`));
    let spyOpen = MockInstance(MatSnackBar, 'open', createSpy());

    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;

    await expectAsync(service.removeStateFromStore('test-name'))
      .toBeRejectedWithError(`it can't even 😭😢😥`);
    expect(spyOpen).toHaveBeenCalled();
  });

  it('getStates() gets all states from dataService.readAll', () => {
    let spyReadAll = MockInstance(DataService, 'readAll', createSpy()
      .and.returnValue(EMPTY));

    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;

    service.getStates();
    expect(spyReadAll).toHaveBeenCalled();
  });

  it('getStatesInContext() gets sorted state matching current context', async () => {
    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;

    let testContext = 'test-context' as UsableRoutes;

    spyOn(service, 'getStates').and.returnValue(of([
      {
        name: 'test-name-a',
        context: testContext,
        timestamp: {seconds: 1},
      },
      {
        name: 'test-name-b',
        context: 'test-other-context',
        timestamp: {seconds: 2},
      },
      {
        name: 'test-name-c',
        context: testContext,
        timestamp: {seconds: 3},
      },
    ] as StateEntry[]));

    service.pageContext = testContext;

    let contextStates = await service.getStatesInContext().pipe(take(1)).toPromise();
    expect(contextStates).toEqual(arrayContaining([
      objectContaining({name: 'test-name-a'}),
      objectContaining({name: 'test-name-c'}),
    ]));
    let indexA = contextStates.findIndex(s => s.name === 'test-name-a');
    let indexB = contextStates.findIndex(s => s.name === 'test-name-c');
    expect(indexA).toBeGreaterThan(indexB);
  });

  it('importState() should loadState to promise', () => {
    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;

    spyOn(service, 'loadState').and.returnValue(EMPTY);

    service.importState('test-state');
    expect(service.loadState).toHaveBeenCalledWith('test-state');
    expect(service.importState('test-state') instanceof Promise).toBe(true);
  });

  it('saveState() should addStateToStore', () => {
    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;

    spyOn(service, 'addStateToStore');

    let stateRow = ineeda<StateRow>({
      toUpdatedStateGame: () => 'test-updated-state-game' as any,
    });
    service.saveState(stateRow);
    expect(service.addStateToStore).toHaveBeenCalledWith('test-updated-state-game' as any);
  });

  it('renameCurrentState() should rename current state name', () => {
    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;

    service.renameCurrentState('test-name');

    expect((service as any).name).toBe('test-name');
  });

  it('getTimelessState() should remove the timestamp from state', () => {
    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;

    let state = service.getTimestamplessState({
      name: 'test-name',
      timestamp: 'test-timestamp',
    } as any);

    expect(state.timestamp).toBe(undefined);
  });

  it('renameState() should add/removes states to rename a state', async () => {
    let spyOpen = MockInstance(MatSnackBar, 'open', createSpy());

    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;

    spyOn(service, 'addStateToStore').and.returnValue(Promise.resolve());
    spyOn(service, 'removeStateFromStore').and.returnValue(Promise.resolve());

    let state = ineeda<StateRow>({
      toUpdatedStateGame: () => void 0,
      name: 'test-name',
    });
    await service.renameState('test-old-name', state);

    expect(service.addStateToStore).toHaveBeenCalled();
    expect(service.removeStateFromStore).toHaveBeenCalled();
    expect(spyOpen).toHaveBeenCalled();
  });

  it('renameState() should add/removes states to rename a state', async () => {
    let spyOpen = MockInstance(MatSnackBar, 'open', createSpy());

    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;

    spyOn(service, 'addStateToStore').and.returnValue(Promise.reject('Error writing to firebase'));
    spyOn(service, 'removeStateFromStore').and.returnValue(Promise.resolve());

    let state = ineeda<StateRow>({
      toUpdatedStateGame: () => void 0,
      name: 'test-name',
    });
    await expectAsync(service.renameState('test-old-name', state)).toBeRejected();

    expect(service.addStateToStore).toHaveBeenCalled();
    expect(service.removeStateFromStore).not.toHaveBeenCalled();
    expect(spyOpen).toHaveBeenCalledWith(stringMatching('Could not rename'));
  });

});
