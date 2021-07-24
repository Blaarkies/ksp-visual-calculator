import { Vector2 } from './vector2';

describe('Vector2 class', () => {

  let vector: Vector2;
  beforeEach(() => {
    vector = new Vector2(0, 0);
  });

  it('static zero should return zeroed vector', () => {
    expect(Vector2.zero.x).toBe(0);
    expect(Vector2.zero.y).toBe(0);
  });

  it('static fromList() constructor', () => {
    vector = Vector2.fromList([1, 2]);
    expect(vector.x).toBe(1);
    expect(vector.y).toBe(2);
  });

  it('static fromDirection() constructor', () => {
    let degrees90 = Math.PI * .5;
    vector = Vector2.fromDirection(degrees90, 1);
    expect(vector.x).toBeCloseTo(0, 1);
    expect(vector.y).toBe(1);
  });

  it('length', () => {
    vector = new Vector2(10, 5);
    expect(vector.length).toBe(11.180339887498949);
  });

  it('set', () => {
    vector.set([1, 2]);
    expect(vector.x).toBe(1);
    expect(vector.y).toBe(2);
  });

  it('setVector2', () => {
    vector.setVector2(new Vector2(1, 2));
    expect(vector.x).toBe(1);
    expect(vector.y).toBe(2);
  });


  it('distance', () => {
    let distance = vector.distance(new Vector2(1, 2));
    expect(distance).toBe(2.23606797749979);
  });

  it('add', () => {
    vector.add(1, 2);
    expect(vector.x).toBe(1);
    expect(vector.y).toBe(2);
  });


  it('addVector2', () => {
    vector.addVector2(new Vector2(1, 2));
    expect(vector.x).toBe(1);
    expect(vector.y).toBe(2);
  });

  it('addVector2Clone', () => {
    let resultVector = vector.addVector2Clone(new Vector2(1, 2));
    expect(vector.x).toBe(0);
    expect(vector.y).toBe(0);

    expect(resultVector.x).toBe(1);
    expect(resultVector.y).toBe(2);
  });

  it('subtract', () => {
    vector.subtract(1, 2);
    expect(vector.x).toBe(-1);
    expect(vector.y).toBe(-2);
  });

  it('subtractVector2', () => {
    vector.subtractVector2(new Vector2(1, 2));
    expect(vector.x).toBe(-1);
    expect(vector.y).toBe(-2);
  });

  it('subtractVector2Clone', () => {
    let resultVector = vector.subtractVector2Clone(new Vector2(1, 2));
    expect(vector.x).toBe(0);
    expect(vector.y).toBe(0);

    expect(resultVector.x).toBe(-1);
    expect(resultVector.y).toBe(-2);
  });

  it('multiply', () => {
    vector = new Vector2(1, 2);
    vector.multiply(2);
    expect(vector.x).toBe(2);
    expect(vector.y).toBe(4);
  });

  it('multiplyVector2', () => {
    vector = new Vector2(1, 2);
    vector.multiplyVector2(new Vector2(2, 4));
    expect(vector.x).toBe(2);
    expect(vector.y).toBe(8);
  });

  it('clone', () => {
    let resultVector = vector.clone();
    expect(resultVector).not.toBe(vector);
  });

  it('lerp', () => {
    vector.lerp(new Vector2(1, 2), .5);
    expect(vector.x).toBe(.5);
    expect(vector.y).toBe(1);
  });

  it('lerpClone', () => {
    let resultVector = vector.lerpClone(new Vector2(1, 2), .5);
    expect(vector.x).toBe(0);
    expect(vector.y).toBe(0);
    expect(resultVector.x).toBe(.5);
    expect(resultVector.y).toBe(1);
  });

  it('toString', () => {
    expect(vector.toString()).toBe('0 0');
  });

  it('direction', () => {
    let direction = vector.direction(new Vector2(1, 2));
    expect(direction).toBe(1.1071487177940904);
  });

  it('toList', () => {
    expect(vector.toList()).toEqual([0, 0]);
  });

});
