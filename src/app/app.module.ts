import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AppRoutingModule } from './app-routing.module';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { PageDistanceCheckComponent } from './pages/page-distance-check/page-distance-check.component';
import { DraggableSpaceObjectComponent } from './components/draggable-space-object/draggable-space-object.component';
import { OrbitLineComponent } from './components/orbit-line/orbit-line.component';
import { TransmissionLineComponent } from './components/transmission-line/transmission-line.component';

@NgModule({
  declarations: [
    AppComponent,
    PageDistanceCheckComponent,
    DraggableSpaceObjectComponent,
    OrbitLineComponent,
    TransmissionLineComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    MatToolbarModule,
    MatExpansionModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {
}
