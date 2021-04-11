import { Vector2 } from '../vector2';
import { LabeledOption } from '../input-fields/labeled-option';

export class CraftType {

  constructor(public icon: string,
              private label: string,
              public iconLocation) {
  }

  // todo: sprite image is 512x512. test if 100x100 grid actually works
  static Debris = new CraftType('debris', 'Debris', new Vector2(400, 400));
  static Ship = new CraftType('ship', 'Ship', new Vector2(500, 400));
  static Probe = new CraftType('probe', 'Probe', new Vector2(400, 100));
  static Lander = new CraftType('lander', 'Lander', new Vector2(200, 100));
  static Rover = new CraftType('rover', 'Rover', new Vector2(500, 100));
  static Station = new CraftType('station', 'Station', new Vector2(200, 200));
  static Base = new CraftType('base', 'Base', new Vector2(300, 100));
  // todo: get plane icon
  static Plane = new CraftType('plane', 'Plane', new Vector2());
  // todo: get relay icon
  static Relay = new CraftType('relay', 'Relay', new Vector2(400, 100));

  private static All = [
    CraftType.Debris,
    CraftType.Ship,
    CraftType.Probe,
    CraftType.Lander,
    CraftType.Rover,
    CraftType.Station,
    CraftType.Base,
    CraftType.Plane,
    CraftType.Relay,
  ];

  static List = CraftType.All.map(ct => new LabeledOption(ct.label, ct));

}
