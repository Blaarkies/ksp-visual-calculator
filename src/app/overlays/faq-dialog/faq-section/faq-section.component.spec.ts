import { MockBuilder, MockRender } from 'ng-mocks';
import { FaqSectionComponent, Section } from './faq-section.component';
import { AppModule } from '../../../app.module';

let componentType = FaqSectionComponent;
describe(componentType.name, () => {

  beforeEach(() => MockBuilder(componentType).mock(AppModule));

  it('should create', () => {
    let fixture = MockRender(componentType, {
      section: {
        title: '',
        simpleExplanation: '',
      } as Section,
    });
    expect(fixture.point.componentInstance).toBeDefined();
  });

});
