import { AfterViewInit, Component, ElementRef, Input, OnInit } from '@angular/core';
import { MissionDestination } from '../maneuver-sequence-panel/maneuver-sequence-panel.component';
import { SpaceObject } from '../../common/domain/space-objects/space-object';
import { Icons } from '../../common/domain/icons';
import { CustomAnimation } from '../../common/domain/custom-animation';
import { fromEvent, Observable } from 'rxjs';
import { map, sampleTime, startWith, tap, throttleTime } from 'rxjs/operators';
import { Vector2 } from '../../common/domain/vector2';
import { CameraService } from '../../services/camera.service';

@Component({
  selector: 'cp-mission-journey',
  templateUrl: './mission-journey.component.html',
  styleUrls: ['./mission-journey.component.scss'],
  animations: [CustomAnimation.animateFade],
})
export class MissionJourneyComponent implements AfterViewInit {

  @Input() scale: number;
  @Input() missionDestinations: MissionDestination[];
  @Input() isAddingDestination: boolean;

  icons = Icons;
  mouseLocation$: Observable<Vector2>;

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

}
