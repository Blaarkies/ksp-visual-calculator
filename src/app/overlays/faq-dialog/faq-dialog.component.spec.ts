import { FaqDialogComponent } from './faq-dialog.component';
import { MockBuilder, MockInstance, MockRender } from 'ng-mocks';
import { AppModule } from '../../app.module';
import { HttpClient } from '@angular/common/http';
import { ineeda } from 'ineeda';
import { EMPTY, of } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Section } from './faq-section/faq-section.component';

let componentType = FaqDialogComponent;
describe('FaqDialogComponent', () => {

  beforeEach(() => MockBuilder(componentType)
    .mock(AppModule)
    .mock(HttpClient, ineeda<HttpClient>({get: url => EMPTY}))
    .mock(BreakpointObserver, ineeda<BreakpointObserver>({
      observe: () => of(),
    })));

  it('should create', () => {
    let fixture = MockRender(componentType);
    expect(fixture.point.componentInstance).toBeDefined();
  });

  it('constructor should get json data and populate allSections', () => {
    MockInstance(HttpClient, instance => ineeda<HttpClient>({
      get: url => of(jsonData) as any,
    }));

    let fixture = MockRender(componentType);
    let component = fixture.point.componentInstance;

    expect(component.allSections.length).toBe(2);
    expect(component.columns.length).toBe(3);
    expect(component.columns[0].length).toBe(1);
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
let jsonData: Section[] = [
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
