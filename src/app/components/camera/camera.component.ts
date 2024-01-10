import { CommonModule } from '@angular/common';
import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnInit,
    ViewChild,
} from '@angular/core';
import {
    distinctUntilChanged,
    filter,
    finalize,
    fromEvent,
    map,
    Observable,
    sampleTime,
    scan,
    skip,
    startWith,
    switchMap,
    takeUntil,
} from 'rxjs';
import { Vector2 } from '../../common/domain/vector2';
import { WithDestroy } from '../../common/with-destroy';
import { CameraService } from '../../services/camera.service';
import { AbstractUniverseBuilderService } from '../../services/domain/universe-builder.abstract.service';

interface TouchCameraControl {
    dxy: Vector2;
    dz: number;
    lastLocation: Vector2;
}

@Component({
    selector: 'cp-camera',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './camera.component.html',
    styleUrls: ['./camera.component.scss'],
})
export class CameraComponent extends WithDestroy() implements OnInit {

    @ViewChild('cameraController', {static: true}) cameraController: ElementRef<HTMLDivElement>;
    @ViewChild('contentStack', {static: true}) contentStack: ElementRef<HTMLDivElement>;

    backboardScale = CameraService.backboardScale;

    get scale(): number {
        return this.cameraService?.scale;
    }

    get location(): Vector2 {
        return this.cameraService?.location ?? new Vector2();
    }

    constructor(cdr: ChangeDetectorRef,
                private cameraService: CameraService,
                private universeBuilderService: AbstractUniverseBuilderService,
                private window: Window) {
        super();
        this.cameraService.cameraChange$
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => cdr.markForCheck());
    }

    convertScreenToGameSpace(screenSpaceLocation: Vector2): Vector2 {
        return this.cameraService.convertScreenToGameSpace(screenSpaceLocation);
    }

    ngOnInit() {
        this.cameraService.cameraController = this.cameraController;
        this.cameraService.contentStack = this.contentStack;
        this.cameraService.getSoiParent =
            (location: Vector2) => this.universeBuilderService.getSoiParent(location);
    }

    updateScale(event: WheelEvent) {
        let zoomDirection = -event.deltaY.sign();

        let location = new Vector2(event.x, event.y);
        this.cameraService.zoomAt(1.07 * zoomDirection, location);
        event.preventDefault();
    }

    mouseDown(event: MouseEvent, screenSpace: HTMLDivElement) {
        if (!event.buttons.bitwiseIncludes(2) && !event.buttons.bitwiseIncludes(1)) {
            return;
        }

        fromEvent(screenSpace, 'mousemove')
            .pipe(
                map((move: MouseEvent) => [move.movementX, move.movementY]),
                takeUntil(fromEvent(screenSpace, 'mouseleave')),
                takeUntil(fromEvent(screenSpace, 'mouseup')),
                takeUntil(this.destroy$))
            .subscribe(([x, y]) => {
                this.cameraService.translate(x, y);
            });
    }

    touchStart(event: TouchEvent, screenSpace: HTMLDivElement) {
        let screenStyle = this.contentStack.nativeElement.style;
        let oldTransition = screenStyle.transition;
        screenStyle.transition = 'unset';

        fromEvent(screenSpace, 'touchmove')
            .pipe(
                startWith(event),
                distinctUntilChanged((x: TouchEvent, y: TouchEvent) => x.touches.length === y.touches.length),
                switchMap((touch: TouchEvent) => touch.touches.length === 1
                    ? this.getOneTouchStream(screenSpace)
                    : this.getMultiTouchStream(screenSpace)),
                finalize(() => screenStyle.transition = oldTransition),
                takeUntil(fromEvent(screenSpace, 'touchcancel')),
                takeUntil(fromEvent(screenSpace, 'touchend')
                    .pipe(filter((touch: TouchEvent) => touch.touches.length === 0))),
                takeUntil(this.destroy$))
            .subscribe(({dxy, dz, lastLocation}) => {
                if (dz !== 0) {
                    this.cameraService.zoomAt(1 + dz * .5, lastLocation.clone());
                }
                this.cameraService.translate(dxy.x, dxy.y);
            });
    }

    private getOneTouchStream(screenSpace: HTMLDivElement): Observable<TouchCameraControl> {
        return fromEvent(screenSpace, 'touchmove')
            .pipe(
                sampleTime(17),
                scan((acc, touch: TouchEvent) => {
                    let singleTouch = touch.touches[0];
                    let location = new Vector2(singleTouch.clientX, singleTouch.clientY);

                    acc.dxy = location.subtractVector2Clone(acc.lastLocation);
                    acc.lastLocation = location;
                    return acc;
                }, {dxy: undefined, dz: 0, lastLocation: new Vector2(0, 0)}),
                skip(1));
    }

    private getMultiTouchStream(screenSpace: HTMLDivElement): Observable<TouchCameraControl> {
        return fromEvent(screenSpace, 'touchmove')
            .pipe(
                sampleTime(17),
                scan((acc, touch: TouchEvent) => {
                    let locations = Array.from(touch.touches)
                        .map(t => new Vector2(t.clientX, t.clientY));
                    let meanLocation = locations.reduce((sum, v) => sum.addVector2(v), new Vector2())
                        .multiply(1 / locations.length);
                    let touchMeanDistance = locations.map(v => v.distance(meanLocation)).sum() / locations.length;

                    acc.dxy = meanLocation.subtractVector2Clone(acc.lastLocation)
                        .multiply(1 / locations.length);
                    acc.lastLocation = meanLocation;

                    acc.dz = (touchMeanDistance - acc.lastDistance) / acc.lastDistance.coerceAtLeast(1e-9);
                    acc.lastDistance = touchMeanDistance;
                    return acc;
                }, {dxy: undefined, dz: undefined, lastLocation: new Vector2(0, 0), lastDistance: 1}),
                skip(1));
    }

}
