import { TransmissionLineComponent } from './transmission-line.component';
import { MockBuilder, MockRender } from 'ng-mocks';
import { AppModule } from '../../app.module';
import { TransmissionLine } from '../../common/domain/transmission-line';
import { ineeda } from 'ineeda';
import { of } from 'rxjs';
import { SpaceObject } from '../../common/domain/space-objects/space-object';
import { Draggable } from '../../common/domain/space-objects/draggable';

let componentType = TransmissionLineComponent;
describe('TransmissionLineComponent', () => {

  beforeEach(() => MockBuilder(componentType).mock(AppModule));

  it('should create', () => {
    let so = ineeda<SpaceObject>({
      draggableHandle: ineeda<Draggable>({
        isHover$: of(0) as any,
      }),
    });
    let transmissionLine = ineeda<TransmissionLine>({
      nodes: [so, so],
    });

    let fixture = MockRender(componentType, {transmissionLine});
    let component = fixture.point.componentInstance;
    expect(component).toBeDefined();

    component.ngOnDestroy();
  });

});
