import { SpaceObject } from './space-object';
import { SpaceObjectType } from './space-object-type';

describe('SpaceObject class', () => {

  it('constructor() creates a draggableHandle', () => {
    let so = new SpaceObject(1, 'A', '', 'noMove', SpaceObjectType.Star);
    expect(so.draggable).toBeDefined();
    expect(so.draggable.label).toBe('A');
    expect(so.draggable.moveType).toBe('noMove');
  });
});

