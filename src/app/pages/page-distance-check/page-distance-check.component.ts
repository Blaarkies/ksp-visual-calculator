import { ChangeDetectorRef, Component } from '@angular/core';
import { Draggable } from '../../common/domain/draggable';
import { LocationConstraints } from '../../common/domain/location-constraints';
import { Circle } from '../../common/domain/circle';
import { Orbit } from '../../common/domain/orbit';
import { Colors } from '../../common/domain/colors';
import { ImageUrls } from '../../common/domain/image-urls';
import { SpaceObject } from '../../common/domain/space-object';
import { Craft } from '../../common/domain/craft';
import { CraftType } from '../../common/domain/craft-type';

@Component({
  selector: 'cp-page-distance-check',
  templateUrl: './page-distance-check.component.html',
  styleUrls: ['./page-distance-check.component.scss'],
})
export class PageDistanceCheckComponent {

  celestialBodies: SpaceObject[];
  crafts: Craft[] = [];
  orbits: Orbit[];

  constructor(private _changeDetectorRef: ChangeDetectorRef) {
    let orbits = {
      kerbin: new Orbit(new Circle(500, 500, 200), Colors.OrbitLineKerbin),
      eve: new Orbit(new Circle(500, 500, 150), Colors.OrbitLineEve),
    };
    this.orbits = Object.values(orbits);

    this.celestialBodies = [
      new SpaceObject(80, 'Kerbol', ImageUrls.Kerbol, LocationConstraints.noMove(500, 500)),
      new SpaceObject(40, 'Kerbin', ImageUrls.Kerbin, LocationConstraints.circularMove(orbits.kerbin.parameters)),
      new SpaceObject(40, 'Eve', ImageUrls.Eve, LocationConstraints.circularMove(orbits.eve.parameters)),
    ];

    this.addCraft();
  }

  startBodyDrag(body: Draggable, event: MouseEvent, screen: HTMLDivElement) {
    body.startDrag(event, screen);
  }

  addCraft() {
    let craft = new Craft('Untitled Craft(42)', CraftType.Relay, LocationConstraints.anyMove(300, 300));
    this.crafts.push(craft);
  }

}
