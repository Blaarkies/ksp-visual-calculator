import { Vector2 } from '../vector2';
import { LabeledOption } from '../input-fields/labeled-option';

export class CraftType {

  get spriteLocation(): Vector2 {
    // todo: sprite image is 512x512. test if 100x100 grid actually works
    switch (this) {
      case CraftType.Relay:
        return new Vector2(400, 100);
    }
  }

  constructor(public icon: string, private label: string) {
  }

  static Debris = new CraftType('debris', 'Debris');
  static Ship = new CraftType('ship', 'Ship');
  static Probe = new CraftType('probe', 'Probe');
  static Lander = new CraftType('lander', 'Lander');
  static Rover = new CraftType('rover', 'Rover');
  static Station = new CraftType('station', 'Station');
  static Base = new CraftType('base', 'Base');
  static Plane = new CraftType('plane', 'Plane');
  static Relay = new CraftType('relay', 'Relay');

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
