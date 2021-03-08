import { Vector2 } from './vector2';

export class CraftType {

    get spriteLocation(): Vector2 {
      // todo: sprite image is 512x512. test if 100x100 grid actually works
        switch (this) {
            case CraftType.Relay:
                return new Vector2(400, 100);
        }
    }

    constructor(public icon: string) {
    }

    static Relay = new CraftType('relay');

}
