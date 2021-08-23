import { SpaceObjectContainerService } from './space-object-container.service';
import { MockBuilder, MockRender } from 'ng-mocks';
import { AppModule } from '../app.module';
import { SpaceObject } from '../common/domain/space-objects/space-object';
import { ineeda } from 'ineeda';
import { Vector2 } from '../common/domain/vector2';

let serviceType = SpaceObjectContainerService;
describe('SpaceObjectContainerService', () => {

  beforeEach(() => MockBuilder(serviceType).mock(AppModule));

  it('should be created', () => {
    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;
    expect(service).toBeDefined();
  });

  it('constructor() should setup instance', () => {
    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;

    expect(SpaceObjectContainerService.instance).toBe(service);
  });

  describe('getSoiParent()', () => {
    // disclaimer: Tests on moons with SOI greater than their orbit's periapsis
    // are not considered since it does not occur in stock KSP.

    let star = ineeda<SpaceObject>({
      label: 'test-star',
      sphereOfInfluence: undefined,
      location: new Vector2(0, 0),
    });

    let planet = ineeda<SpaceObject>({
      label: 'test-planet',
      sphereOfInfluence: 100,
      location: new Vector2(200, 0),
    });

    let moon = ineeda<SpaceObject>({
      label: 'test-moon',
      sphereOfInfluence: 50,
      location: new Vector2(250, 0),
    });

    it('when no SOI overlaps location, select the Star', () => {
      let fixture = MockRender(serviceType);
      let service = fixture.point.componentInstance;
      service.celestialBodies$.next([star, planet, moon]);

      let parent = service.getSoiParent(new Vector2(500, 0));
      expect(parent.label).toBe(star.label);
    });

    it('when planet SOI overlaps location, select the Planet', () => {
      let fixture = MockRender(serviceType);
      let service = fixture.point.componentInstance;
      service.celestialBodies$.next([star, planet, moon]);

      let parent = service.getSoiParent(new Vector2(101, 0));
      expect(parent.label).toBe(planet.label);
    });

    it('when moon SOI overlaps location, select the Moon', () => {
      let fixture = MockRender(serviceType);
      let service = fixture.point.componentInstance;
      service.celestialBodies$.next([star, planet, moon]);

      let parent = service.getSoiParent(new Vector2(201, 0));
      expect(parent.label).toBe(planet.label);
    });

  });

});
