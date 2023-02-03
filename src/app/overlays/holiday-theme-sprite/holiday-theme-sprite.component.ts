import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { Common } from '../../common/common';
import { PathController } from './path-controller';
import { HolidayType } from './holiday-type';
import { SpriteContents } from './sprite-contents';
import { SpriteList } from './sprite-list';
import { animate, style, transition, trigger } from '@angular/animations';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'cp-holiday-theme-sprite',
  templateUrl: './holiday-theme-sprite.component.html',
  styleUrls: ['./holiday-theme-sprite.component.scss'],
  animations: [
    trigger('blurOut', [
      transition(':leave', [
        style({opacity: '*', filter: 'blur(0)'}),
        animate('.7s ease-out', style({opacity: .3, filter: 'blur(10px)'}))]),
    ]),
  ],
})
export class HolidayThemeSpriteComponent implements OnInit {

  @Output() noThemeDetected = new EventEmitter<void>();

  sprites: SpriteContents[];

  constructor(@Inject(DOCUMENT) private document: Document) {
  }

  ngOnInit() {
    let holidayType = this.getHolidayType();
    switch (holidayType) {
      case HolidayType.Christmas:
        this.setupChristmasSprites();
        break;
      case HolidayType.Halloween:
        this.setupHalloweenSprites();
        break;
      case HolidayType.KspFree:
        this.setupKspFreeSprites();
        break;
      default:
        this.noThemeDetected.emit();
        break;
    }
  }

  getHolidayType(): HolidayType {
    let dates = [
      {month: 12, day: 25, pre: 15, post: 5, holidayType: HolidayType.Christmas},
      {month: 10, day: 31, pre: 10, post: 1, holidayType: HolidayType.Halloween},
      // {month: 1, day: 5, pre: 1, post: 7, holidayType: HolidayType.KspFree},
    ];

    let dateMap = dates.reduce((sum, c) => {
      let countOfSurroundingDays = c.pre + 1 + c.post;
      let stringKeys = Common.listNumbers(countOfSurroundingDays)
        .map((n, i) => {
          let testDate = new Date();
          testDate.setMonth(c.month - 1); // JS getMonth() uses 0 base index
          testDate.setDate(c.day - c.pre + i);
          // add pre/post dates, to start showing the holiday event in the days leading up and after
          return `${testDate.getMonth()},${testDate.getDate()}`;
        });

      stringKeys.forEach(k => sum[k] = c.holidayType);
      return sum;
    }, {});

    let now = new Date();
    return dateMap[`${now.getMonth()},${now.getDate()}`];
  }

  private setupChristmasSprites() {
    let sprites = Object.values(SpriteList.Xmas);
    this.sprites = [
      ...Common.listNumbers(6)
        .map(() => ({
          source: `assets/holiday-sprites/${sprites.random()}`,
          opacity: .7,
          pathController: new PathController('snow'),
        })),
      ...Common.listNumbers(6)
        .map(() => ({
          source: `assets/holiday-sprites/${SpriteList.Xmas.snowflake}`,
          pathController: new PathController('snow'),
        })),
    ] as SpriteContents[];
  }

  private setupHalloweenSprites() {
    let sprites = Object.values(SpriteList.Halloween);
    this.sprites = [
      ...Common.listNumbers(4)
        .map(() => ({
          source: `assets/holiday-sprites/${sprites.random()}`,
          opacity: .7,
          pathController: new PathController('spooky'),
        })),
    ] as SpriteContents[];

    let duna = this.document.querySelector('[style*="duna.png"]') as HTMLDivElement;
    duna.style.background = duna.style.background.replace(
      'stock/kerbol-system-icons/duna.png',
      'holiday-sprites/halloween-pumpkin-1.png');
    duna.style.scale = '1.3';
    duna.style.translate = '6px -4px';
  }

  private setupKspFreeSprites() {
    let sprites = SpriteList.KspFree;
    this.sprites = [
      {
        source: `assets/holiday-sprites/${sprites.box}`,
        opacity: 1,
        pathController: new PathController('free'),
      },
      {
        source: `assets/holiday-sprites/${sprites.text}`,
        opacity: 1,
        pathController: new PathController('free'),
      },
      {
        source: `assets/holiday-sprites/${sprites.epic}`,
        opacity: 1,
        pathController: new PathController('free'),
      },
    ] as SpriteContents[];
  }

}
