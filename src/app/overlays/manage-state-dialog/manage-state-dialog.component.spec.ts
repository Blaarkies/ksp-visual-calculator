import { MockBuilder, MockInstance, MockRender } from 'ng-mocks';
import { AppModule } from '../../app.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ManageStateDialogComponent } from './manage-state-dialog.component';
import { ineeda } from 'ineeda';
import { UsableRoutes } from '../../usable-routes';
import { StateService } from '../../services/state.service';
import { EMPTY, of } from 'rxjs';
import { StateRow } from './state-row';
import { MatSnackBar } from '@angular/material/snack-bar';
import createSpy = jasmine.createSpy;
import createSpyObj = jasmine.createSpyObj;

let componentType = ManageStateDialogComponent;
describe('ManageStateDialogComponent', () => {

  beforeEach(() => MockBuilder(componentType)
    .mock(AppModule)
    .mock(MatDialogRef)
    .mock(MAT_DIALOG_DATA, {
      context: UsableRoutes.SignalCheck,
    })
    .mock(StateService, ineeda<StateService>({getStates: () => EMPTY})),
  );

  it('should create', () => {
    let fixture = MockRender(componentType);
    expect(fixture.point.componentInstance).toBeDefined();
  });

  it('editStateName() rename the state', async () => {
    let spyRenameState = MockInstance(StateService, 'renameState', createSpy()
      .and.returnValue(Promise.resolve()));
    let renameCurrentState = MockInstance(StateService, 'renameCurrentState', createSpy());

    let fixture = MockRender(componentType);
    let component = fixture.point.componentInstance;
    component.nowState = ineeda<StateRow>({name: 'test-name'});

    let methodState = ineeda<StateRow>({name: 'test-rename'});
    await component.editStateName('test-name', methodState);

    expect(spyRenameState).toHaveBeenCalledWith('test-name', methodState);
    expect(renameCurrentState).toHaveBeenCalledWith('test-rename');
    expect(component.nowState).toBeUndefined();
  });

  it('cancelOtherEditors() should call cancelEdit() on editors', () => {
    let fixture = MockRender(componentType);
    let component = fixture.point.componentInstance;

    let activeEditor = createSpyObj(['cancelEdit']) as any;
    let otherEditor = createSpyObj(['cancelEdit']) as any;
    component.editors = [
      activeEditor,
      otherEditor,
    ] as any;
    component.cancelOtherEditors(activeEditor);

    expect(activeEditor.cancelEdit).not.toHaveBeenCalled();
    expect(otherEditor.cancelEdit).toHaveBeenCalled();
  });

  it('removeState() should delete state and update current states', async () => {
    let spyOpen = MockInstance(MatSnackBar, 'open', createSpy()
      .and.returnValue({afterDismissed: () => of({dismissedByAction: false})}));
    let spyRemoveStateFromStore = MockInstance(StateService, 'removeStateFromStore', createSpy()
      .and.returnValue(Promise.resolve()));

    let fixture = MockRender(componentType);
    let component = fixture.point.componentInstance;

    spyOn(component, 'newState');
    spyOn(component as any, 'updateStates');

    let methodState = ineeda<StateRow>({name: 'test-remove'});
    await component.removeState(methodState);

    expect(spyOpen).toHaveBeenCalled();
    expect(spyRemoveStateFromStore).toHaveBeenCalledWith('test-remove');
    expect(component.newState).toHaveBeenCalled();
    expect((component as any).updateStates).toHaveBeenCalled();
  });

  it('loadState() calls stateService.loadState', () => {
    let spyLoadState = MockInstance(StateService, 'loadState', createSpy()
      .and.returnValue(of(0)));

    let fixture = MockRender(componentType);
    let component = fixture.point.componentInstance;

    let methodState = ineeda<StateRow>();
    component.loadState(methodState);

    expect(spyLoadState).toHaveBeenCalled();
  });

  it('newState() calls stateService.loadState', () => {
    let spyLoadState = MockInstance(StateService, 'loadState', createSpy()
      .and.returnValue(of(0)));

    let fixture = MockRender(componentType);
    let component = fixture.point.componentInstance;

    component.newState();

    expect(spyLoadState).toHaveBeenCalled();
  });

  it('exportState() should click the generated anchor tag', () => {
    let fixture = MockRender(componentType);
    let component = fixture.point.componentInstance;

    let aTag: any = {
      setAttribute: () => void 0,
      style: {display: 'inline'},
      click: () => void 0,
    };
    spyOn(aTag, 'click');
    spyOn(document, 'createElement').and.returnValue(aTag);
    spyOn(document.body, 'appendChild');
    spyOn(document.body, 'removeChild');

    let methodState = ineeda<StateRow>({
      name: 'test-remove',
      state: 'test-json-string',
    });
    component.exportState(methodState);

    expect(aTag.click).toHaveBeenCalled();
  });

  it('importFile() should do nothing if files.length is not 1', () => {
    let spyImportState = MockInstance(StateService, 'importState', createSpy()
      .and.returnValue(Promise.resolve()));

    let fixture = MockRender(componentType);
    let component = fixture.point.componentInstance;

    component.importFile([]);

    expect(spyImportState).not.toHaveBeenCalled();
  });

  it('importFile() should import, update, save new state', async () => {
    let spyImportState = MockInstance(StateService, 'importState', createSpy()
      .and.returnValue(Promise.resolve()));
    let spySaveState = MockInstance(StateService, 'saveState', createSpy()
      .and.returnValue(Promise.resolve()));
    MockInstance(StateService, 'stateRow', ineeda<StateRow>({name: 'test-state'}));

    let fixture = MockRender(componentType);
    let component = fixture.point.componentInstance;

    await component.importFile([{
      text: () => Promise.resolve('test-state-string'),
    }]);

    expect(spyImportState).toHaveBeenCalled();
    expect(spySaveState).toHaveBeenCalled();
    expect(component.nowState.name).toBe('test-state');
  });

  it('uploadFileSelected() should call importFile', () => {
    let fixture = MockRender(componentType);
    let component = fixture.point.componentInstance;

    spyOn(component, 'importFile');
    component.uploadFileSelected({target: {files: []}});

    expect(component.importFile).toHaveBeenCalled();
  });

  it('saveState() should call stateService.saveState', async () => {
    let spySaveState = MockInstance(StateService, 'saveState', createSpy()
      .and.returnValue(Promise.resolve()));

    let fixture = MockRender(componentType);
    let component = fixture.point.componentInstance;

    spyOn(component, 'importFile');
    spyOn(component as any, 'updateStates');
    await component.saveState(ineeda<StateRow>({name: 'test-state'}));

    expect(spySaveState).toHaveBeenCalled();
    expect((component as any).updateStates).toHaveBeenCalled();
  });

  it('editCurrentStateName() should call rename functions', async () => {
    let spyRenameCurrentState = MockInstance(StateService, 'renameCurrentState', createSpy()
      .and.returnValue(Promise.resolve()));

    let fixture = MockRender(componentType);
    let component = fixture.point.componentInstance;

    spyOn(component, 'editStateName');
    spyOn(component as any, 'updateStates');
    await component.editCurrentStateName('test-state', ineeda<StateRow>({name: 'test-state-renamed'}));

    expect(component.editStateName).toHaveBeenCalled();
    expect(spyRenameCurrentState).toHaveBeenCalled();
    expect((component as any).updateStates).toHaveBeenCalled();
  });

  it('triggerImport() should click the fileUploadInput', () => {
    let fixture = MockRender(componentType);
    let component = fixture.point.componentInstance;

    spyOn(component.fileUploadInput.nativeElement, 'click');
    component.triggerImport();

    expect(component.fileUploadInput.nativeElement.click).toHaveBeenCalled();
  });

});
