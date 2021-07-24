import { SpaceObject } from './space-object';
import { SpaceObjectType } from './space-object-type';

describe('SpaceObject class', () => {

  it('constructor() creates a draggableHandle', () => {
    let so = new SpaceObject(1, 'A', '', 'noMove', SpaceObjectType.Star);
    expect(so.draggableHandle).toBeDefined();
    expect(so.draggableHandle.label).toBe('A');
    expect(so.draggableHandle.moveType).toBe('noMove');
  });
});

