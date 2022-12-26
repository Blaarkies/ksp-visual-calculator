import { AfterViewInit, Component, Input } from '@angular/core';
import { SpaceObject } from '../../common/domain/space-objects/space-object';
import { Icons } from '../../common/domain/icons';
import { BasicAnimations } from '../../common/animations/basic-animations';
import { filter, fromEvent, interval, map, mapTo, merge, Observable, sampleTime, scan, startWith } from 'rxjs';
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
  animations: [BasicAnimations.fade],
})
export class MissionJourneyComponent implements AfterViewInit {

  @Input() set checkpoints(value: Checkpoint[]) {
    if (!value.length) {
      this.trajectories = [];
      return;
    }
    this.updateTrajectories(value);
  }

  @Input() isAddingCheckpoint: boolean;

  @Input() set scale(value: number) {
    this.inverseScale = 1 / value;
  }

  inverseScale = 1;

  icons = Icons;
  math = Math;
  worldViewScale = 100 * CameraService.normalizedScale;
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
    let screenSpace = this.cameraService.cameraController.nativeElement;
    this.mouseLocation$ = merge(fromEvent(screenSpace, 'mousemove'), interval(17).pipe(mapTo(null)))
      .pipe(
        scan((acc, value) => value || acc),
        filter(e => e),
        sampleTime(16),
        map((event: MouseEvent) => new Vector2(event.pageX, event.pageY)
          .subtractVector2(this.cameraService.location)
          .multiply(1 / this.cameraService.scale)),
        startWith(Vector2.zero));
  }

  getTrajectoryKey(index: number, item: TripTrajectory): string {
    return item.a.label + item.b?.label;
  }

}
