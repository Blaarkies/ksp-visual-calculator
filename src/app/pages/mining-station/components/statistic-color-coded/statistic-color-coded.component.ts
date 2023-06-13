import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BasicAnimations } from '../../../../animations/basic-animations';
import { Common } from '../../../../common/common';
import { Icons } from '../../../../common/domain/icons';
import { MouseHoverDirective } from '../../../../directives/mouse-hover.directive';

@Component({
  selector: 'cp-statistic-color-coded',
  standalone: true,
  imports: [
    CommonModule,
    MouseHoverDirective,
    OverlayModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './statistic-color-coded.component.html',
  styleUrls: ['./statistic-color-coded.component.scss'],
  animations: [BasicAnimations.width],
})
export class StatisticColorCodedComponent implements OnChanges {

  @Input() label: string;
  @Input() low: number = 0;
  @Input() high: number = 0;

  @Input() reverseSentiment: boolean = false;

  positionConnection = Common.createConnectionPair('↘');
  excess: number;
  isGood: boolean;
  icons = Icons;

  isOverlayOpen = false;
  isAnimating = false;
  isHoveringOverlay = false;

  set isOpen(value: boolean) {
    if (value !== this.isOverlayOpen) {
      this.isAnimating = true;
    }

    this.isOverlayOpen = value;
  }

  ngOnChanges(changes: SimpleChanges) {
    let difference = this.high - this.low;
    let excess = Common.formatNumberShort(difference);

    this.excess = excess;
    this.isGood = this.reverseSentiment
      ? excess <= 0
      : excess >= 0;
  }

  updateHoverOrigin(isHover: boolean) {
    if (this.isAnimating) {
      return;
    }
    if (!isHover && this.isHoveringOverlay) {
      return;
    }

    this.isOpen = isHover;
  }

  updateHoverOverlay(isHover: boolean) {
    this.isHoveringOverlay = isHover;
    if (this.isAnimating) {
      return;
    }
    this.isOpen = isHover;
  }

  clickedToClose() {
    if (this.isAnimating) {
      return;
    }
    this.isOpen = false;
  }
}
