import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
  ViewEncapsulation,
} from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { Icons } from '../../common/domain/icons';
import {
  FormControl,
  UntypedFormControl,
  Validators,
} from '@angular/forms';
import { CommonValidators } from '../../common/validators/common-validators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StateEditNameRowComponent } from './state-edit-name-row/state-edit-name-row.component';
import {
  delay,
  filter,
  finalize,
  firstValueFrom,
  map,
  Observable,
  of,
  startWith,
  Subject,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { WithDestroy } from '../../common/with-destroy';
import { StateRow } from './state-row';
import { StateEntry } from './state-entry';
import {
  MatListModule,
  MatSelectionList,
} from '@angular/material/list';
import { BasicAnimations } from '../../animations/basic-animations';
import { AnalyticsService } from '../../services/analytics.service';
import { EventLogs } from '../../services/domain/event-logs';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { StateDisplayComponent } from '../../components/state-display/state-display.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FileDropDirective } from '../../directives/file-drop.directive';
import { MatIconModule } from '@angular/material/icon';
import { GameStateType } from '../../common/domain/game-state-type';
import { AbstractStateService } from '../../services/state.abstract.service';

@Component({
  selector: 'cp-manage-state-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatTabsModule,
    MatButtonModule,
    StateEditNameRowComponent,
    MatProgressBarModule,
    StateDisplayComponent,
    MatTooltipModule,
    FileDropDirective,
    MatIconModule,
    MatListModule,
  ],
  templateUrl: './manage-state-dialog.component.html',
  styleUrls: ['./manage-state-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [BasicAnimations.fade, BasicAnimations.height],
})
export class ManageStateDialogComponent extends WithDestroy() implements OnInit, OnDestroy {

  @Input() contextTitle: string;
  @Input() context: GameStateType;
  @Input() stateHandler: AbstractStateService;

  nowState: StateRow;
  states$: Observable<StateRow[]>;

  icons = Icons;
  editNameControl = new FormControl<string>('', [Validators.required, Validators.max(60)]);
  buttonLoaders = {
    load$: new Subject<boolean>(),
    import$: new Subject<boolean>(),
    export$: new Subject<boolean>(),
    remove$: new Subject<boolean>(),
    save$: new Subject<boolean>(),
    new$: new Subject<boolean>(),
    edit$: new Subject<boolean>(),
  };

  @ViewChild('stateList') stateList: MatSelectionList;
  @ViewChild('fileUploadInput') fileUploadInput: ElementRef<HTMLInputElement>;
  @ViewChildren(StateEditNameRowComponent) editors: QueryList<StateEditNameRowComponent>;

  constructor(private snackBar: MatSnackBar,
              private analyticsService: AnalyticsService) {
    super();
  }

  async ngOnInit() {
    this.nowState = await firstValueFrom(this.stateHandler.stateRow);
    this.states$ = this.getStates().pipe(startWith([]));
    this.states$
      .pipe(
        filter(states => states.length > 0),
        delay(0),
        takeUntil(this.destroy$))
      .subscribe(() => this.stateList.selectedOptions.select(this.stateList.options.first));
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    Object.values(this.buttonLoaders)
      .forEach(subject$ => subject$.complete());
  }

  async editStateName(oldName: string, state: StateRow) {
    this.buttonLoaders.edit$.next(true);

    await this.stateHandler.renameState(oldName, state)
      .finally(() => this.buttonLoaders.edit$.next(false));

    // if the current loaded state is the one being renamed, then update nowState as well
    if (this.nowState.name === oldName) {
      this.stateHandler.renameCurrentState(state.name);
      this.nowState = await firstValueFrom(this.stateHandler.stateRow);
    }

    this.analyticsService.logEvent('Edit state name', {
      category: EventLogs.Category.State,
    });
  }

  cancelOtherEditors(editor: StateEditNameRowComponent) {
    this.editors
      .filter(e => e !== editor)
      .forEach(e => e.cancelEdit());
  }

  async removeState(selectedState: StateRow) {
    this.buttonLoaders.remove$.next(true);
    this.snackBar.open(`Removing "${selectedState.name}"`, 'Undo', {duration: 3e3})
      .afterDismissed()
      .pipe(
        filter(action => !action.dismissedByAction),
        switchMap(() => this.stateHandler.removeStateFromStore(selectedState.name)),
        finalize(() => this.buttonLoaders.remove$.next(false)),
        takeUntil(this.destroy$))
      .subscribe(() => {
        this.snackBar.open(`Removed "${selectedState.name}" from cloud storage`);
        this.newState(true);
        this.updateStates();
      });

    this.analyticsService.logEvent('Removed state', {
      category: EventLogs.Category.State,
    });
  }

  private getStates(): Observable<StateRow[]> {
    return this.stateHandler.getStatesInContext()
      .pipe(
        // update the form control that handles renaming. it must validate for allowing only unique names
        tap(stateEntries => this.editNameControl = new UntypedFormControl('', [
          Validators.required,
          Validators.max(60),
          CommonValidators.uniqueString(stateEntries.map(s => s.name))])),
        map((stateEntries: StateEntry[]) => stateEntries.map(entry => new StateRow(entry))));
  }

  loadState(selectedState: StateRow) {
    this.analyticsService.logEvent('Load state', {
      category: EventLogs.Category.State,
    });

    this.buttonLoaders.load$.next(true);
    this.stateHandler.loadState(selectedState.state)
      .pipe(
        switchMap(() => this.stateHandler.stateRow),
        finalize(() => this.buttonLoaders.load$.next(false)),
        takeUntil(this.destroy$))
      .subscribe(state => {
        this.nowState = state;
        this.snackBar.open(`Loaded "${selectedState.name}"`);
      });
  }

  newState(noMessage: boolean = false) {
    if (!noMessage) {
      this.analyticsService.logEvent('Load state', {
        category: EventLogs.Category.State,
      });
    }

    this.buttonLoaders.new$.next(true);
    this.stateHandler.loadState()
      .pipe(
        switchMap(() => this.stateHandler.stateRow),
        finalize(() => this.buttonLoaders.new$.next(false)),
        takeUntil(this.destroy$))
      .subscribe(state => {
        this.nowState = state;
        if (noMessage) {
          return;
        }

        this.snackBar.open(`New save game has been created`);
      });
  }

  exportState(selectedState: StateRow) {
    let sJson = selectedState.state;
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/json;charset=UTF-8,' + encodeURIComponent(sJson));
    element.setAttribute('download', `ksp-vc-savegame-${selectedState.name}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    of(false)
      .pipe(
        delay(1e3),
        startWith(true),
        takeUntil(this.destroy$))
      .subscribe(show => this.buttonLoaders.export$.next(show));
    this.snackBar.open(`Exported "${selectedState.name}" to JSON file`);

    this.analyticsService.logEvent('Export state', {
      category: EventLogs.Category.State,
    });
  }

  async importFile(files: any) {
    if (files.length === 1) {
      this.buttonLoaders.import$.next(true);
      let stateString: string = await files[0].text();
      await this.stateHandler.importState(stateString);

      this.nowState = await firstValueFrom(this.stateHandler.stateRow);
      await this.stateHandler.saveState(this.nowState);
      this.updateStates();

      this.buttonLoaders.import$.next(false);
      this.snackBar.open(`Imported "${this.nowState.name}"`);
    }

    this.analyticsService.logEvent('Import state', {
      category: EventLogs.Category.State,
    });
  }

  async uploadFileSelected(event: any) {
    await this.importFile(event.target.files);

    this.analyticsService.logEvent('Import via button', {
      category: EventLogs.Category.State,
    });
  }

  async saveState(state: StateRow) {
    this.buttonLoaders.save$.next(true);
    await this.stateHandler.saveState(state)
      .catch(error => {
        this.snackBar.open(`Could not save "${state.name}"`);
        throw error;
      })
      .finally(() => this.buttonLoaders.save$.next(false));
    this.snackBar.open(`"${state.name}" has been saved`);
    this.updateStates();

    this.analyticsService.logEvent('Save state', {
      category: EventLogs.Category.State,
    });
  }

  private updateStates() {
    this.states$ = this.getStates();
    this.states$
      .pipe(
        filter(states => states.length > 0),
        delay(0),
        takeUntil(this.destroy$))
      .subscribe(() => this.stateList.selectedOptions.select(this.stateList.options.first));
  }

  async editCurrentStateName(oldName: string, state: StateRow) {
    await this.editStateName(oldName, state);
    this.stateHandler.renameCurrentState(state.name);
    this.updateStates();
  }

  triggerImport() {
    this.fileUploadInput.nativeElement.click();
  }

}
