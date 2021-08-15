import { AnalyticsService } from './analytics.service';
import { fakeAsync, tick } from '@angular/core/testing';
import { environment } from 'src/environments/environment';
import anything = jasmine.anything;
import objectContaining = jasmine.objectContaining;

describe('AnalyticsService', () => {

  let lastProdValue = environment.production;
  afterAll(() => {
    environment.production = lastProdValue;
  });

  describe('constructor()', () => {

    it('should be created', () => {
      let service = new AnalyticsService();
      expect(service).toBeTruthy();
    });

    it('when opted out of tracking, constructor() should not setupAnalytics()', () => {
      spyOn(localStorage, 'getItem').and.returnValue(true.toString());

      let service = new AnalyticsService();

      expect(service.isTracking).toBe(false);
      expect((service as any).analytics.isMockAnalytics).toBe(true);
    });

    it('when opted in for tracking, constructor() should setupAnalytics()', () => {
      spyOn(localStorage, 'getItem').and.returnValue(false.toString());

      let service = new AnalyticsService();

      expect(service.isTracking).toBe(true);
      expect((service as any).analytics.isMockAnalytics).toBeFalsy();
    });
  });

  describe('after constructor()', () => {

    let service: AnalyticsService;
    let serviceAsAny: any;
    beforeEach(() => {
      service = new AnalyticsService();
      serviceAsAny = service as any;
    });

    it('setActive(true) should turn ON tracking, ', fakeAsync(() => {
      spyOn(service, 'logEvent');
      spyOn(serviceAsAny.analytics, 'setAnalyticsCollectionEnabled');
      spyOn(localStorage, 'setItem');

      service.setActive(true);

      expect(service.logEvent).toHaveBeenCalled();

      tick();
      expect(serviceAsAny.analytics.setAnalyticsCollectionEnabled).toHaveBeenCalledWith(true);
      expect(service.isTracking).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith(anything(), false.toString());
    }));

    it('setActive(false) should turn OFF tracking, ', fakeAsync(() => {
      spyOn(service, 'logEvent');
      spyOn(serviceAsAny.analytics, 'setAnalyticsCollectionEnabled');
      spyOn(localStorage, 'setItem');

      service.setActive(false);

      expect(service.logEvent).toHaveBeenCalled();

      tick();
      expect(serviceAsAny.analytics.setAnalyticsCollectionEnabled).toHaveBeenCalledWith(false);
      expect(service.isTracking).toBe(false);
      expect(localStorage.setItem).toHaveBeenCalledWith(anything(), true.toString());
    }));

    it('when in PROD, logEvent() should call analytics.logEvent', () => {
      environment.production = true;

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

      spyOn(serviceAsAny.analytics, 'logEvent');
      spyOn(console, 'info');

      service.logEvent('test-name', {detail: 'test-detail'});

      expect(serviceAsAny.analytics.logEvent).not.toHaveBeenCalled();
      expect(console.info).toHaveBeenCalledWith(
        anything(),
        'test-name',
        objectContaining({
          detail: 'test-detail',
          environment: 'dev',
        }),
        anything(),
      );
    });

    it('flattenObject() should flatten nested objects', () => {
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

});
