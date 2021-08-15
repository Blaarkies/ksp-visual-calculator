import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';
import { FaqSectionComponent, Section } from './faq-section.component';
import { AppModule } from '../../../app.module';

let componentType = FaqSectionComponent;
describe('FaqSectionComponent', () => {

  beforeEach(() => MockBuilder(componentType).mock(AppModule));

  let section: Section = {
    title: '',
    simpleExplanation: '',
    advancedExplanations: [],
    tags: '',
  };

  it('should create', () => {
    let fixture = MockRender(componentType, {section});
    expect(fixture.point.componentInstance).toBeDefined();
  });

  it('when link is clicked, it should output search', () => {
    let fixture = MockRender(componentType, {
      section: {
        ...section,
        advancedExplanations: [
          [
            {
              type: 'search',
              content: 'text-search',
              query: 'test-query',
            } as any,
          ],
        ],
      } as Section,
    });
    let component = fixture.point.componentInstance;
    spyOn(component.search, 'emit');

    let searchSpan = fixture.debugElement.nativeElement.querySelector('span.read-more');
    searchSpan.click();

    expect(component.search.emit).toHaveBeenCalled();
  });

});
