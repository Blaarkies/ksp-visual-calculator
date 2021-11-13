import { SpaceObjectService } from './space-object.service';
import { MockBuilder, MockInstance, MockRender } from 'ng-mocks';
import { AppModule } from '../app.module';
import { SetupService } from './setup.service';
import { BehaviorSubject, interval, of } from 'rxjs';
import { SpaceObjectContainerService } from './space-object-container.service';
import { SpaceObject } from '../common/domain/space-objects/space-object';
import { Craft } from '../common/domain/space-objects/craft';
import { Orbit } from '../common/domain/space-objects/orbit';
import { ineeda } from 'ineeda';
import { Antenna } from '../common/domain/antenna';
import * as savegameJson from 'src/test-resources/ksp-cp-savegame.json';
import { Group } from '../common/domain/group';
import { Vector2 } from '../common/domain/vector2';
import { DifficultySetting } from '../overlays/difficulty-settings-dialog/difficulty-setting';
import { CraftType } from '../common/domain/space-objects/craft-type';
import { SpaceObjectType } from '../common/domain/space-objects/space-object-type';
import { CameraService } from './camera.service';
import { CelestialBodyDetails } from '../overlays/celestial-body-details-dialog/celestial-body-details';
import { CraftDetails } from '../overlays/craft-details-dialog/craft-details';
import { Draggable } from '../common/domain/space-objects/draggable';
import { filter, take } from 'rxjs/operators';
import { UsableRoutes } from '../usable-routes';
import arrayContaining = jasmine.arrayContaining;
import objectContaining = jasmine.objectContaining;
import createSpy = jasmine.createSpy;
import anything = jasmine.anything;

let serviceType = SpaceObjectService;
describe('SpaceObjectService', () => {

  beforeAll(async () =>
    await interval(10).pipe(
      filter(() => (savegameJson as any).default),
      take(1))
      .toPromise());

  beforeEach(() => MockBuilder(serviceType)
    .mock(SetupService, {
      stockPlanets$: of({listOrbits: [], celestialBodies: []}),
      availableAntennae$: of([]),
      difficultySetting: DifficultySetting.normal,
    } as any)
    .mock(SpaceObjectContainerService, {
      celestialBodies$: new BehaviorSubject<SpaceObject[]>(null),
      crafts$: new BehaviorSubject<Craft[]>(null),
    })
    .mock(AppModule));

  it('should be created', () => {
    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;
    expect(service).toBeDefined();
  });

  // items include: orbits$ & celestialBodies$ & crafts$ & transmissionLines$
  it('buildStockState() should setup universe items', async () => {
    let listOrbits = [ineeda<Orbit>({color: 'test-orbit'})];
    let celestialBodies = [ineeda<SpaceObject>({label: 'test-space-object', hasDsn: false})];
    let antennae = [ineeda<Antenna>({label: 'test-antenna'})];

    MockInstance(SetupService, instance => {
      instance.stockPlanets$ = of({listOrbits, celestialBodies});
      instance.availableAntennae$ = of(antennae) as any;
      return instance;
    });

    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;

    service.celestialBodies$ = new BehaviorSubject<SpaceObject[]>(null);
    service.crafts$ = new BehaviorSubject<Craft[]>(null);
    await service.buildStockState(UsableRoutes.SignalCheck).toPromise();

    expect(service.orbits$.value.length).toBe(1);
    expect(service.celestialBodies$.value.length).toBe(1);
    expect(service.crafts$.value.length).toBe(0);
    expect(service.transmissionLines$.value.length).toBe(0);
  });

  it('buildStockState() should setup basic Tracking Station on the hasDsn planet', async () => {
    let listOrbits = [ineeda<Orbit>({color: 'test-orbit'})];
    let celestialBodies = [
      ineeda<SpaceObject>({
        label: 'test-space-object-a',
        hasDsn: true,
        antennae: [],
      }),
      ineeda<SpaceObject>({
        label: 'test-space-object-b',
        hasDsn: false,
      }),
    ];
    let antennae = [ineeda<Antenna>({label: 'Tracking Station 1'})];

    MockInstance(SetupService, instance => {
      instance.stockPlanets$ = of({listOrbits, celestialBodies});
      instance.availableAntennae$ = of(antennae) as any;
      return instance;
    });

    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;

    service.celestialBodies$ = new BehaviorSubject<SpaceObject[]>(null);
    service.crafts$ = new BehaviorSubject<Craft[]>(null);
    await service.buildStockState(UsableRoutes.SignalCheck).toPromise();

    let planets = service.celestialBodies$.value;
    let groundStationPlanet = planets.find(p => p.hasDsn);
    let barePlanet = planets.find(p => !p.hasDsn);

    expect(groundStationPlanet.label).toBe('test-space-object-a');
    expect(groundStationPlanet.antennae.length).toBe(1);

    expect(barePlanet.label).toBe('test-space-object-b');
    expect(barePlanet.antennae.length).toBe(0);
  });

  it('buildState() should setup universe items from existing state', async () => {
    let listOrbits = [];
    let celestialBodies = [];
    let antennae = [ineeda<Antenna>({label: 'Tracking Station 1'})];

    MockInstance(SetupService, instance => {
      instance.stockPlanets$ = of({listOrbits, celestialBodies});
      instance.availableAntennae$ = of(antennae) as any;
      instance.getAntenna = name => ineeda<Antenna>({label: name});
      return instance;
    });

    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;

    spyOn(service, 'updateTransmissionLines');

    let lastStateString = JSON.stringify((savegameJson as any).default);
    service.celestialBodies$ = new BehaviorSubject<SpaceObject[]>(null);
    service.crafts$ = new BehaviorSubject<Craft[]>(null);
    await service.buildState(lastStateString, UsableRoutes.SignalCheck).toPromise();

    let orbitsResult = service.orbits$.value;
    let celestialBodiesResult = service.celestialBodies$.value;
    let craftsResult = service.crafts$.value;

    expect(orbitsResult.length).toBe(16);
    expect(orbitsResult).toEqual(arrayContaining([
      objectContaining({
        parameters: objectContaining({
          xy: arrayContaining([0, 0]),
          r: 9832684544,
        }),
        type: objectContaining({name: 'planet'}),
      }),
      objectContaining({
        parameters: objectContaining({
          xy: arrayContaining([8759060060.811953,
            -4467723379.183787]),
          r: 31500000,
        }),
        type: objectContaining({name: 'moon'}),
      }),
    ]));

    expect(celestialBodiesResult.length).toBe(17);
    expect(celestialBodiesResult).toEqual(arrayContaining([
      objectContaining({
        size: 100,
        type: objectContaining({name: 'star'}),
        label: 'Kerbol',
      }),
    ]));

    expect(craftsResult.length).toBe(3);
    expect(craftsResult).toEqual(arrayContaining([
      objectContaining({
        size: 30,
        type: objectContaining({name: 'craft'}),
        label: 'Untitled Space Craft',
      }),
    ]));

  });

  it('updateTransmissionLines() should update transmissionLines$', () => {
    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;
    service.celestialBodies$ = new BehaviorSubject<SpaceObject[]>(null);
    service.crafts$ = new BehaviorSubject<Craft[]>(null);

    let antennae = [
      new Group(ineeda<Antenna>({
        powerRating: 9000,
      }))];

    service.celestialBodies$.next([
      ineeda<SpaceObject>({
        location: new Vector2(0, 0),
        antennae,
        powerRatingTotal: 9000,
      }),
    ]);
    service.crafts$.next([
      ineeda<Craft>({
        location: new Vector2(10, 0),
        antennae,
        powerRatingTotal: 9000,
      }),
      ineeda<Craft>({
        location: new Vector2(0, 10),
        antennae,
        powerRatingTotal: 9000,
      }),
    ]);
    service.transmissionLines$.next([]);

    service.updateTransmissionLines();

    let lines = service.transmissionLines$.value;
    expect(lines.length).toBe(3);
    let distinctParticipants = lines.map(l => l.nodes)
      .flatMap()
      .distinct();
    expect(distinctParticipants.length).toBe(3);

    // test: it does not overwrite existing lines
    let oldLines = lines;
    service.crafts$.next([
      ...service.crafts$.value,
      ineeda<Craft>({
        location: new Vector2(10, 0),
        antennae,
        powerRatingTotal: 9000,
      }),
    ]);

    service.updateTransmissionLines();
    lines = service.transmissionLines$.value;
    let newLines = lines.except(oldLines);
    expect(lines.length).toBe(6);
    expect(newLines.length).toBe(3);
  });

  it('addCraftToUniverse() should add new craft to universe', () => {
    MockInstance(CameraService, instance => ({
      ...instance,
      scale: 1,
      location: new Vector2(960, 540),
      screenCenterOffset: new Vector2(400, 200),
    }));
    MockInstance(SpaceObjectContainerService, instance => ({
      ...instance,
      getSoiParent: () => ({
        draggableHandle: {
          location: new Vector2(0, 0),
          addChild: createSpy(),
        },
      }),
    } as any));

    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;

    spyOn(service, 'updateTransmissionLines');
    service.crafts$.next([]);

    let craftName = 'test-name';
    service.addCraftToUniverse({
      name: craftName,
      craftType: CraftType.Probe,
      antennae: [new Group(ineeda<Antenna>())],
      // advancedPlacement: '',
    });

    let newCraft = service.crafts$.value[0];
    expect(newCraft.label).toBe(craftName);
    expect(newCraft.type).toBe(SpaceObjectType.Craft);
    expect(newCraft.location).toEqual(objectContaining(
      {x: -560, y: -340}));
  });

  it('editCelestialBody() modifies and existing body with details', () => {
    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;

    let existingBody = new SpaceObject(
      10,
      'test-name-old',
      '',
      'orbital',
      SpaceObjectType.Moon);
    existingBody.draggableHandle.addOrbit(
      new Orbit({} as any, 'test-color-old'));

    let modifications = new CelestialBodyDetails(
      'test-name',
      SpaceObjectType.Planet,
      42,
      'test-color',
      ineeda<Antenna>({label: 'test-name'}));

    service.editCelestialBody(existingBody, modifications);

    expect(existingBody.size).toBe(42);
    expect(existingBody.label).toBe('test-name');
    expect(existingBody.type).toBe(SpaceObjectType.Planet);
    expect(existingBody.antennae[0].item.label).toBe('test-name');
    expect(existingBody.draggableHandle.orbit.color).toBe('test-color');
  });

  it('editCraft() modifies and existing craft with details', () => {
    MockInstance(SpaceObjectContainerService, instance => ({
      ...instance,
      getSoiParent: () => ({
        draggableHandle: {
          location: new Vector2(0, 0),
          replaceChild: createSpy(),
        },
      }),
    } as any));

    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;

    let existingCraft = new Craft(
      'test-name-old',
      CraftType.Probe,
      []);

    let modifications = new CraftDetails(
      'test-name',
      CraftType.Debris,
      [new Group(ineeda<Antenna>({label: 'test-name'}))]);

    service.crafts$.next([existingCraft]);
    spyOn(service, 'updateTransmissionLines');

    service.editCraft(existingCraft, modifications);
    let sameCraftButEdited = service.crafts$.value[0];

    expect(sameCraftButEdited.label).toBe('test-name');
    expect(sameCraftButEdited.craftType).toBe(CraftType.Debris);
    expect(sameCraftButEdited.antennae[0].item.label).toBe('test-name');
  });

  it('editCraft() with location change, updates SOI parent', () => {
    let spyReplaceChild = createSpy();
    MockInstance(SpaceObjectContainerService, instance => ({
      ...instance,
      getSoiParent: () => ({
        draggableHandle: {
          location: new Vector2(0, 0),
          replaceChild: spyReplaceChild,
        },
      }),
    } as any));

    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;

    let existingCraft = new Craft('test-name-old', CraftType.Probe, []);
    let modifications = new CraftDetails('test-name', CraftType.Debris, [new Group(ineeda<Antenna>({label: 'test-name'}))]);

    spyOn(service, 'updateTransmissionLines');
    service.crafts$.next([existingCraft]);

    service.editCraft(existingCraft, modifications);

    expect(spyReplaceChild).toHaveBeenCalledWith(
      anything(),
      objectContaining({
        label: 'test-name',
      }));
  });

  it('removeCraft() removes specific craft from list', () => {
    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;
    service.celestialBodies$ = new BehaviorSubject<SpaceObject[]>(null);
    service.crafts$ = new BehaviorSubject<Craft[]>(null);

    let removedCraft = new Craft('test-name-remove', CraftType.Probe, []);
    let innocentCraft = new Craft('test-name-innocent', CraftType.Debris, []);

    let spyRemoveChild = createSpy();
    let planetDraggable = ineeda<Draggable>({
      location: new Vector2(0, 0),
      removeChild: spyRemoveChild,
    });
    removedCraft.draggableHandle.parent = planetDraggable;

    spyOn(service, 'updateTransmissionLines');
    service.crafts$.next([removedCraft, innocentCraft]);

    service.removeCraft(removedCraft);

    let craftList = service.crafts$.value;
    expect(spyRemoveChild).toHaveBeenCalledWith(removedCraft.draggableHandle);
    expect(craftList.length).toBe(1);
    expect(craftList.find(c => c.label === 'test-name-remove')).toBe(undefined);
    expect(craftList[0].label).toBe('test-name-innocent');
  });

});
