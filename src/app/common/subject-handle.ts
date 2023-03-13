import {
  BehaviorSubject,
  Observable,
  skip,
} from 'rxjs';

export class SubjectHandle<T> {

  get value(): T {
    return this.subject$.value;
  }

  stream$: Observable<T>;

  private subject$: BehaviorSubject<T>;

  constructor() {
    this.subject$ = new BehaviorSubject<T>(null);
    this.stream$ = this.subject$.pipe(skip(1));
  }

  set(value?: T | ((v: T) => T)) {
    if (typeof value === 'function') {
      let callback = value as Function;
      this.subject$.next(callback(this.value));
    } else {
      this.subject$.next(value);
    }
  }

}
