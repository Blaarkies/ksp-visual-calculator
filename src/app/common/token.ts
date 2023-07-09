import { InjectionToken } from '@angular/core';

export const USER_IDLE_TIME = new InjectionToken<number>('USER_IDLE_TIME', {
  providedIn: 'root',
  factory: () => 30e3,
});

export const AUTO_SAVE_INTERVAL = new InjectionToken<number>('AUTO_SAVE_INTERVAL', {
  providedIn: 'root',
  factory: () => 10e3,
});

