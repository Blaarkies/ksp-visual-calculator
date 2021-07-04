import { Component, Inject, QueryList, ViewChildren, ViewEncapsulation } from '@angular/core';
import { filter, map, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UsableRoutes } from '../../usable-routes';
import { StateService } from '../../services/state.service';
import { Icons } from '../../common/domain/icons';
import { FormControl, Validators } from '@angular/forms';
import { CommonValidators } from '../../common/validators/common-validators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StateEditNameRowComponent } from './state-edit-name-row/state-edit-name-row.component';
import { Observable } from 'rxjs';
import { WithDestroy } from '../../common/with-destroy';
import { StateRow } from './state.row';
import { StateEntry } from './state.entry';

export class ManageStateDialogData {
  context: UsableRoutes;
}

@Component({
  selector: 'cp-manage-state-dialog',
  templateUrl: './manage-state-dialog.component.html',
  styleUrls: ['./manage-state-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ManageStateDialogComponent extends WithDestroy() {

  context: UsableRoutes = this.data.context;
  contextTitle = 'signal check';
  nowState: StateRow;
  states$ = this.getStates().pipe(startWith([]));

  icons = Icons;
  editNameControl = new FormControl('', [Validators.required, Validators.max(60)]);

  @ViewChildren(StateEditNameRowComponent) editors: QueryList<StateEditNameRowComponent>;
  // todo: make archive list auto-select first entry

  constructor(@Inject(MAT_DIALOG_DATA) public data: ManageStateDialogData,
              private stateService: StateService,
              private snackBar: MatSnackBar) {
    super();

    this.nowState = stateService.stateRow;
  }

  async editStateName(oldName: string, state: StateRow) {
    await this.stateService.addStateToStore(state.toUpdatedStateGame())
      .then(() => this.stateService.removeStateFromStore(oldName))
      .catch(error => {
        this.snackBar.open(`Could not rename "${oldName}"`);
        throw error;
      })
      .then(() => this.snackBar.open(`Renamed "${oldName}" to "${state.name}"`));
  }

  cancelOtherEditors(editor: StateEditNameRowComponent) {
    this.editors.filter(e => e !== editor)
      .forEach(e => e.cancelEdit());
  }

  async removeState(selectedState: StateRow) {
    this.snackBar.open(`Removing "${selectedState.name}"`, 'Undo')
      .afterDismissed()
      .pipe(
        filter(action => !action.dismissedByAction),
        switchMap(() => this.stateService.removeStateFromStore(selectedState.name)),
        takeUntil(this.destroy$))
      .subscribe(() => {
        this.snackBar.open(`Removed "${selectedState.name}" from cloud storage`);
        this.updateStates();
      });
  }

  private getStates(): Observable<StateRow[]> {
    return this.stateService.getStates()
      .pipe(
        tap(stateEntries => this.editNameControl = new FormControl('', [
          Validators.required, Validators.max(60),
          CommonValidators.uniqueString(stateEntries.map(s => s.name))])),
        map((stateEntries: StateEntry[]) => stateEntries
          .filter(entry => entry.context === this.context)
          .sort((a, b) => b.timestamp.seconds - a.timestamp.seconds)
          .map(entry => new StateRow(entry))));
  }

  loadState(selectedState: StateRow) {
    this.stateService.loadState(selectedState.state);
  }

  newState() {
    this.stateService.loadState();
    this.nowState = this.stateService.stateRow;
  }

  exportState(selectedState: StateRow) {
    let sJson = selectedState.state;
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/json;charset=UTF-8,' + encodeURIComponent(sJson));
    element.setAttribute('download', `ksp-cp-savegame- ${selectedState.name}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  async importFile(files: any) {
    if (files.length === 1) {
      let stateString: string = await files[0].text();
      this.stateService.importState(stateString);

      this.nowState = this.stateService.stateRow;
    }
  }

  async uploadFileSelected(event: any) {
    await this.importFile(event.target.files);
  }

  async archiveState(state: StateRow) {
    await this.stateService.saveState(state)
      .catch(error => {
        this.snackBar.open(`Could not save "${state.name}"`);
        throw error;
      });
    this.snackBar.open(`"${state.name}" has been saved`);
    this.updateStates();
  }

  private updateStates() {
    this.states$ = this.getStates();
  }

  async editCurrentStateName(oldName: string, state: StateRow) {
    await this.editStateName(oldName, state);
    this.stateService.renameCurrentState(state.name);
    this.updateStates();
  }

}
