import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment';
import firebase from 'firebase/app';
import 'firebase/analytics';
import Analytics = firebase.analytics.Analytics;

class Category {
  static Tutorial = 'tutorial';
  static Craft = 'craft';
  static CelestialBody = 'celestialbody';
  static Privacy = 'privacy';
  static Account = 'account';
  static Credits = 'credits';
  static Coffee = 'coffee';
  static Feedback = 'feedback';
  static Difficulty = 'difficulty';
  static Route = 'route';
}

class Sanitize {

  static Anonymized = '** anonymized **';

  // todo: consider global replace instead of specific cases
  static anonymize(label: string): string {
    return Sanitize.stockWords.some(w => w.like(label))
      ? label
      : EventLogs.Sanitize.Anonymized;
  }

  private static stockWords = ['Kerbol', 'Moho', 'Eve', 'Gilly', 'Kerbin', 'Mun', 'Minmus', 'Duna', 'Ike', 'Dres', 'Jool', 'Laythe', 'Vall',
    'Tylo', 'Bop', 'Pol', 'Eeloo',
    'Communotron 16', 'Communotron 16-S', 'Communotron DTS-M1', 'Communotron HG-55', 'Communotron 88-88', 'HG-5 High Gain Antenna',
    'RA-2 Relay Antenna', 'RA-15 Relay Antenna', 'RA-100 Relay Antenna', 'Tracking Station 1', 'Tracking Station 2', 'Tracking Station 3',
    'Internal', 'Probodobodyne Experiment Control Station', 'Communotron Ground HG-48',
    'Untitled Space Craft',
  ];

}

export class EventLogs {
  static Category = Category;
  static Sanitize = Sanitize;
}

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {

  private analytics: Analytics;
  isTracking: boolean;

  constructor() {
    let optedOut = localStorage.getItem('user-opted-out-of-tracking');
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
    this.analytics.setAnalyticsCollectionEnabled(isTracking);
    this.isTracking = isTracking;
    localStorage.setItem('user-opted-out-of-tracking', (!isTracking).toString());
  }

  logEvent(name: string, details?: any) {
    let newDetails = {
      ...this.flattenObject(details),
      environment: environment.production ? 'prod' : 'dev',
    };
    this.analytics.logEvent(name, newDetails);
  }

  private flattenObject(object: {} | null, parentKey = '') {
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
