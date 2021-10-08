import { AfterViewInit, Component, ElementRef, Input, OnInit } from '@angular/core';
import { MissionDestination, MissionNode } from '../maneuver-sequence-panel/maneuver-sequence-panel.component';
import { SpaceObject } from '../../common/domain/space-objects/space-object';
import { Icons } from '../../common/domain/icons';
import { CustomAnimation } from '../../common/domain/custom-animation';
import { fromEvent, Observable } from 'rxjs';
import { map, sampleTime, startWith, tap, throttleTime } from 'rxjs/operators';
import { Vector2 } from '../../common/domain/vector2';
import { CameraService } from '../../services/camera.service';

class TripTrajectory {
  sequence: number;
  a: SpaceObject;
  b?: SpaceObject;
}

@Component({
  selector: 'cp-mission-journey',
  templateUrl: './mission-journey.component.html',
  styleUrls: ['./mission-journey.component.scss'],
  animations: [CustomAnimation.animateFade],
})
export class MissionJourneyComponent implements AfterViewInit {

  @Input() set missionDestinations(value: MissionDestination[]) {
    console.log(value);
    
    if (!value.length) {
      this.trajectories = [];
      return;
    }

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
      });
  }

  @Input() scale: number;
  @Input() isAddingDestination: boolean;

  icons = Icons;
  mouseLocation$: Observable<Vector2>;
  trajectories: TripTrajectory[] = [];

  constructor(private cameraService: CameraService) {
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
        startWith(Vector2.zero))
  }

  hoverBody({body, hover}: { body: SpaceObject, hover: boolean }) {

  }

  getTrajectoryKey(index: number, item: TripTrajectory): string {
    return item.a.label + item.b?.label;
  }

}
