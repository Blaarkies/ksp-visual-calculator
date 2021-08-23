import { AnalyticsService } from './analytics.service';
import { fakeAsync, flush, tick } from '@angular/core/testing';
import { environment } from 'src/environments/environment';
import { MockBuilder, MockRender } from 'ng-mocks';
import { AppModule } from '../app.module';
import anything = jasmine.anything;
import objectContaining = jasmine.objectContaining;

let serviceType = AnalyticsService;
describe('AnalyticsService', () => {

  let lastProdValue = environment.production;
  afterAll(() => {
    environment.production = lastProdValue;
  });

  beforeEach(() => MockBuilder(serviceType).mock(AppModule));

  it('should be created', () => {
    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;
    expect(service).toBeDefined();
  });

  it('when opted out of tracking, constructor() should not setupAnalytics()', () => {
    spyOn(localStorage, 'getItem').and.returnValue(true.toString());

    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;

    expect(service.isTracking).toBe(false);
    expect((service as any).analytics.isMockAnalytics).toBe(true);
  });

  it('when opted in for tracking, constructor() should setupAnalytics()', () => {
    spyOn(localStorage, 'getItem').and.returnValue(false.toString());

    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;

    expect(service.isTracking).toBe(true);
    expect((service as any).analytics.isMockAnalytics).toBeFalsy();
  });

  it('setActive(true) should turn ON tracking, ', fakeAsync(() => {
    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;
    let serviceAsAny = service as any;

    spyOn(service, 'logEvent');
    spyOn(serviceAsAny.analytics, 'setAnalyticsCollectionEnabled');
    spyOn(localStorage, 'setItem');

    service.setActive(true);

    expect(service.logEvent).toHaveBeenCalled();

    tick();
    expect(serviceAsAny.analytics.setAnalyticsCollectionEnabled).toHaveBeenCalledWith(true);
    expect(service.isTracking).toBe(true);
    expect(localStorage.setItem).toHaveBeenCalledWith(anything(), false.toString());
    flush();
  }));

  it('setActive(false) should turn OFF tracking, ', fakeAsync(() => {
    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;
    let serviceAsAny = service as any;

    spyOn(service, 'logEvent');
    spyOn(serviceAsAny.analytics, 'setAnalyticsCollectionEnabled');
    spyOn(localStorage, 'setItem');

    service.setActive(false);

    expect(service.logEvent).toHaveBeenCalled();

    tick();
    expect(serviceAsAny.analytics.setAnalyticsCollectionEnabled).toHaveBeenCalledWith(false);
    expect(service.isTracking).toBe(false);
    expect(localStorage.setItem).toHaveBeenCalledWith(anything(), true.toString());
    flush();
  }));

  it('when in PROD, logEvent() should call analytics.logEvent', () => {
    environment.production = true;
    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;
    let serviceAsAny = service as any;

    spyOn(serviceAsAny.analytics, 'logEvent');

    service.logEvent('test-name', {detail: 'test-detail'});

    expect(serviceAsAny.analytics.logEvent).toHaveBeenCalledWith(
      'test-name', objectContaining({
        detail: 'test-detail',
        environment: 'prod',
      }),
    );
  });

  it('when in DEV, logEvent() should log to console', () => {
    environment.production = false;
    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;
    let serviceAsAny = service as any;

    spyOn(serviceAsAny.analytics, 'logEvent');
    spyOn(console, 'info');

    service.logEvent('test-name', {detail: 'test-detail'});

    expect(serviceAsAny.analytics.logEvent).not.toHaveBeenCalled();
    // tslint:disable-next-line:no-console
    expect(console.info).toHaveBeenCalledWith(
      anything(),
      anything(),
      'test-name',
      objectContaining({
        detail: 'test-detail',
        environment: 'dev',
      }),
    );
  });

  it('flattenObject() should flatten nested objects', () => {
    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;
    let serviceAsAny = service as any;

    let nestedObject = {
      kerbol: {
        kerbin: {
          mun: 'gray',
          minmus: 'mint',
        },
      },
      space: 'kerbal dreams are made of this stuff',
    };

    let flatObject = serviceAsAny.flattenObject(nestedObject);

    expect(flatObject.kerbol?.kerbin?.mun).toBeUndefined();
    expect(flatObject).toEqual({
      kerbin_mun: 'gray',
      kerbin_minmus: 'mint',
      space: 'kerbal dreams are made of this stuff',
    });
  });

});
