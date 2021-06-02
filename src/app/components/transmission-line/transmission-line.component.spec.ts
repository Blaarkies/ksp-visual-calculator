import { TransmissionLineComponent } from './transmission-line.component';
import { MockBuilder, MockRender } from 'ng-mocks';
import { AppModule } from '../../app.module';
import { TransmissionLine } from '../../common/domain/transmission-line';
import { ineeda } from 'ineeda';
import { Subject } from 'rxjs';
import { SpaceObject } from '../../common/domain/space-objects/space-object';

let componentType = TransmissionLineComponent;
describe(componentType.name, () => {

  beforeEach(() => MockBuilder(componentType).mock(AppModule));

  it('should create', () => {
    let tl = ineeda<TransmissionLine>();
    let so = ineeda<SpaceObject>();
    // html template uses a `isHover$ | async` pipe, which attempts an actual subscribe
    so.draggableHandle.isHover$ = new Subject<boolean>();
    tl.nodes = [so, so];

    let fixture = MockRender(componentType, {transmissionLine: tl});
    expect(fixture.point.componentInstance).toBeDefined();

    so.draggableHandle.isHover$.complete();
  });

});
