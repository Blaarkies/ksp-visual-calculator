import { AntennaStatsComponent } from './antenna-stats.component';
import { MockBuilder, MockRender } from 'ng-mocks';
import { AppModule } from '../../app.module';

let componentType = AntennaStatsComponent;
describe(componentType.name, () => {

  beforeEach(() => MockBuilder(componentType).mock(AppModule));

  it('should create', () => {
    let fixture = MockRender(componentType);
    fixture.point.componentInstance.updateStats([]);

    expect(fixture.point.componentInstance).toBeDefined();
  });

});
