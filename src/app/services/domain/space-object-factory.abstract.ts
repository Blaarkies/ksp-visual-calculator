import { SoiManager } from './soi-manager';

/**
 * SpaceObjects that need access to global values (such as the universe
 * list of planetoids) can be created using factories to provide this
 * access.
 */
export abstract class AbstractSpaceObjectFactory {

  protected abstract soiManager: SoiManager;

}
