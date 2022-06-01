import { Injectable } from '@angular/core';
import { AdSizeType } from '../components/ad/ad.component';
import { Vector2 } from '../../common/domain/vector2';
import { BehaviorSubject, timer } from 'rxjs';

class AdDetails {
  slot: number;
  sizeType: AdSizeType;
  claimed?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AdDispenserService {

  private adSlotsDetails: { [key: number]: AdDetails };
  private adSlotsBySize: { [key: string]: AdDetails[] };
  private googleAdsScriptId = 'google-ads-script';
  private sizeToDimensionsMap = {
    'leaderboard': new Vector2(728, 90),
    'mobile-banner': new Vector2(300, 50),
    'square-large': new Vector2(336, 280),
    'square-small': new Vector2(200, 200),
    'vertical': new Vector2(160, 600),
  };

  isAdsRemoved: boolean;
  isAdBlocked$ = new BehaviorSubject<boolean>(false);

  constructor() {
    this.adSlotsDetails = ads.reduce((sum, c) => {
      sum[c.slot] = c;
      return sum;
    }, {});

    this.adSlotsBySize = sizes.reduce((sum, size) => {
      sum[size] = ads.filter(({sizeType}) => sizeType === size);
      return sum;
    }, {});
  }

  claimAd(sizeType: AdSizeType): { slot: number, dimensions: Vector2 } {
    let availableAd = this.adSlotsBySize[sizeType].find(a => !a.claimed);
    if (!availableAd) {
      return null;
    }

    availableAd.claimed = true;

    return {
      slot: availableAd.slot,
      dimensions: this.sizeToDimensionsMap[sizeType],
    };
  }

  restoreAdSlot(adSlot: number) {
    let adDetail = this.adSlotsDetails[adSlot];
    adDetail.claimed = false;
  }

  removeAds() {
    let scriptTag = document.getElementById(this.googleAdsScriptId);
    scriptTag?.remove();

    this.isAdsRemoved = true;
  }

  addAds() {
    let script = (document as any).createElement('script') as HTMLScriptElement;
    script.src = googleAdUrl;
    script.crossOrigin = 'anonymous';
    script.id = this.googleAdsScriptId;
    script.onerror = () => this.isAdBlocked$.next(true);
    let didLoad = false;
    script.onload = () => didLoad = true;

    document.head.appendChild(script);

    timer(5e3).subscribe(() => this.isAdBlocked$.next(!didLoad));
  }
}

const googleAdUrl = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7846079674092282'

const sizes: AdSizeType[] = [
  'leaderboard',
  'mobile-banner',
  'square-small',
  'square-large',
  'vertical',
];

const ads: AdDetails[] = [
  {
    sizeType: 'vertical',
    slot: 1913706144,
  },
  {
    sizeType: 'vertical',
    slot: 8423252094,
  },
  {
    sizeType: 'square-large',
    slot: 2015700382,
  },
  {
    sizeType: 'square-small',
    slot: 5789349891,
  },
  {
    sizeType: 'leaderboard',
    slot: 5050983298,
  },
  {
    sizeType: 'leaderboard',
    slot: 6364064964,
  },
  {
    sizeType: 'leaderboard',
    slot: 9862975208,
  },
  {
    sizeType: 'leaderboard',
    slot: 3314417720,
  },
  {
    sizeType: 'mobile-banner',
    slot: 5252989817
  },
  {
    sizeType: 'mobile-banner',
    slot: 9361956912
  },
  {
    sizeType: 'mobile-banner',
    slot: 1505316491
  },
  {
    sizeType: 'mobile-banner',
    slot: 4131479838
  },
];
