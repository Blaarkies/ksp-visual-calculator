import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AnalyticsEventName, EventLogs } from './event-logs';
import { Subject } from 'rxjs';
import { throttleTime } from 'rxjs/operators';
import { getApp } from '@angular/fire/app';
import { Analytics, initializeAnalytics, logEvent, setAnalyticsCollectionEnabled } from '@angular/fire/analytics';

let localStorageKeys = {
  doNotTrack: 'ksp-visual-calculator-user-opted-out-of-tracking',
};

class ThrottledEvents {

  private eventMap = new Map<AnalyticsEventName, Subject<any>>();

  constructor(private analyticsService: AnalyticsService) {
  }

  addEvent(eventName: AnalyticsEventName, details: any, duration: number) {
    let event$ = this.eventMap.get(eventName);
    if (!event$) {
      let subject$ = new Subject<any>();
      this.eventMap.set(eventName, subject$);
      subject$
        .pipe(throttleTime(duration))
        .subscribe(payload => this.analyticsService.logEvent(eventName.toString(), payload));
      subject$.next(details);
      return;
    }

    event$.next(details);
  }

  destroy() {
    this.eventMap.forEach(value => value.complete());
  }

}

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {

  isTracking: boolean;
  private analyticsInstance: Analytics;
  private throttledEvents = new ThrottledEvents(this);

  constructor() {
    let optedOut = localStorage.getItem(localStorageKeys.doNotTrack);
    if (optedOut?.toBoolean()) {
      this.isTracking = false;
      return;
    }

    this.setupAnalytics();
  }

  private setupAnalytics() {
    this.analyticsInstance = initializeAnalytics(getApp());
    this.isTracking = true;
  }

  setActive(isTracking: boolean) {
    if (this.isTracking === false) {
      this.setupAnalytics();
    }

    this.logEvent(`Set tracking ${isTracking.toString('on')}`, {category: EventLogs.Category.Privacy});
    setTimeout(() => {
      // Wait for previous event to finish sending before turning off
      setAnalyticsCollectionEnabled(this.analyticsInstance, isTracking);
      this.isTracking = isTracking;
      localStorage.setItem(localStorageKeys.doNotTrack, (!isTracking).toString());
    });
  }

  logEvent(name: string, details?: any) {
    let newDetails = {
      ...this.flattenObject(details),
      environment: environment.production ? 'prod' : 'dev',
    };
    newDetails.environment === 'prod'
      ? logEvent(this.analyticsInstance, name, newDetails)
      // tslint:disable-next-line:no-console
      : console.info('%c analytics.logEvent()', 'color: #9ff',
        name, newDetails);
  }

  private flattenObject(object: {} | null, parentKey = ''): {} {
    const keyPrefix = parentKey ? parentKey + '_' : '';
    return !object // don't traverse null values
      ? object
      : Object.entries(object)
        .reduce((sum, [key, value]) => (typeof value === 'object')
          ? {
            ...sum,
            ...this.flattenObject(value, key),
          }
          : {
            ...sum,
            [keyPrefix + key]: value,
          }, {});
  }

  logEventThrottled(eventName: AnalyticsEventName, details: any, throttleDuration: number = 60e3) {
    this.throttledEvents.addEvent(eventName, details, throttleDuration);
  }

  destroy() {
    this.throttledEvents.destroy();
  }

}
