import { Component, Inject, QueryList, ViewChildren } from '@angular/core';
import { DataService } from '../../services/data.service';
import { filter, map, tap } from 'rxjs/operators';
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

export class StateRow {

  name: string;
  timestamp: string;
  version: string;
  state: string;

  constructor(stateEntry: any) {
    this.name = stateEntry.name;
    this.timestamp = new Date(stateEntry.timestamp.seconds * 1e3).toLocaleString();
    this.version = 'v' + stateEntry.version.join('.');
    this.state = stateEntry.state;
  }

}

export class ManageStateDialogData {
  context: UsableRoutes;
}

interface StateEntry {
  context: UsableRoutes;
  name: string;
  timestamp: Date;
  version: number[];
}

@Component({
  selector: 'cp-manage-state-dialog',
  templateUrl: './manage-state-dialog.component.html',
  styleUrls: ['./manage-state-dialog.component.scss'],
})
export class ManageStateDialogComponent {

  context: UsableRoutes = this.data.context;
  contextTitle = 'signal check';
  nowState: StateRow;
  states$ = this.getStates();

  icons = Icons;
  editNameControl = new FormControl('', [Validators.required]);

  @ViewChildren(StateEditNameRowComponent) editors: QueryList<StateEditNameRowComponent>;

  constructor(@Inject(MAT_DIALOG_DATA) public data: ManageStateDialogData,
              private dataService: DataService,
              private stateService: StateService,
              private snackBar: MatSnackBar) {
    let state = stateService.state;
    this.nowState = new StateRow({
      name: state.name,
      timestamp: {seconds: state.timestamp.getTime() * .001},
      version: state.version,
      state: JSON.stringify(state),
    });
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
    await this.stateService.removeStateFromStore(selectedState.name)
      .then(() => {
        this.snackBar.open(`Removed "${selectedState.name}" from cloud storage`);
        this.states$ = this.getStates();
      });

  }

  private getStates(): Observable<StateRow[]> {
    return this.dataService.readAll<StateEntry>('states')
      .pipe(
        tap(stateEntries => this.editNameControl = new FormControl('', [Validators.required,
          CommonValidators.uniqueString(stateEntries.map(s => s.name))])),
        map(stateEntries => stateEntries
          .filter(entry => entry.context === this.context)
          .map(entry => new StateRow(entry))));
  }

  loadState(selectedState: StateRow) {

  }

}
