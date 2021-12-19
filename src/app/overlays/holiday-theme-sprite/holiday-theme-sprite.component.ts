import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Common } from '../../common/common';
import { PathController } from './path-controller';
import { HolidayType } from './holiday-type';
import { SpriteContents } from './sprite-contents';
import { SpriteList } from './sprite-list';
import { animate, style, transition, trigger } from '@angular/animations';

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

  ngOnInit() {
    let holidayType = this.getHolidayType();
    switch (holidayType) {
      case HolidayType.Christmas:
        this.setupChristmasSprites();
        break;
      default:
        this.noThemeDetected.emit();
        break;
    }
  }

  getHolidayType(): HolidayType {
    let dates = [
      {month: 12, day: 25, holidayType: HolidayType.Christmas},
    ];

    let dateMap = dates.reduce((sum, c) => {
      let stringKeys = Common.listNumbers(4)
        .map((n, i) => {
          let testDate = new Date();
          testDate.setMonth(c.month - 1); // JS getMonth() uses 0 base index
          testDate.setDate(c.day - 2 + i);

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

}
