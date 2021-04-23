import { OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

type Constructor<T> = new(...args: any[]) => T;

export function WithDestroy<T extends Constructor<{}>>(Base: T = (class {
} as any)) {

  return class extends Base implements OnDestroy {
    destroy$ = new Subject();

    ngOnDestroy() {
      this.destroy$.next();
      this.destroy$.complete();
    }
  };

}
