import { CommonModule } from '@angular/common';
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
import {
  FormControl,
  UntypedFormControl,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import {
  MatListModule,
  MatSelectionList,
} from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
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
  timer,
} from 'rxjs';
import { BasicAnimations } from '../../animations/basic-animations';
import { UsableRoutes } from '../../app.routes';
import { GameStateType } from '../../common/domain/game-state-type';
import { Icons } from '../../common/domain/icons';
import { Uid } from '../../common/uid';
import { CommonValidators } from '../../common/validators/common-validators';
import { WithDestroy } from '../../common/with-destroy';
import { StateDisplayComponent } from '../../components/state-display/state-display.component';
import { FileDropDirective } from '../../directives/file-drop.directive';
import { AnalyticsService } from '../../services/analytics.service';
import { AbstractBaseStateService } from '../../services/domain/base-state.abstract.service';
import { EventLogs } from '../../services/domain/event-logs';
import { SavegameAssistant } from '../../services/domain/savegame-assistant.model';
import { StateEditNameRowComponent } from './state-edit-name-row/state-edit-name-row.component';
import { StateEntry } from './state-entry';
import { StateRow } from './state-row';

enum ErrorReasons {
  incorrectContext,
}

let contextLabelMap = new Map<GameStateType, string>([
  [GameStateType.CommnetPlanner, 'Commnet Planner'],
  [GameStateType.DvPlanner, 'Delta-v Planner'],
  [GameStateType.Isru, 'ISRU Mining Station'],
]);

function getContextLabel(value: GameStateType): string {
  return contextLabelMap.get(value) ?? undefined;
}

let contextRouteMap = new Map<GameStateType, UsableRoutes>([
  [GameStateType.CommnetPlanner, UsableRoutes.CommnetPlanner],
  [GameStateType.DvPlanner, UsableRoutes.DvPlanner],
  [GameStateType.Isru, UsableRoutes.MiningStation],
]);

function getRouteForContext(value: GameStateType): UsableRoutes {
  return contextRouteMap.get(value) ?? undefined;
}

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
  @Input() stateHandler: AbstractBaseStateService;

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

  @ViewChild(FileDropDirective) importer: FileDropDirective;
  @ViewChild('stateList') stateList: MatSelectionList;
  @ViewChild('fileUploadInput') fileUploadInput: ElementRef<HTMLInputElement>;
  @ViewChildren(StateEditNameRowComponent) editors: QueryList<StateEditNameRowComponent>;

  constructor(
    private dialogRef: MatDialogRef<ManageStateDialogComponent>,
    private snackBar: MatSnackBar,
    private analyticsService: AnalyticsService,
    private router: Router,
  ) {
    super();
  }

  async ngOnInit() {
    this.nowState = this.stateHandler.stateRow;
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
      this.nowState = this.stateHandler.stateRow;
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

    await this.stateHandler.removeStateFromStore(selectedState);
    this.buttonLoaders.remove$.next(false);

    this.snackBar.open(`Removed "${selectedState.name}"`, 'Undo', {duration: 5e3})
      .afterDismissed()
      .pipe(
        filter(action => action.dismissedByAction),
        switchMap(() => {
          this.analyticsService.logEvent('Recovered state', {
            category: EventLogs.Category.State,
          });
          return this.stateHandler.recoverStateFromStore(selectedState);
        }),
        takeUntil(this.destroy$))
      .subscribe(() => {
        this.snackBar.open(`Recovered "${selectedState.name}"`);
        this.updateStates();
      });

    this.newState(true);
    this.updateStates();

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
    let {name, timestamp, version, state} = selectedState;
    let jsDate = new Date(timestamp);
    this.stateHandler.loadState({
      id: selectedState.id,
      name,
      timestamp: jsDate,
      context: this.context,
      version,
      state,
    })
      .pipe(
        map(() => this.stateHandler.stateRow),
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
        map(() => this.stateHandler.stateRow),
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
    let sJson = JSON.stringify({
      context: this.context,
      name: selectedState.name,
      timestamp: selectedState.timestamp,
      version: selectedState.version,
      state: JSON.parse(selectedState.state),
      id: undefined,
    });
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
      try {
        await this.importState(stateString);
      } catch (e) {
        this.buttonLoaders.import$.next(false);
        this.importer.showError();

        if (e.reason === undefined) {
          this.snackBar.open(`Could not import file.`);
          console.warn('Could not import file', e);
        } else {
          if (e.solution) {
            this.snackBar.open(e.message, e.solution.label, {duration: 10e3})
              .afterDismissed().pipe(
              filter(action => action.dismissedByAction),
              takeUntil(this.destroy$))
              .subscribe(() => e.solution.callback());
          } else {
            this.snackBar.open(e.message);
          }
        }

        return;
      }

      this.importer.showSuccess();

      let state = this.stateHandler.stateBase;
      await this.stateHandler.save();
      this.updateStates();

      this.buttonLoaders.import$.next(false);
      this.snackBar.open(`Imported "${state.name}"`);
    }

    this.analyticsService.logEvent('Import state', {
      category: EventLogs.Category.State,
    });
  }

  private async importState(stateString: string) {
    let stateEntry: StateEntry = JSON.parse(stateString);
    let repairedState = new SavegameAssistant(stateEntry).getRepairedState();

    let {name, context, timestamp, version, deletedAt, state} = repairedState;

    if (context !== this.context) {
      throw {
        reason: ErrorReasons.incorrectContext,
        message: `Cannot not import a ${getContextLabel(context)} save game into the ${getContextLabel(this.context)}.`,
        solution: {
          label: 'Help',
          callback: async () => {
            this.dialogRef.close();
            await this.router.navigate([getRouteForContext(context)]);
            await firstValueFrom(timer(1e3));
            this.snackBar.open(`Now open Manage Save Games again.`);
          },
        },
      };
    }

    // firebase firestore uses `timestamp.seconds` object structure
    let jsDate = new Date(timestamp.seconds * 1e3);

    await firstValueFrom(this.stateHandler.loadState({
      id: Uid.new,
      name,
      context,
      timestamp: jsDate,
      version,
      deletedAt,
      state,
    }));
  }

  async uploadFileSelected(event: any) {
    await this.importFile(event.target.files);

    this.analyticsService.logEvent('Import via button', {
      category: EventLogs.Category.State,
    });
  }

  async saveState() {
    this.buttonLoaders.save$.next(true);
    let state = this.stateHandler.stateBase;
    await this.stateHandler.save()
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
