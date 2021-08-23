import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import firebase from 'firebase/app';
import 'firebase/analytics';
import { EventLogs } from './event-logs';
import Analytics = firebase.analytics.Analytics;

let localStorageKeys = {
  doNotTrack: 'ksp-commnet-planner-user-opted-out-of-tracking',
};

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {

  private analytics: Analytics;
  isTracking: boolean;

  constructor() {
    let optedOut = localStorage.getItem(localStorageKeys.doNotTrack);
    if (optedOut?.toBoolean()) {
      this.isTracking = false;
      this.analytics = {
        isMockAnalytics: true,
        setAnalyticsCollectionEnabled: () => void 0,
        logEvent: (eventName, eventParams) => void 0,
      } as any as Analytics;
      return;
    }

    this.setupAnalytics();
  }

  private setupAnalytics() {
    firebase.apps.length
      ? firebase.app()
      : firebase.initializeApp(environment.firebase);

    this.analytics = firebase.analytics();
    this.isTracking = true;
  }

  setActive(isTracking: boolean) {
    if ((this.analytics as any).isMockAnalytics) {
      this.setupAnalytics();
    }

    this.logEvent(`Set tracking ${isTracking.toString('on')}`, {category: EventLogs.Category.Privacy});
    setTimeout(() => {
      // Wait for previous event to finish sending before turning off
      this.analytics.setAnalyticsCollectionEnabled(isTracking);
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
      ? this.analytics.logEvent(name, newDetails)
      // tslint:disable-next-line:no-console
      : console.info('%c analytics.logEvent()', 'color: #9ff',
        name, newDetails);
  }

  private flattenObject(object: {} | null, parentKey = ''): {} {
    const keyPrefix = parentKey ? parentKey + '_' : '';
    return !object // don't traverse null values
      ? object
      : Object.entries(object)
        .reduce((sum, [key, value]) => {
          return (typeof value === 'object')
            ? {
              ...sum,
              ...this.flattenObject(value, key),
            }
            : {
              ...sum,
              [keyPrefix + key]: value,
            };
        }, {});
  }

}
