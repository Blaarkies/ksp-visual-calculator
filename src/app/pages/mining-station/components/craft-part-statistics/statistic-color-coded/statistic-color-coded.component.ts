import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MouseHoverDirective } from '../../../../../directives/mouse-hover.directive';
import { BasicAnimations } from '../../../../../animations/basic-animations';
import { ConfigurableAnimations } from '../../../../../animations/configurable-animations';
import { Common } from '../../../../../common/common';

@Component({
  selector: 'cp-statistic-color-coded',
  standalone: true,
  imports: [
    CommonModule,
    MouseHoverDirective,
  ],
  templateUrl: './statistic-color-coded.component.html',
  styleUrls: ['./statistic-color-coded.component.scss'],
  animations: [
    BasicAnimations.expandX,
    ConfigurableAnimations.openCloseX(40),
  ],
})
export class StatisticColorCodedComponent implements OnChanges {

  @Input() low: number = 0;
  @Input() high: number = 0;

  @Input() reverseSentiment: boolean = false;

  excess: number;
  isGood: boolean;
  showDetails = false;

  ngOnChanges(changes: SimpleChanges) {
    let difference = this.high - this.low;
    let excess = Common.formatNumberShort(difference);

    this.excess = excess;
    this.isGood = this.reverseSentiment
      ? excess <= 0
      : excess >= 0;
  }

  updateHover(isHover: boolean) {
    this.showDetails = isHover;
  }

}
