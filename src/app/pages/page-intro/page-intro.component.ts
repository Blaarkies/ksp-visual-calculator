import { Component } from '@angular/core';

@Component({
  selector: 'cp-page-intro',
  templateUrl: './page-intro.component.html',
  styleUrls: ['./page-intro.component.scss']
})
export class PageIntroComponent {

  calcDv = {
    result: 0,
    isp: 350,
    wet: 8,
    dry: 3,
    update: () => {
      let dv = this.calcDv.isp * 9.81 * Math.log(this.calcDv.wet / this.calcDv.dry);
      this.calcDv.result = dv.toInt();
    }
  };

  constructor() {
    this.calcDv.update();
  }

}
