import { SmoothSetter } from './smooth-setter';
import { fakeAsync, tick } from '@angular/core/testing';

describe('SmoothSetter class', () => {

  let smoothSetter: SmoothSetter<number>;
  beforeEach(() => {
    smoothSetter = new SmoothSetter(42, 16, 2,
      (lerp, newValue, oldValue) => newValue.lerp(oldValue, lerp));
  });

  afterEach(() => {
    smoothSetter.destroy();
  });

  it('can get value', () => {
    expect(smoothSetter.value).toBe(42);
  });

  it('can set value', fakeAsync(() => {
    smoothSetter.set(50);

    tick();
    expect(smoothSetter.value).toBe(46);

    tick(16);
    expect(smoothSetter.value).toBe(50);
  }));

});
