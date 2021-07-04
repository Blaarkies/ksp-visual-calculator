import { Component, Inject, QueryList, ViewChildren, ViewEncapsulation } from '@angular/core';
import { filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UsableRoutes } from '../../usable-routes';
import { StateService } from '../../services/state.service';
import { Icons } from '../../common/domain/icons';
import { FormControl, Validators } from '@angular/forms';
import { CommonValidators } from '../../common/validators/common-validators';
import { StateGame } from '../../services/json-interfaces/state-game';
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
  states$ = this.getStates();

  icons = Icons;
  editNameControl = new FormControl('', [Validators.required, Validators.max(60)]);

  @ViewChildren(StateEditNameRowComponent) editors: QueryList<StateEditNameRowComponent>;

  constructor(@Inject(MAT_DIALOG_DATA) public data: ManageStateDialogData,
              private stateService: StateService,
              private snackBar: MatSnackBar) {
    super();

    this.nowState = stateService.stateRow;
  }

  async editStateName(oldName: string, state: StateRow) {
    let parsedState: StateGame = JSON.parse(state.state);
    parsedState.name = state.name;
    parsedState.timestamp = new Date();

    await this.stateService.addStateToStore(parsedState)
      .then(() => {
        this.snackBar.open(`Saved "${state.name}" to cloud storage`);

        return this.stateService.removeStateFromStore(oldName);
      })
      .then(() => new Promise(resolve => setTimeout(resolve, 2e3)))
      .then(() => this.snackBar.open(`Removed "${oldName}" from cloud storage`))
      .catch(error => {
        this.snackBar.open(`Could not rename "${state.name}"`);
        throw console.error(error);
      });
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
        this.states$ = this.getStates();
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
}
