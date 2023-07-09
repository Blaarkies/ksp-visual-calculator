import { Component, Inject, ViewEncapsulation } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';
import {ReactiveFormsModule, UntypedFormControl} from '@angular/forms';
import { WithDestroy } from '../../common/with-destroy';
import {
  debounceTime,
  map,
  Observable,
  of,
  publishReplay,
  refCount,
  startWith,
  switchMap,
  takeUntil,
  tap,
  zip
} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import {FaqSectionComponent, Section} from './faq-section/faq-section.component';
import { BreakpointObserver } from '@angular/cdk/layout';
import { HudService } from '../../services/hud.service';
import {CommonModule} from "@angular/common";
import {InputFieldComponent} from "../../components/controls/input-field/input-field.component";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {MatButtonModule} from "@angular/material/button";
import { UsableRoutes } from '../../app.routes';
import { GameStateType } from '../../common/domain/game-state-type';

export class FaqDialogData {
  gameStateType: GameStateType;
}

@Component({
  selector: 'cp-faq-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    InputFieldComponent,
    ReactiveFormsModule,
    MatProgressBarModule,
    FaqSectionComponent,
    MatButtonModule,
  ],
  templateUrl: './faq-dialog.component.html',
  styleUrls: ['./faq-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FaqDialogComponent extends WithDestroy() {

  searchControl = new UntypedFormControl();
  columns: Section[][];

  allSections: Section[]; // single list, for handset
  isHandset$: Observable<boolean>;

  constructor(@Inject(MAT_DIALOG_DATA) public data: FaqDialogData,
              http: HttpClient,
              breakpointObserver: BreakpointObserver) {
    super();

    this.isHandset$ = breakpointObserver.observe([
      '(max-width: 1000px)',
      '(max-height: 800px)',
    ])
      .pipe(map(bp => bp.matches));

    let sections$ = zip(
      http.get<Section[]>('assets/faq/general.json'),
      http.get<Section[]>(this.getFilePathForPageContextFaq(data.gameStateType)))
      .pipe(
        map(([general, contextual]) => [...general, ...contextual]),
        publishReplay(1),
        refCount());

    this.searchControl.valueChanges
      .pipe(
        debounceTime(250),
        startWith(''),
        switchMap(query => zip(of(query), sections$)),
        map(([query, sections]) => [null, undefined, ''].includes(query)
          ? sections.shuffle()
          : this.getSortedSections(sections, query)),
        tap(sections => {
          this.allSections = sections;
          this.columns = sections.reduce((sum, c, i) => {
            sum[i % 2].push(c);
            return sum;
          }, [[], [], []]);
        }),
        takeUntil(this.destroy$))
      .subscribe();
  }

  private getSortedSections(sections, query) {
    return sections.sortByRelevance((s: Section) =>
        s.title.relevanceScore(query) * 3
        + s.simpleExplanation.relevanceScore(query) * 2
        + JSON.stringify(s.advancedExplanations).relevanceScore(query)
        + s.tags.relevanceScore(query),
      0);
  }

  searchFor(query: string) {
    this.searchControl.setValue(query);
  }

  private getFilePathForPageContextFaq(context: GameStateType): string {
    switch (context) {
      case GameStateType.CommnetPlanner:
        return 'assets/faq/signal-check.json';
      case GameStateType.DvPlanner:
        return 'assets/faq/dv-planner.json';
      default:
        throw new Error(`Context "${context}" does not exist`);
    }
  }
}





