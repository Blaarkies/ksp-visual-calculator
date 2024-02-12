import {
  delay,
  finalize,
  Subject,
} from 'rxjs';
import { Uid } from './uid';
import { WithDestroy } from './with-destroy';

describe('Uid class', () => {

  it('should return 20 char random string', () => {
    let id = Uid.new;

    expect(id.length).to.be.equal(20);
    expect(typeof id).to.be.equal('string');
  });

  it('should return unique string', () => {
    let id1 = Uid.new;
    let id2 = Uid.new;

    expect(id1).not.to.be.equal(id2);
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
    expect(typeof testWithDestroy.destroy$).to.be.equal('object');
    expect(testWithDestroy.destroy$ instanceof Subject).to.be.true;
    expect(testWithDestroy.ngOnDestroy).to.be.not.undefined;
  });

  it('ngOnDestroy() should trigger destroy$', (done) => {
    let didNext = false;
    let didFinalize = false;

    testWithDestroy.destroy$
      .pipe(finalize(() => didFinalize = true))
      .subscribe(() => didNext = true);

    expect(didNext).to.be.false;
    expect(didFinalize).to.be.false;

    testWithDestroy.destroy$.pipe(
      delay(0))
      .subscribe(() => {
        expect(didNext).to.be.true;
        expect(didFinalize).to.be.true;
        done();
      });

    testWithDestroy.ngOnDestroy();
  });
});
