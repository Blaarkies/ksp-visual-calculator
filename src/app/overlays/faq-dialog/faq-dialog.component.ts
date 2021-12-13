import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
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
import { Section } from './faq-section/faq-section.component';
import { BreakpointObserver } from '@angular/cdk/layout';
import { HudService } from '../../services/hud.service';
import { UsableRoutes } from '../../usable-routes';

export class FaqDialogData {
  sections: Section[];
}

@Component({
  selector: 'cp-faq-dialog',
  templateUrl: './faq-dialog.component.html',
  styleUrls: ['./faq-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FaqDialogComponent extends WithDestroy() {

  searchControl = new FormControl();
  columns: Section[][];

  allSections: Section[]; // single list, for handset
  isHandset$: Observable<boolean>;

  constructor(@Inject(MAT_DIALOG_DATA) public data: FaqDialogData,
              http: HttpClient,
              breakpointObserver: BreakpointObserver,
              hudService: HudService) {
    super();

    this.isHandset$ = breakpointObserver.observe([
      '(max-width: 1000px)',
      '(max-height: 800px)',
    ])
      .pipe(map(bp => bp.matches));

    let sections$ = zip(
      http.get<Section[]>('assets/faq/general.json'),
      http.get<Section[]>(this.getFilePathForPageContextFaq(hudService.pageContext)))
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

  private getFilePathForPageContextFaq(context: UsableRoutes): string {
    switch (context) {
      case UsableRoutes.SignalCheck:
        return 'assets/faq/signal-check.json';
      case UsableRoutes.DvPlanner:
        return 'assets/faq/dv-planner.json';
      default:
        throw new Error(`Context "${context}" does not exist`);
    }
  }
}





