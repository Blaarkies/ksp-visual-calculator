import { MockBuilder, MockInstance, MockRender } from 'ng-mocks';
import { AppModule } from '../app.module';
import { AuthService } from './auth.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { of } from 'rxjs';
import { DataService } from './data.service';
import { fakeAsync, tick } from '@angular/core/testing';
import { StateService } from './state.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import createSpy = jasmine.createSpy;
import objectContaining = jasmine.objectContaining;

let serviceType = AuthService;
describe('AuthService', () => {

  beforeEach(() => MockBuilder(serviceType)
    .mock(AngularFireAuth, {authState: of({}) as any})
    .mock(DataService, {
      getRef: () => ({
        valueChanges: () => of({}),
      }) as any,
    })
    .mock(StateService, {
      earlyState: of({}) as any,
      getStatesInContext: () => of([]) as any,
      loadState: () => of(0) as any,
    })
    .mock(AppModule));

  it('should be created', () => {
    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;
    expect(service).toBeDefined();
  });

  it('user$ should update when authState changes', fakeAsync(() => {
    let spyUpdateUserId = MockInstance(DataService, 'updateUserId', createSpy());
    let spyGetRef = MockInstance(DataService, 'getRef', createSpy()
      .and.returnValue({valueChanges: () => of({uid: 'test-uid'})}));

    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;

    service.user$
      .subscribe(user => {
        expect(user).toEqual(objectContaining({uid: 'test-uid'}));
        expect(spyUpdateUserId).toHaveBeenCalled();
        expect(spyGetRef).toHaveBeenCalled();
      });
  }));

  it('when current state has changed, ask user before loading new state', fakeAsync(() => {
    MockInstance(StateService, 'earlyState', of({
      name: 'test-early-name',
    } as any));
    MockInstance(StateService, 'getTimelessState', (state) =>
      (state?.name === 'test-early-name')
        ? state
        : ({name: 'test-timeless-name'}) as any,
    );
    MockInstance(StateService, 'getStatesInContext', () => of([{} as any]));
    MockInstance(StateService, 'loadState', () => of(0) as any);
    let spyOpen = MockInstance(MatSnackBar, 'open', createSpy()
      .and.returnValue({
        afterDismissed: () => of({}),
      }));

    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;
    tick();

    expect(spyOpen).toHaveBeenCalled();
  }));

});
