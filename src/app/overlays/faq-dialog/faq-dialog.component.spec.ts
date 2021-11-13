import { FaqDialogComponent } from './faq-dialog.component';
import { MockBuilder, MockRender } from 'ng-mocks';
import { AppModule } from '../../app.module';
import { HttpClient } from '@angular/common/http';
import { ineeda } from 'ineeda';
import { of } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Section } from './faq-section/faq-section.component';
import { HudService } from '../../services/hud.service';
import { UsableRoutes } from '../../usable-routes';

let componentType = FaqDialogComponent;
describe('FaqDialogComponent', () => {

  beforeEach(() => MockBuilder(componentType)
    .mock(AppModule)
    .mock(HudService, ineeda<HudService>({
      pageContext: UsableRoutes.SignalCheck,
    }))
    .mock(HttpClient, ineeda<HttpClient>({
      get: (url => {
        switch (url) {
          case 'assets/faq/general.json':
            return of(jsonDataGeneral);
          case 'assets/faq/signal-check.json':
            return of(jsonDataSignalCheck);
          case 'assets/faq/dv-planner.json':
            return of(jsonDataDvPlanner);
          default:
            throw new Error(`URL "${url}" does not match any legit asset JSON file.`);
        }
      }) as any,
    }))
    .mock(BreakpointObserver, ineeda<BreakpointObserver>({
      observe: () => of(),
    })));

  it('should create', () => {
    let fixture = MockRender(componentType);
    expect(fixture.point.componentInstance).toBeDefined();
  });

  it('constructor should get json data and populate allSections', () => {
    let fixture = MockRender(componentType);
    let component = fixture.point.componentInstance;

    expect(component.allSections.length).toBe(3);
    expect(component.columns.length).toBe(3);
    expect(component.columns[0].length).toBe(2);
    expect(component.columns[1].length).toBe(1);
    expect(component.columns[2].length).toBe(0);
  });

  it('searchFor() should set searchControl value', () => {
    let fixture = MockRender(componentType);
    let component = fixture.point.componentInstance;

    component.searchFor('test-query');
    expect(component.searchControl.value).toBe('test-query');
  });

});

/* tslint:disable:object-literal-key-quotes */
let jsonDataGeneral: Section[] = [
  {
    'title': 'test-title',
    'simpleExplanation': 'test-simple',
    'advancedExplanations': [
      [
        {
          'type': 'span',
          'content': 'test-span',
        },
        {
          'type': 'search',
          'content': 'test-search',
          'query': 'test-query',
        },
      ],
    ],
    'tags': 'test-tag',
  },
  {
    'title': 'test-title-b',
    'simpleExplanation': 'test-simple-b',
    'advancedExplanations': [],
    'tags': 'test-tag-b',
  },
];

let jsonDataSignalCheck: Section[] = [
  {
    'title': 'test-title-signal-check',
    'simpleExplanation': '',
    'advancedExplanations': [],
    'tags': '',
  },
];

let jsonDataDvPlanner: Section[] = [
  {
    'title': 'test-title-dv-planner',
    'simpleExplanation': '',
    'advancedExplanations': [],
    'tags': '',
  },
];
