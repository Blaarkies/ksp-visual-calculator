import { MockBuilder, MockInstance, MockRender } from 'ng-mocks';
import { AppModule } from '../app.module';
import { AuthService } from './auth.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { of, take } from 'rxjs';
import { DataService } from './data.service';
import { fakeAsync, tick } from '@angular/core/testing';
import { StateService } from './state.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { StateEntry } from '../overlays/manage-state-dialog/state-entry';
import firebase from 'firebase/app';
import 'firebase/auth';
import { HttpClient } from '@angular/common/http';
import { ineeda } from 'ineeda';
import createSpy = jasmine.createSpy;
import objectContaining = jasmine.objectContaining;

let serviceType = AuthService;
describe('AuthService', () => {

  beforeEach(() => MockBuilder(serviceType)
    .mock(AngularFireAuth, {authState: of({}) as any})
    .mock(DataService, {
      getRef: () => ({
        valueChanges: () => of({}),
        set: () => Promise.resolve(),
      }) as any,
    })
    .mock(HttpClient, ineeda<HttpClient>({
      get: () => of({isCustomer: true} as any)
    }))
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

  it('user$ should update when authState changes', (done) => {
    let spyUpdateUserId = MockInstance(DataService, 'updateUserId', createSpy());
    let spyGetRef = MockInstance(DataService, 'getRef', createSpy()
      .and.returnValue({valueChanges: () => of({uid: 'test-uid'})}));
    MockInstance(AngularFireAuth, 'authState', of({uid: 'test-uid'} as any));

    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;

    service.user$
      .pipe(take(1))
      .subscribe(user => {
        expect(user).toEqual(objectContaining({uid: 'test-uid'}));
        expect(spyUpdateUserId).toHaveBeenCalled();
        expect(spyGetRef).toHaveBeenCalled();

        done();
      });
  });

  xit('when current state has changed, ask user before loading new state', fakeAsync(() => {
    MockInstance(StateService, 'earlyState', of({
      name: 'test-early-name',
    } as any));
    MockInstance(StateService, 'getTimestamplessState', (state) =>
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

    MockRender(serviceType);
    tick();

    expect(spyOpen).toHaveBeenCalled();
  }));

  it('googleSignIn() should call loadUserLastSaveGame()', async () => {
    spyOn(firebase.auth, 'GoogleAuthProvider');
    let spySignInWithPopup = MockInstance(AngularFireAuth, 'signInWithPopup', createSpy()
      .and.returnValue({user: {}}));

    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;
    spyOn(service as any, 'loadUserLastSaveGame');

    await service.googleSignIn();

    expect(spySignInWithPopup).toHaveBeenCalled();
    expect((service as any).loadUserLastSaveGame).toHaveBeenCalled();
  });

  it('signOut() should signOut user and refresh state', async () => {
    let spySignOut = MockInstance(AngularFireAuth, 'signOut', createSpy());
    let spyNavigate = MockInstance(Router, 'navigate', createSpy());
    let spyLoadState = MockInstance(StateService, 'loadState', createSpy()
      .and.returnValue(of(0)));
    let spySetStateRecord = MockInstance(StateService, 'setStateRecord', createSpy());

    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;

    await service.signOut();

    expect(spySignOut).toHaveBeenCalled();
    expect(spyNavigate).toHaveBeenCalled();
    expect(spyLoadState).toHaveBeenCalled();
    expect(spySetStateRecord).toHaveBeenCalled();
  });

  it('emailSignIn() should attempt to signIn with email and password', async () => {
    let spySignInWithEmailAndPassword = MockInstance(AngularFireAuth, 'signInWithEmailAndPassword',
      createSpy().and.returnValue({user: {}}));

    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;

    await service.emailSignIn('in.space@test.com', 'plain-text-password');

    expect(spySignInWithEmailAndPassword).toHaveBeenCalled();
  });

  it('emailSignUp() should attempt to signIn with email and password', async () => {
    let spyCreateUserWithEmailAndPassword = MockInstance(AngularFireAuth, 'createUserWithEmailAndPassword', createSpy()
      .and.returnValue({user: {}}));

    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;

    await service.emailSignUp('in.space@test.com', 'plain-text-password');

    expect(spyCreateUserWithEmailAndPassword).toHaveBeenCalled();
  });

  it('resetPassword() should call sendPasswordResetEmail', async () => {
    let spySendPasswordResetEmail = MockInstance(AngularFireAuth, 'sendPasswordResetEmail', createSpy());

    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;

    await service.resetPassword('in.space@test.com');

    expect(spySendPasswordResetEmail).toHaveBeenCalled();
  });

  it('when current state is saved, loadUserLastSaveGame() should load state of user savegame', async () => {
    MockInstance(StateService, 'getStatesInContext', createSpy()
      .and.returnValue(of([{
        name: 'test-name',
        state: 'test-state',
      } as StateEntry])));
    MockInstance(StateService, 'stateIsUnsaved', false);
    let spyLoadState = MockInstance(StateService, 'loadState', createSpy()
      .and.returnValue(of(0)));

    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;
    let serviceAsAny = service as any;

    await serviceAsAny.loadUserLastSaveGame();

    expect(spyLoadState).toHaveBeenCalledWith('test-state');
  });

  it('when current state is unsaved, loadUserLastSaveGame() should load state of user savegame', async () => {
    MockInstance(StateService, 'getStatesInContext', createSpy()
      .and.returnValue(of([{
        name: 'test-name',
        state: 'test-state',
      } as StateEntry])));
    MockInstance(StateService, 'stateIsUnsaved', false);
    MockInstance(MatSnackBar, 'open', createSpy()
      .and.returnValue({
        afterDismissed: () => of({
          dismissedByAction: false,
        }),
      }));
    let spyLoadState = MockInstance(StateService, 'loadState', createSpy('spyLoadState')
      .and.returnValue(of(0)));

    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;
    let serviceAsAny = service as any;

    await serviceAsAny.loadUserLastSaveGame();

    !expect(spyLoadState).toHaveBeenCalled();
  });

});
