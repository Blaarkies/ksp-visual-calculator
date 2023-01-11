import { Component } from '@angular/core';
import { PocketGridLinesComponent } from '../../components/pocket-grid-lines/pocket-grid-lines.component';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
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
