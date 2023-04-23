import { InjectionToken } from '@angular/core';

export const AUTO_SAVE_INTERVAL = new InjectionToken<number>('AUTO_SAVE_INTERVAL', {
  providedIn: 'root',
  factory: () => 10e3,
});
