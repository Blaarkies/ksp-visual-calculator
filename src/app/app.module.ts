import { NgModule } from '@angular/core';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AppRoutingModule } from './app-routing.module';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { PageSignalCheckComponent } from './pages/page-signal-check/page-signal-check.component';
import { DraggableSpaceObjectComponent } from './components/draggable-space-object/draggable-space-object.component';
import { OrbitLineComponent } from './components/orbit-line/orbit-line.component';
import { TransmissionLineComponent } from './components/transmission-line/transmission-line.component';
import { CameraComponent } from './components/camera/camera.component';
import { MouseHoverDirective } from './directives/mouse-hover.directive';
import { ActionPanelComponent } from './components/action-panel/action-panel.component';
import { CraftDetailsDialogComponent } from './overlays/craft-details-dialog/craft-details-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { InputFieldComponent } from './components/controls/input-field/input-field.component';
import { ValidationMessageComponent } from './components/controls/validation-message/validation-message.component';
import { InputSelectComponent } from './components/controls/input-select/input-select.component';
import { MatSelectModule } from '@angular/material/select';
import { MatRippleModule } from '@angular/material/core';
import { AntennaSelectorComponent } from './components/antenna-selector/antenna-selector.component';
import { InputNumberComponent } from './components/controls/input-number/input-number.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatSliderModule } from '@angular/material/slider';
import { HttpClientModule } from '@angular/common/http';
import { CelestialBodyDetailsDialogComponent } from './overlays/celestial-body-details-dialog/celestial-body-details-dialog.component';
import { InputToggleComponent } from './components/controls/input-toggle/input-toggle.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { InputFieldListComponent } from './components/controls/input-field-list/input-field-list.component';
import { DifficultySettingsDialogComponent } from './overlays/difficulty-settings-dialog/difficulty-settings-dialog.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { PrivacyDialogComponent } from './overlays/privacy-dialog/privacy-dialog.component';
import { AccountDialogComponent } from './overlays/account-dialog/account-dialog.component';
import { CreditsDialogComponent } from './overlays/credits-dialog/credits-dialog.component';
import { BuyMeACoffeeDialogComponent } from './overlays/buy-me-a-coffee-dialog/buy-me-a-coffee-dialog.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatBadgeModule } from '@angular/material/badge';
import { SimpleDialogComponent } from './overlays/simple-dialog/simple-dialog.component';
import { FeedbackDialogComponent } from './overlays/feedback-dialog/feedback-dialog.component';
import { InputTextAreaComponent } from './components/controls/input-text-area/input-text-area.component';
import { WizardMessageComponent } from './components/wizard-message/wizard-message.component';
import { MatCardModule } from '@angular/material/card';
import { WizardMarkerComponent } from './components/wizard-marker/wizard-marker.component';
import { AngularFireAnalyticsModule } from '@angular/fire/analytics';
import { AngularFireModule } from '@angular/fire';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ZoomIndicatorComponent } from './components/zoom-indicator/zoom-indicator.component';
import { SoiCircleComponent } from './components/soi-circle/soi-circle.component';
import { AntennaStatsComponent } from './components/antenna-stats/antenna-stats.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FocusJumpToPanelComponent } from './components/focus-jump-to-panel/focus-jump-to-panel.component';
import { FaqDialogComponent } from './overlays/faq-dialog/faq-dialog.component';
import { ContentPleatComponent } from './components/content-pleat/content-pleat.component';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { ManageStateDialogComponent } from './overlays/manage-state-dialog/manage-state-dialog.component';
import { StateDisplayComponent } from './components/state-display/state-display.component';
import { StateEditNameRowComponent } from './overlays/manage-state-dialog/state-edit-name-row/state-edit-name-row.component';
import { FileDropDirective } from './directives/file-drop.directive';
import { AccountDetailsComponent } from './components/account-details/account-details.component';
import { DoublePointerActionDirective } from './directives/double-pointer-action.directive';
import { HudComponent } from './components/hud/hud.component';
import { ActionBottomSheetComponent } from './overlays/list-bottom-sheet/action-bottom-sheet.component';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { ActionListComponent } from './components/action-list/action-list.component';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS, MatSnackBarModule } from '@angular/material/snack-bar';
import { environment } from '../environments/environment';
import { ActionFabComponent } from './components/hud/action-fab/action-fab.component';
import { FaqSectionComponent } from './overlays/faq-dialog/faq-section/faq-section.component';
import { PageDvPlannerComponent } from './pages/page-dv-planner/page-dv-planner.component';
import { UniverseMapComponent } from './components/universe-map/universe-map.component';
import { ManeuverSequencePanelComponent } from './components/maneuver-sequence-panel/maneuver-sequence-panel.component';
import { MspListComponent } from './components/maneuver-sequence-panel/msp-list/msp-list.component';
import { MspNodeComponent } from './components/maneuver-sequence-panel/msp-node/msp-node.component';
import { MspEdgeComponent } from './components/maneuver-sequence-panel/msp-edge/msp-edge.component';
import { MissionJourneyComponent } from './components/mission-journey/mission-journey.component';
import { OverlayModule } from '@angular/cdk/overlay';

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
    ActionBottomSheetComponent,
    ActionListComponent,
    ActionFabComponent,
    FaqSectionComponent,
    PageDvPlannerComponent,
    UniverseMapComponent,
    ManeuverSequencePanelComponent,
    MspListComponent,
    MspNodeComponent,
    MspEdgeComponent,
    MissionJourneyComponent,
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
    MatBottomSheetModule,
    OverlayModule,
  ],
  providers: [
    {provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {duration: 4e3}},
  ],
  bootstrap: [AppComponent],
})
export class AppModule {

  constructor(matIconRegistry: MatIconRegistry, domSanitizer: DomSanitizer) {
    matIconRegistry.addSvgIconSet(
      domSanitizer.bypassSecurityTrustResourceUrl('./assets/mdi.svg')
    );
  }

}
