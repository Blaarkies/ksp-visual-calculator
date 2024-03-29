import {
  Subject,
  throttleTime,
} from 'rxjs';
import { AnalyticsService } from '../analytics.service';
import { AnalyticsEventName } from './event-logs';

export class ThrottledEvents {

  private eventMap = new Map<AnalyticsEventName, Subject<unknown>>();

  constructor(private analyticsService: AnalyticsService) {
  }

  addEvent(eventName: AnalyticsEventName, details: unknown, duration: number) {
    let event$ = this.eventMap.get(eventName);
    if (!event$) {
      let subject$ = new Subject<unknown>();
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
