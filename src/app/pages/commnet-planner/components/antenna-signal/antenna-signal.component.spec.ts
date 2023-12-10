import { AntennaSignalComponent } from './antenna-signal.component';
import { MockBuilder, MockRender } from 'ng-mocks';
import { AppModule } from '../../app.module';
import { AntennaSignal } from '../../../../common/domain/antenna-signal';
import { ineeda } from 'ineeda';
import { of } from 'rxjs';
import { SpaceObject } from '../../../../common/domain/space-objects/space-object';
import { Draggable } from '../../../../common/domain/space-objects/draggable';

let componentType = AntennaSignalComponent;
describe('TransmissionLineComponent', () => {

  beforeEach(() => MockBuilder(componentType).mock(AppModule));

  it('should create', () => {
    let so = ineeda<SpaceObject>({
      draggableHandle: ineeda<Draggable>({
        isHover$: of(0) as any,
      }),
    });
    let transmissionLine = ineeda<AntennaSignal>({
      nodes: [so, so],
    });

    let fixture = MockRender(componentType, {transmissionLine});
    let component = fixture.point.componentInstance;
    expect(component).toBeDefined();

    component.ngOnDestroy();
  });

});
