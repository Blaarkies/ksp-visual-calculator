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
import { CameraComponent } from './components/camera/camera.component';
import { MouseHoverDirective } from './directives/mouse-hover.directive';
import { ActionPanelComponent } from './components/action-panel/action-panel.component';
import { EditUniverseActionPanelComponent } from './components/edit-universe-action-panel/edit-universe-action-panel.component';
import { CraftDetailsDialogComponent } from './dialogs/craft-details-dialog/craft-details-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { InputFieldComponent } from './components/input-field/input-field.component';
import { ValidationMessageComponent } from './components/validation-message/validation-message.component';
import { SelectComponent } from './components/select/select.component';
import { MatSelectModule } from '@angular/material/select';
import { MatRippleModule } from '@angular/material/core';
import { AntennaSelectorComponent } from './components/antenna-selector/antenna-selector.component';
import { InputNumberComponent } from './components/input-number/input-number.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatSliderModule } from '@angular/material/slider';
import { HttpClientModule } from '@angular/common/http';
import { CelestialBodyDetailsDialogComponent } from './dialogs/celestial-body-details-dialog/celestial-body-details-dialog.component';
import { InputToggleComponent } from './components/input-toggle/input-toggle.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { InputFieldListComponent } from './components/input-field-list/input-field-list.component';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS, MatSnackBarModule } from '@angular/material/snack-bar';
import { DifficultySettingsDialogComponent } from './dialogs/difficulty-settings-dialog/difficulty-settings-dialog.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

@NgModule({
  declarations: [
    AppComponent,
    PageDistanceCheckComponent,
    DraggableSpaceObjectComponent,
    OrbitLineComponent,
    TransmissionLineComponent,
    CameraComponent,
    MouseHoverDirective,
    ActionPanelComponent,
    EditUniverseActionPanelComponent,
    CraftDetailsDialogComponent,
    InputFieldComponent,
    InputFieldComponent,
    ValidationMessageComponent,
    SelectComponent,
    AntennaSelectorComponent,
    InputNumberComponent,
    CelestialBodyDetailsDialogComponent,
    InputToggleComponent,
    InputFieldListComponent,
    DifficultySettingsDialogComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatToolbarModule,
    MatExpansionModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatListModule,
    MatDialogModule,
    MatSelectModule,
    MatRippleModule,
    MatMenuModule,
    MatSliderModule,
    MatCheckboxModule,
    MatSnackBarModule,
  ],
  providers: [
    {provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {duration: 4e3}},
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
