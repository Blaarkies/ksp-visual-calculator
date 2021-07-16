import { BuyMeACoffeeDialogComponent } from './buy-me-a-coffee-dialog.component';
import { MockBuilder, MockRender } from 'ng-mocks';
import { AppModule } from '../../app.module';

let componentType = BuyMeACoffeeDialogComponent;
describe(componentType.name, () => {

  beforeEach(() => MockBuilder(componentType).mock(AppModule));

  it('should create', () => {
    let fixture = MockRender(componentType);
    expect(fixture.point.componentInstance).toBeDefined();
  });

});
