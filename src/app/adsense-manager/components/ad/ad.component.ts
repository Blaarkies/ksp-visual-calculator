import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AdDispenserService } from '../../services/ad-dispenser.service';
import { filter, interval, map, startWith, take, takeUntil, tap } from 'rxjs';
import { WithDestroy } from '../../../common/with-destroy';
import { CustomAnimation } from '../../../common/domain/custom-animation';

export type AdSizeType =
  'square-large'
  | 'square-small'
  | 'leaderboard'
  | 'mobile-banner'
  | 'vertical';

@Component({
  selector: 'cp-ad',
  template: `
    <ins #ins
         class="adsbygoogle"
         *ngIf="!!adSlot && !adDispenserService.isAdsRemoved"
         @widthHeight
         [style.display]="'block'"
         [style.width.px]="width"
         [style.height.px]="height"
         [attr.data-ad-client]="adClient"
         [attr.data-ad-slot]="adSlot"
         [attr.data-ad-format]="'inline'"></ins>`,
  animations: [CustomAnimation.widthHeight],
})
export class AdComponent extends WithDestroy() implements OnInit, OnDestroy, AfterViewInit {

  @Input() sizeType: AdSizeType;

  @ViewChild('ins') ins: ElementRef;

  adSlot: number;
  width: number;
  height: number;
  adClient = 'ca-pub-7846079674092282';

  constructor(@Inject(PLATFORM_ID) private platform: any,
              public adDispenserService: AdDispenserService) {
    super();
  }

  ngOnInit() {
    interval(5e3)
      .pipe(
        startWith(null),
        map(() => this.adDispenserService.claimAd(this.sizeType)),
        filter(claimedAd => !!claimedAd),
        tap(({slot, dimensions}) => {
          this.adSlot = slot;
          this.width = dimensions.x;
          this.height = dimensions.y;
        }),
        take(1),
        takeUntil(this.destroy$))
      .subscribe();
  }

  ngOnDestroy() {
    const iframe = this.ins?.nativeElement?.querySelector('iframe');
    if (iframe?.contentWindow) {
      iframe.src = 'about:blank';
      iframe.remove();
    }

    if (this.adSlot) {
      this.adDispenserService.restoreAdSlot(this.adSlot);
    }
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platform)) {
      this.pushAd();
    }
  }

  pushAd() {
    const p: Record<string, string | boolean> = {};

    if (window) {
      try {
        let windowAny = window as any;
        (windowAny.adsbygoogle = windowAny.adsbygoogle || []).push(p);
      } catch {
        // pass
      }
    }
  }

}
