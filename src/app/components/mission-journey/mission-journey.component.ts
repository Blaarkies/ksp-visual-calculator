import { AfterViewInit, Component, Input } from '@angular/core';
import { SpaceObject } from '../../common/domain/space-objects/space-object';
import { Icons } from '../../common/domain/icons';
import { CustomAnimation } from '../../common/domain/custom-animation';
import { fromEvent, Observable } from 'rxjs';
import { map, sampleTime, startWith } from 'rxjs/operators';
import { Vector2 } from '../../common/domain/vector2';
import { CameraService } from '../../services/camera.service';
import memoize from 'fast-memoize';
import { Checkpoint } from '../../common/data-structures/delta-v-map/checkpoint';

class TripTrajectory {
  sequence: number;
  a: SpaceObject;
  b?: SpaceObject;
  curve?: (x1, y1, x2, y2) => Vector2;
}

@Component({
  selector: 'cp-mission-journey',
  templateUrl: './mission-journey.component.html',
  styleUrls: ['./mission-journey.component.scss'],
  animations: [CustomAnimation.fade],
})
export class MissionJourneyComponent implements AfterViewInit {

  @Input() set checkpoints(value: Checkpoint[]) {
    if (!value.length) {
      this.trajectories = [];
      return;
    }
    this.updateTrajectories(value);
  }

  @Input() scale: number;
  @Input() isAddingCheckpoint: boolean;

  icons = Icons;
  mouseLocation$: Observable<Vector2>;
  trajectories: TripTrajectory[] = [];

  constructor(private cameraService: CameraService) {
  }

  private updateTrajectories(value: Checkpoint[]) {
    this.trajectories = value.windowed(2)
      .map(([a, b], i) => ({
        sequence: i + 1,
        a: a.node.body,
        b: b.node.body,
      }))
      .add({
        sequence: value.length,
        a: value.last()?.node?.body,
        b: null,
      })
      .map(props => {
        if (!props.b) {
          return props;
        }

        let a = props.a.location;
        let b = props.b.location;

        let memoizedCurve = memoize((x1, y1, x2, y2) => {
          let direction = a.direction(b);
          let distance = a.distance(b);
          return a.lerpClone(b).addVector2(Vector2.fromDirection(
            direction + Math.PI * .5,
            distance * .2));
        });
        return {
          ...props,
          curve: memoizedCurve,
        };
      });
  }

  ngAfterViewInit() {
    this.mouseLocation$ = fromEvent(
      this.cameraService.cameraController.nativeElement,
      'mousemove')
      .pipe(
        sampleTime(16),
        map((event: MouseEvent) => new Vector2(event.pageX, event.pageY)
          .subtractVector2(this.cameraService.location)
          .subtract(20, 48)),
        startWith(Vector2.zero));
  }

  hoverBody({body, hover}: { body: SpaceObject, hover: boolean }) {

  }

  getTrajectoryKey(index: number, item: TripTrajectory): string {
    return item.a.label + item.b?.label;
  }

}
