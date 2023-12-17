import { Vector2 } from '../../common/domain/vector2';
import { Common } from '../../common/common';

export class PathController {

  height: number;
  path: string;
  duration: number;
  timingFunction: string | 'ease-in-out' | 'linear' = 'ease-in-out';

  private screen: Vector2;

  constructor(window: Window, type?: 'snow' | 'spooky' | 'free') {
    this.screen = new Vector2(window.innerWidth, window.innerHeight);

    if (type === 'snow') {
      this.height = Common.randomInt(10, 80);
      this.path = this.getSnowPath();
      let pointCount = this.path.split(' ').length;
      this.duration = Common.randomInt(pointCount - 1, pointCount + 1) * 2;

    } else if (type === 'spooky') {
      this.height = Common.randomInt(100, 180);
      this.path = this.getSpookyPath();
      let pointCount = this.path.split(' ').length;
      this.duration = Common.randomInt(pointCount - 1, pointCount + 1) * 5;
      this.timingFunction = 'cubic-bezier(.1, 1.4, 0, 0.6)'; // fast in, slow hover towards end

    } else {
      this.height = Common.randomInt(40, 80);
      this.path = this.getRandomPath();
      let pointCount = this.path.split(' ').length;
      this.duration = Common.randomInt(pointCount - 1, pointCount + 1) * 6;
    }
  }

  private getRandomPath(): string {
    let pointCount = Common.randomInt(3, 6);
    let points = Common.listNumbers(pointCount * 2) // pointCount must be even
      .map((n, i, self) => i === self.length - 1
        ? this.getRandomPointOutsideScreen()
        : this.getRandomPointInScreen());

    let pathCurve = points.reduce((sum, c, i) => {
      if (i === 0) {
        let radialPoint = this.getRandomPointOutsideScreen();
        sum.output += `M${radialPoint[0]},${radialPoint[1]}`;
      } else if (i % 2 === 0) {
        sum.output += ` ${c.join(',')}`;
      } else {
        sum.output += ` S${c.join(',')}`;
      }

      sum.last = c;
      return sum;
    }, {output: '', last: null})
      .output;

    return `path('${pathCurve}')`;
  }

  private getSnowPath(): string {
    let xStart = Common.randomInt(0, this.screen.x);
    let yStart = -100 * Common.randomInt(1, 8);

    let pointCount = Common.randomInt(3, 10); // pointCount must be even
    let points = Common.listNumbers(pointCount * 2)
      .map((n, i, self) => [
        xStart + 100 * (i % 2 === 0 ? -1 : 1) + Common.randomInt(0, 150),
        yStart + this.screen.y * (i / (self.length - 1)) + (i === self.length - 1 ? -yStart : 0),
      ])
      .map(([x, y]) => [Math.round(x), Math.round(y)]);

    let pathCurve = points.reduce((sum, c, i, self) => {
      if (i === 0) {
        sum.output += `M${c[0]},${c[1]}`;
      } else if (i % 2 === 0) {
        sum.output += ` ${c.join(',')}`;
      } else {
        sum.output += ` S${c.join(',')}`;
      }

      if (i === self.length - 1) {
        sum.output += ` ${c.join(',')}`;
      }

      sum.last = c;
      return sum;
    }, {output: '', last: null})
      .output;

    return `path('${pathCurve}')`;
  }

  private getSpookyPath(): string {
    let centerScreen = this.screen.clone().multiply(.5);

    let distanceFromCenterEnd = centerScreen.distance(Vector2.zero) * .5;
    let points = [
      this.getRandomPointOutsideScreen(),
      centerScreen.toList(),
      centerScreen.clone().addVector2(Vector2
        .fromDirection(Common.randomNumber(0, 7), distanceFromCenterEnd))
        .toList(),
    ]
      .map(([x, y]) => [Math.round(x), Math.round(y)]);

    let pathCurve = points.reduce((sum, c, i) => {
      if (i === 0) {
        let radialPoint = this.getRandomPointOutsideScreen();
        sum.output += `M${radialPoint[0]},${radialPoint[1]}`;
      } else if (i % 2 === 0) {
        sum.output += ` ${c.join(',')}`;
      } else {
        sum.output += ` S${c.join(',')}`;
      }

      sum.last = c;
      return sum;
    }, {output: '', last: null})
      .output;

    return `path('${pathCurve}')`;
  }

  private getRandomPointInScreen(): number[] {
    let screenShortestLength = Math.min(...this.screen.clone().subtract(200, 200).toList());
    let radialPoint = Vector2.fromDirection(Math.random() * Math.PI * 2)
      .multiply(screenShortestLength);
    return radialPoint.toList().map(n => Math.round(n));
  }

  private getRandomPointOutsideScreen(): number[] {
    let screenDiagonalLength = new Vector2(...this.screen.clone().add(200, 200).toList()).length;
    let radialPoint = Vector2.fromDirection(Math.random() * Math.PI * 2)
      .multiply(screenDiagonalLength);
    return radialPoint.toList().map(n => Math.round(n));
  }

}
