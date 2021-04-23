import { TransmissionLineComponent } from './transmission-line.component';
import { MockBuilder, MockRender } from 'ng-mocks';
import { AppModule } from '../../app.module';
import { TransmissionLine } from '../../common/domain/transmission-line';
import { ineeda } from 'ineeda';

let componentType = TransmissionLineComponent;
describe(componentType.name, () => {

  beforeEach(() => MockBuilder(componentType).mock(AppModule));

  it('should create', () => {
    let fixture = MockRender(componentType, {transmissionLine: ineeda<TransmissionLine>()});
    expect(fixture.point.componentInstance).toBeDefined();
  });

});
