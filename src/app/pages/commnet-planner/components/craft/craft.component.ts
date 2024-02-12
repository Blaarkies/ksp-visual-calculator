import { AsyncPipe } from '@angular/common';
import {
  Component,
  computed,
  EventEmitter,
  Input,
  Output,
  signal,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  map,
  Observable,
  shareReplay,
  startWith,
} from 'rxjs';
import { BasicAnimations } from '../../../../animations/basic-animations';
import { Icons } from '../../../../common/domain/icons';
import { Craft } from '../../../../common/domain/space-objects/craft';
import { DraggableSpaceObjectComponent } from '../../../../components/draggable-space-object/draggable-space-object.component';

@Component({
  selector: 'cp-craft',
  standalone: true,
  imports: [
    AsyncPipe,
    DraggableSpaceObjectComponent,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './craft.component.html',
  styleUrls: ['./craft.component.scss'],
  animations: [BasicAnimations.fade],
})
export class CraftComponent {

  @Input() set craft(value: Craft) {
    this.craftSig.set(value);

    this.altitude$ = value.change$.pipe(
      startWith(undefined),
      map(() => value.displayAltitude),
      shareReplay(1));
  }

  @Output() dragStart = new EventEmitter<PointerEvent>();
  @Output() focus = new EventEmitter<PointerEvent>();
  @Output() edit = new EventEmitter();

  icons = Icons;
  altitude$: Observable<string>;

  craftSig = signal<Craft>(null);
  imageUrlSig = computed(() => this.craftSig().draggable.imageUrl);
  locationXSig = computed(() => this.craftSig().spriteLocation.x);
  locationYSig = computed(() => this.craftSig().spriteLocation.y);
  isHover$Sig = computed(() => this.craftSig().draggable.isHover$);
  notConnected$Sig = computed(() =>
    this.craftSig().communication.hasControl$.stream$.pipe(map(v => !v)));

}
