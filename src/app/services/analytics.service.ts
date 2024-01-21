import { Injectable } from '@angular/core';
import {
  Analytics,
  logEvent,
  setAnalyticsCollectionEnabled,
} from '@angular/fire/analytics';
import { environment } from '../../environments/environment';
import {
  AnalyticsEventName,
  EventLogs,
} from './domain/event-logs';
import { ThrottledEvents } from './domain/throttled-events';
import { LocalStorageService } from './local-storage.service';

@Injectable({providedIn: 'root'})
export class AnalyticsService {

  isTracking: boolean;
  private throttledEvents = new ThrottledEvents(this);

  private isProd = environment.production;

  constructor(private localStorageService: LocalStorageService,
              private analytics: Analytics) {
    let optedOut = localStorageService.hasDoNotTrack();
    if (optedOut || !this.isProd) {
      this.isTracking = false;
      return;
    }

    this.isTracking = true;
  }

  setActive(isTracking: boolean) {
    this.logEvent(`Set tracking ${isTracking.toString('on')}`,
      {category: EventLogs.Category.Privacy});
    setTimeout(() => {
      // Wait for previous event to finish sending before turning off
      setAnalyticsCollectionEnabled(this.analytics, isTracking);
      this.isTracking = isTracking;
      this.localStorageService.setDoNotTrack(!isTracking);
    });
  }

  logEvent(name: string, details?: any) {
    if (!this.isTracking) {
      return;
    }

    let newDetails = {
      ...this.flattenObject(details),
      environment: this.isProd ? 'prod' : 'dev',
    };
    newDetails.environment === 'prod'
      ? logEvent(this.analytics, name, newDetails)
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
