import { Uid } from './uid';
import { WithDestroy } from './with-destroy';
import { finalize, Subject } from 'rxjs';
import { fakeAsync } from '@angular/core/testing';

describe('Uid class', () => {

  describe('static new', () => {

    it('should return 17 char random string', () => {
      let id = Uid.new;

      expect(id.length).toBe(17);
      expect(typeof id).toBe('string');
    });

    it('should return unique string', () => {
      let id1 = Uid.new;
      let id2 = Uid.new;

      expect(id1).not.toBe(id2);
    });
  });
});

describe('WithDestroy function', () => {

  class TestWithDestroy extends WithDestroy() {
  }

  let testWithDestroy: TestWithDestroy;
  beforeEach(() => {
    testWithDestroy = new TestWithDestroy();
  });

  afterEach(() => {
    testWithDestroy.ngOnDestroy();
  });

  it('constructed class should contain destroy$ & ngOnDestroy()', () => {
    expect(typeof testWithDestroy.destroy$).toBe('object');
    expect(testWithDestroy.destroy$ instanceof Subject).toBeTrue();
    expect(testWithDestroy.ngOnDestroy).toBeDefined();
  });

  it('ngOnDestroy() should trigger destroy$', fakeAsync(() => {
    let didNext = false;
    let didFinalize = false;

    testWithDestroy.destroy$
      .pipe(finalize(() => didFinalize = true))
      .subscribe(() => didNext = true);

    expect(didNext).toBeFalse();
    expect(didFinalize).toBeFalse();

    testWithDestroy.ngOnDestroy();

    expect(didNext).toBeTrue();
    expect(didFinalize).toBeTrue();
  }));
});
