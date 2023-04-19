import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import {
  AnalyticsEventName,
  EventLogs,
} from './domain/event-logs';
import { ThrottledEvents } from './domain/throttled-events';

let localStorageKeys = {
  doNotTrack: 'ksp-visual-calculator-user-opted-out-of-tracking',
};

@Injectable({providedIn: 'root'})
export class AnalyticsService {

  isTracking: boolean;
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
    this.isTracking = true;
  }

  setActive(isTracking: boolean) {
    if (this.isTracking === false) {
      this.setupAnalytics();
    }

    this.logEvent(`Set tracking ${isTracking.toString('on')}`, {category: EventLogs.Category.Privacy});
    setTimeout(() => {
      // Wait for previous event to finish sending before turning off
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
      ? undefined
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
