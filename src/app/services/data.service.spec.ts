import { MockBuilder, MockInstance, MockRender } from 'ng-mocks';
import { AppModule } from '../app.module';
import { DataService } from './data.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { of } from 'rxjs';
import createSpy = jasmine.createSpy;

let serviceType = DataService;
describe('DataService', () => {

  beforeEach(() => MockBuilder(serviceType).mock(AppModule));

  it('should be created', () => {
    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;
    expect(service).toBeDefined();
  });

  it('getRef() should return doc', () => {
    let spyDoc = MockInstance(AngularFirestore, 'doc', createSpy());

    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;

    service.getRef('');

    expect(spyDoc).toHaveBeenCalled();
  });

  it('write() should fail if user is not signed in', async () => {
    let spyDoc = MockInstance(AngularFirestore, 'doc', createSpy()
      .and.returnValue({set: () => void 0}));

    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;

    let result = await service.write('users', {})
      .catch(error => error);

    expect(result).toBeDefined();
    expect(spyDoc).not.toHaveBeenCalled();
  });

  it('write() should call doc.set if user is signed in', async () => {
    let spyDoc = MockInstance(AngularFirestore, 'doc', createSpy()
      .and.returnValue({set: () => void 0}));

    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;
    (service as any).userId$.next('test-id');

    let result = await service.write('users', {})
      .catch(error => error);

    expect(result).toBeUndefined();
    expect(spyDoc).toHaveBeenCalled();
  });

  it('delete() should fail if user is not signed in', async () => {
    let spyDoc = MockInstance(AngularFirestore, 'doc', createSpy()
      .and.returnValue({update: () => void 0}));

    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;

    let result = await service.delete('users', '')
      .catch(error => error);

    expect(result).toBeDefined();
    expect(spyDoc).not.toHaveBeenCalled();
  });

  it('delete() should call doc.update if user is signed in', async () => {
    let spyDoc = MockInstance(AngularFirestore, 'doc', createSpy()
      .and.returnValue({update: () => void 0}));

    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;
    (service as any).userId$.next('test-id');

    let result = await service.delete('users', '')
      .catch(error => error);

    expect(result).toBeUndefined();
    expect(spyDoc).toHaveBeenCalled();
  });

  it('readAll() should fail if user is not signed in', async () => {
    let spyDoc = MockInstance(AngularFirestore, 'doc', createSpy()
      .and.returnValue({get: () => of({data: createSpy()})}));

    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;

    let result = await service.readAll('users')
      .catch(error => error);

    expect(result).toBeDefined();
    expect(spyDoc).not.toHaveBeenCalled();
  });

  it('readAll() should call doc.update if user is signed in', async () => {
    let spyDoc = MockInstance(AngularFirestore, 'doc', createSpy()
      .and.returnValue({get: () => of({data: createSpy()})}));

    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;
    (service as any).userId$.next('test-id');

    let result = await service.readAll('users')
      .catch(error => error);

    expect(result).toEqual([]);
    expect(spyDoc).toHaveBeenCalled();
  });

  it('updateUserId() should update userId$', () => {
    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;

    service.updateUserId('test-new-id');
    expect((service as any).userId$.value).toBe('test-new-id');
  });

});
