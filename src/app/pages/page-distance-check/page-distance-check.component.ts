import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { Draggable } from '../../common/domain/draggable';
import { LocationConstraints } from '../../common/domain/location-constraints';
import { Circle } from '../../common/domain/circle';
import { Orbit } from '../../common/domain/orbit';
import { Colors } from '../../common/domain/colors';
import { ImageUrls } from '../../common/domain/image-urls';
import { SpaceObject } from '../../common/domain/space-object';
import { Craft } from '../../common/domain/craft';
import { CraftType } from '../../common/domain/craft-type';
import { Antenna } from '../../common/domain/antenna';
import { TransmissionLine } from '../../common/domain/transmission-line';
import { CustomAnimation } from '../../common/domain/custom-animation';
import { CameraComponent } from '../../components/camera/camera.component';

@Component({
  selector: 'cp-page-distance-check',
  templateUrl: './page-distance-check.component.html',
  styleUrls: ['./page-distance-check.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [CustomAnimation.animateFade],
})
export class PageDistanceCheckComponent {

  orbits: Orbit[];
  transmissionLines: TransmissionLine[];
  celestialBodies: SpaceObject[];
  crafts: Craft[] = [];

  constructor(private _cdr: ChangeDetectorRef) {
    let orbits = {
      kerbin: new Orbit(new Circle(500, 500, 200), Colors.OrbitLineKerbin),
      eve: new Orbit(new Circle(500, 500, 150), Colors.OrbitLineEve),
    };
    this.orbits = Object.values(orbits);

    this.celestialBodies = [
      new SpaceObject(80, 'Kerbol', ImageUrls.Kerbol, LocationConstraints.noMove(500, 500)),
      new SpaceObject(40, 'Kerbin', ImageUrls.Kerbin, LocationConstraints.circularMove(orbits.kerbin.parameters),
        [Antenna.Dsn1]),
      new SpaceObject(40, 'Eve', ImageUrls.Eve, LocationConstraints.circularMove(orbits.eve.parameters)),
    ];

    this.addCraft();
    let oldCraft = this.crafts[0];
    let newCraft = new Craft('renamed craft', oldCraft.craftType, oldCraft.constrainLocation, [Antenna.Communotron16]);
    this.replaceCraft(oldCraft, newCraft);

    this.addCraft();
    let oldCraftB = this.crafts[1];
    let newCraftB = new Craft('rescue boi', oldCraftB.craftType, LocationConstraints.anyMove(600, 300),
      [Antenna.Communotron16, Antenna.Communotron16, Antenna.HG5HighGainAntenna]);
    this.replaceCraft(oldCraftB, newCraftB);

    this.updateTransmissionLines();
  }

  private getIndexOfSameCombination = (parentItem, list) => list.findIndex(item => item.every(so => parentItem.includes(so)));

  private updateTransmissionLines() {
    this.transmissionLines = [...this.celestialBodies, ...this.crafts]
      .filter(so => so.antennae.length)
      .joinSelf()
      .distinct(this.getIndexOfSameCombination)
      .distinct(this.getIndexOfSameCombination) // opposing permutations are still similar as combinations
      .map(pair => this.transmissionLines?.find(t => pair.every(n => t.nodes.includes(n)))
        ?? new TransmissionLine(pair))
      .filter(tl => tl.strength);
  }

  startBodyDrag(body: Draggable, event: MouseEvent, screen: HTMLDivElement, camera?: CameraComponent) {
    body.startDrag(event, screen, () => this.updateUniverse(), camera);
  }

  private updateUniverse() {
    this.updateTransmissionLines();
    this._cdr.markForCheck();
  }

  addCraft() {
    let craft = new Craft('Untitled Craft(42)', CraftType.Relay, LocationConstraints.anyMove(300, 300));
    this.crafts.push(craft);
  }

  replaceCraft(oldCraft: Craft, newCraft: Craft) {
    this.crafts.replace(oldCraft, newCraft);
  }

  editCelestialBody(body: SpaceObject) {
    console.log('body');
  }

  editCraft(craft: Craft) {
    console.log('craft');
  }
}
