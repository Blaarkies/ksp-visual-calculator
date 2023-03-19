import { set } from '@angular/fire/database';
import {
  BehaviorSubject,
  Observable,
  skip,
  take,
  takeUntil,
} from 'rxjs';

interface Config<T> {
  defaultValue?: T;
  defaultValue$?: Observable<T>;
}

export class SubjectHandle<T> {

  get value(): T {
    return this.subject$.value;
  }

  stream$: Observable<T>;

  private subject$: BehaviorSubject<T>;

  constructor({defaultValue, defaultValue$}: Config<T> = {}) {
    let defaultProvided = defaultValue !== undefined;
    this.subject$ = new BehaviorSubject<T>(defaultProvided ? defaultValue : null);
    this.stream$ = this.subject$.pipe(skip(defaultProvided ? 0 : 1));

    if (defaultValue$) {
      defaultValue$
        .pipe(take(1), takeUntil(this.subject$))
        .subscribe(value => this.subject$.next(value));
    }
  }

  set(value?: T | ((v: T) => T)) {
    if (typeof value === 'function') {
      let callback = value as Function;
      this.subject$.next(callback(this.value));
    } else {
      this.subject$.next(value);
    }
  }

  destroy() {
    this.subject$.complete();
  }

}
