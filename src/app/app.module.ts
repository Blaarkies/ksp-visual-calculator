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
import { PageSignalCheckComponent } from './pages/page-signal-check/page-signal-check.component';
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
import { InputSelectComponent } from './components/input-select/input-select.component';
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
import { PrivacyDialogComponent } from './dialogs/privacy-dialog/privacy-dialog.component';
import { AccountDialogComponent } from './dialogs/account-dialog/account-dialog.component';
import { CreditsDialogComponent } from './dialogs/credits-dialog/credits-dialog.component';
import { BuyMeACoffeeDialogComponent } from './dialogs/buy-me-a-coffee-dialog/buy-me-a-coffee-dialog.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatBadgeModule } from '@angular/material/badge';
import { SimpleDialogComponent } from './dialogs/simple-dialog/simple-dialog.component';
import { FeedbackDialogComponent } from './dialogs/feedback-dialog/feedback-dialog.component';
import { InputTextAreaComponent } from './components/input-text-area/input-text-area.component';
import { AppInfoActionPanelComponent } from './components/app-info-action-panel/app-info-action-panel.component';
import { WizardMessageComponent } from './components/wizard-message/wizard-message.component';
import { MatCardModule } from '@angular/material/card';
import { WizardMarkerComponent } from './components/wizard-marker/wizard-marker.component';
import { AngularFireAnalyticsModule } from '@angular/fire/analytics';
import { AngularFireModule } from '@angular/fire';
import { environment } from '../environments/environment';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ZoomIndicatorComponent } from './components/zoom-indicator/zoom-indicator.component';
import { SoiCircleComponent } from './components/soi-circle/soi-circle.component';
import { AntennaStatsComponent } from './components/antenna-stats/antenna-stats.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FocusJumpToPanelComponent } from './components/focus-jump-to-panel/focus-jump-to-panel.component';
import { FaqDialogComponent } from './dialogs/faq-dialog/faq-dialog.component';
import { ContentPleatComponent } from './components/content-pleat/content-pleat.component';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { ManageStateDialogComponent } from './dialogs/manage-state-dialog/manage-state-dialog.component';
import { StateDisplayComponent } from './components/state-display/state-display.component';
import { StateEditNameRowComponent } from './dialogs/manage-state-dialog/state-edit-name-row/state-edit-name-row.component';
import { FileDropDirective } from './directives/file-drop.directive';
import { AccountDetailsComponent } from './components/account-details/account-details.component';
import { DoublePointerActionDirective } from './directives/double-pointer-action.directive';
import { HudComponent } from './components/hud/hud.component';

@NgModule({
  declarations: [
    AppComponent,
    PageSignalCheckComponent,
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
    InputSelectComponent,
    AntennaSelectorComponent,
    InputNumberComponent,
    CelestialBodyDetailsDialogComponent,
    InputToggleComponent,
    InputFieldListComponent,
    DifficultySettingsDialogComponent,
    PrivacyDialogComponent,
    AccountDialogComponent,
    CreditsDialogComponent,
    BuyMeACoffeeDialogComponent,
    SimpleDialogComponent,
    FeedbackDialogComponent,
    InputTextAreaComponent,
    AppInfoActionPanelComponent,
    WizardMessageComponent,
    WizardMarkerComponent,
    ZoomIndicatorComponent,
    SoiCircleComponent,
    AntennaStatsComponent,
    FocusJumpToPanelComponent,
    FaqDialogComponent,
    ContentPleatComponent,
    UserProfileComponent,
    ManageStateDialogComponent,
    StateDisplayComponent,
    StateEditNameRowComponent,
    FileDropDirective,
    AccountDetailsComponent,
    DoublePointerActionDirective,
    HudComponent,
  ],
  imports: [
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAnalyticsModule,
    AngularFirestoreModule,
    AngularFireAuthModule,
    DragDropModule,
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
    MatSlideToggleModule,
    MatSnackBarModule,
    MatBadgeModule,
    MatCardModule,
    MatTooltipModule,
    MatTabsModule,
    MatProgressBarModule,
  ],
  providers: [
    {provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {duration: 4e3}},
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
