import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  Input,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import memoize from 'fast-memoize';
import {
  filter,
  interval,
  map,
  merge,
  Observable,
  sampleTime,
  scan,
  startWith,
} from 'rxjs';
import { BasicAnimations } from '../../../../animations/basic-animations';
import { Icons } from '../../../../common/domain/icons';
import { SpaceObject } from '../../../../common/domain/space-objects/space-object';
import { Vector2 } from '../../../../common/domain/vector2';
import { CameraComponent } from '../../../../components/camera/camera.component';
import { CameraService } from '../../../../services/camera.service';
import { Checkpoint } from '../../domain/checkpoint';
import { TripTrajectory } from '../../domain/trip-trajectory';

@Component({
  selector: 'cp-mission-journey',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
  ],
  templateUrl: './mission-journey.component.html',
  styleUrls: ['./mission-journey.component.scss'],
  animations: [BasicAnimations.fade],
})
export class MissionJourneyComponent implements AfterViewInit {

  @Input() set checkpoints(value: Checkpoint[]) {
    if (!(value?.length)) {
      this.trajectories = [];
      return;
    }
    this.updateTrajectories(value);
  }

  @Input() isAddingCheckpoint: boolean;

  @Input() set scale(value: number) {
    this.inverseScale = 1 / value;
  }

  @Input() camera: CameraComponent;

  inverseScale = 1;

  icons = Icons;
  worldViewScale = 100 * CameraService.normalizedScale;
  mouseLocation$: Observable<Vector2>;
  trajectories: TripTrajectory[] = [];
  tripIndexMarginMap: number[] = [];

  constructor(private cameraService: CameraService) {
  }

  ngAfterViewInit() {
    this.mouseLocation$ = merge(
      this.camera.getMouseMoveEvent(),
      interval(17).pipe(map(() => null)))
      .pipe(
        scan((acc, value) => value || acc),
        filter(e => e),
        sampleTime(16),
        map((event: MouseEvent) => this.cameraService
          .convertPageLocationToMouseLocation(new Vector2(event.pageX, event.pageY))),
        startWith(Vector2.zero));
  }

  getTrajectoryKey(index: number, item: TripTrajectory): string {
    return item.a.label + item.b?.label;
  }

  private updateTrajectories(checkpoints: Checkpoint[]) {
    this.trajectories = this.createTrajectories(checkpoints);

    this.updateTripIndexLabels(this.trajectories);
  }

  private createTrajectories(value: Checkpoint[]) {
    return value.windowed(2)
      .map(([a, b], i) => ({
        sequence: i + 1,
        a: a.node.body,
        b: b.node.body,
      }))
      .add({
        sequence: value.length,
        a: value.last()?.node?.body,
        b: null,
      });
  }

  /** Determines visual margins for trip-index labels */
  private updateTripIndexLabels(trajectories: TripTrajectory[]) {
    this.tripIndexMarginMap = [];

    let destinationMap = new Map<SpaceObject, number[]>(trajectories.map(({a}) => [a, []]));
    trajectories.forEach(({sequence, a}) => destinationMap.get(a).push(sequence));

    Array.from(destinationMap.values())
      .filter(list => list.length > 1)
      .map(list => list.map((tripIndex, i) => ({tripIndex, margin: i})))
      .flat()
      .forEach(({tripIndex, margin}) => this.tripIndexMarginMap[tripIndex] = margin);
  }

  /** Serialized args into toString() values. Object references are ignored. */
  private serializer = args => args.map(a => a.toString()).join('');
  private memoizeTrajectoryPath = memoize((x1, y1, x2, y2, trajectory) => {
    let s = this.worldViewScale;

    let locationA = trajectory.a.location;
    let locationB = trajectory.b.location;
    let direction = locationA.direction(locationB);
    let distance = locationA.distance(locationB);
    let curve = locationA.lerpClone(locationB)
      .addVector2(Vector2.fromDirection(
        direction + Math.PI * .5,
        distance * .2));

    return `M ${s * x1} ${s * y1} S`
      + `${s * curve.x}`
      + ` ${s * curve.y}`
      + ` ${s * x2} ${s * y2}`;
  }, {serializer: this.serializer});

  getPath(trajectory: TripTrajectory): string {
    return this.memoizeTrajectoryPath(
      trajectory.a.location.x,
      trajectory.a.location.y,
      trajectory.b.location.x,
      trajectory.b.location.y,
      trajectory,
    );
  }

}
