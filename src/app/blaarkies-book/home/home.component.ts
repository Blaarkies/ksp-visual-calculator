import { Component } from '@angular/core';
import { PocketManagerComponent } from '../../components/pocket-manager/pocket-manager.component';

@Component({
  standalone: true,
  selector: 'cp-bk-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [
    PocketManagerComponent,
  ],
})
export class HomeComponent {

  constructor() {

  }

}
