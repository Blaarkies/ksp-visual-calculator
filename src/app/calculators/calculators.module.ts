import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { HammerModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatRippleModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatSliderModule } from '@angular/material/slider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { OverlayModule } from '@angular/cdk/overlay';
import { ImageCropperModule } from 'ngx-image-cropper';
import { MatStepperModule } from '@angular/material/stepper';
import { PortalModule } from '@angular/cdk/portal';
import { DraggableSpaceObjectComponent } from '../components/draggable-space-object/draggable-space-object.component';
import { OrbitLineComponent } from '../components/orbit-line/orbit-line.component';
import { TransmissionLineComponent } from '../components/transmission-line/transmission-line.component';
import { CameraComponent } from '../components/camera/camera.component';
import { MouseHoverDirective } from '../directives/mouse-hover.directive';
import { ActionPanelComponent } from '../components/action-panel/action-panel.component';
import { CraftDetailsDialogComponent } from '../overlays/craft-details-dialog/craft-details-dialog.component';
import { InputFieldComponent } from '../components/controls/input-field/input-field.component';
import { ValidationMessageComponent } from '../components/controls/validation-message/validation-message.component';
import { InputSelectComponent } from '../components/controls/input-select/input-select.component';
import { AntennaSelectorComponent } from '../components/antenna-selector/antenna-selector.component';
import { InputNumberComponent } from '../components/controls/input-number/input-number.component';
import {
  CelestialBodyDetailsDialogComponent
} from '../overlays/celestial-body-details-dialog/celestial-body-details-dialog.component';
import { InputToggleComponent } from '../components/controls/input-toggle/input-toggle.component';
import { InputFieldListComponent } from '../components/controls/input-field-list/input-field-list.component';
import {
  DifficultySettingsDialogComponent
} from '../overlays/difficulty-settings-dialog/difficulty-settings-dialog.component';
import { AnalyticsDialogComponent } from '../overlays/analytics-dialog/analytics-dialog.component';
import { PolicyDialogComponent } from '../overlays/policy-dialog/policy-dialog.component';
import { AccountDialogComponent } from '../overlays/account-dialog/account-dialog.component';
import { CreditsDialogComponent } from '../overlays/credits-dialog/credits-dialog.component';
import { BuyMeACoffeeDialogComponent } from '../overlays/buy-me-a-coffee-dialog/buy-me-a-coffee-dialog.component';
import { SimpleDialogComponent } from '../overlays/simple-dialog/simple-dialog.component';
import { FeedbackDialogComponent } from '../overlays/feedback-dialog/feedback-dialog.component';
import { InputTextAreaComponent } from '../components/controls/input-text-area/input-text-area.component';
import { WizardMessageComponent } from '../components/wizard-message/wizard-message.component';
import { WizardMarkerComponent } from '../components/wizard-marker/wizard-marker.component';
import { ZoomIndicatorComponent } from '../components/zoom-indicator/zoom-indicator.component';
import { SoiCircleComponent } from '../components/soi-circle/soi-circle.component';
import { AntennaStatsComponent } from '../components/antenna-stats/antenna-stats.component';
import { FocusJumpToPanelComponent } from '../components/focus-jump-to-panel/focus-jump-to-panel.component';
import { FaqDialogComponent } from '../overlays/faq-dialog/faq-dialog.component';
import { ContentPleatComponent } from '../components/content-pleat/content-pleat.component';
import { UserProfileComponent } from '../components/user-profile/user-profile.component';
import { ManageStateDialogComponent } from '../overlays/manage-state-dialog/manage-state-dialog.component';
import { UploadImageDialogComponent } from '../overlays/upload-image-dialog/upload-image-dialog.component';
import { StateDisplayComponent } from '../components/state-display/state-display.component';
import {
  StateEditNameRowComponent
} from '../overlays/manage-state-dialog/state-edit-name-row/state-edit-name-row.component';
import { FileDropDirective } from '../directives/file-drop.directive';
import { AccountDetailsComponent } from '../components/account-details/account-details.component';
import { DoublePointerActionDirective } from '../directives/double-pointer-action.directive';
import { HudComponent } from '../components/hud/hud.component';
import { ActionBottomSheetComponent } from '../overlays/list-bottom-sheet/action-bottom-sheet.component';
import { ActionListComponent } from '../components/action-list/action-list.component';
import { ActionFabComponent } from '../components/hud/action-fab/action-fab.component';
import { FaqSectionComponent } from '../overlays/faq-dialog/faq-section/faq-section.component';
import { UniverseMapComponent } from '../components/universe-map/universe-map.component';
import {
  ManeuverSequencePanelComponent
} from '../components/maneuver-sequence-panel/maneuver-sequence-panel.component';
import { MspListComponent } from '../components/maneuver-sequence-panel/msp-list/msp-list.component';
import { MspNodeComponent } from '../components/maneuver-sequence-panel/msp-node/msp-node.component';
import { MspEdgeComponent } from '../components/maneuver-sequence-panel/msp-edge/msp-edge.component';
import { MissionJourneyComponent } from '../components/mission-journey/mission-journey.component';
import { NegatePipe } from '../common/negate.pipe';
import { BasePanelComponent } from '../components/base-panel/base-panel.component';
import { PageSignalCheckComponent } from './components/page-signal-check/page-signal-check.component';
import { PageDvPlannerComponent } from './components/page-dv-planner/page-dv-planner.component';
import { PageCalculatorsComponent } from './components/page-calculators/page-calculators.component';
import { CalculatorsRoutingModule } from './calculators-routing.module';
import { AdsenseManagerModule } from '../adsense-manager/adsense-manager.module';
import {
  AccountEditDetailsComponent
} from '../components/account-details/account-edit-details/account-edit-details.component';


@NgModule({
  declarations: [
    CelestialBodyDetailsDialogComponent,
    CraftDetailsDialogComponent,
    DifficultySettingsDialogComponent,
    AnalyticsDialogComponent,
    PolicyDialogComponent,
    AccountDialogComponent,
    CreditsDialogComponent,
    BuyMeACoffeeDialogComponent,
    SimpleDialogComponent,
    FeedbackDialogComponent,
    UploadImageDialogComponent,
    FaqDialogComponent,
    ManageStateDialogComponent,

    // InputFieldComponent,
    // InputSelectComponent,
    // InputNumberComponent,
    // InputToggleComponent,
    InputFieldListComponent,
    InputTextAreaComponent,
    // ValidationMessageComponent,

    DraggableSpaceObjectComponent,
    OrbitLineComponent,
    CameraComponent,
    ActionPanelComponent,
    ZoomIndicatorComponent,
    SoiCircleComponent,
    FocusJumpToPanelComponent,
    ContentPleatComponent,
    UserProfileComponent,
    StateDisplayComponent,
    StateEditNameRowComponent,
    AccountDetailsComponent,
    AccountEditDetailsComponent,
    HudComponent,
    ActionBottomSheetComponent,
    ActionListComponent,
    ActionFabComponent,
    FaqSectionComponent,
    UniverseMapComponent,

    MouseHoverDirective,
    FileDropDirective,
    DoublePointerActionDirective,
    NegatePipe,

    TransmissionLineComponent,
    AntennaSelectorComponent,
    AntennaStatsComponent,

    ManeuverSequencePanelComponent,
    MspListComponent,
    MspNodeComponent,
    MspEdgeComponent,
    MissionJourneyComponent,

    WizardMessageComponent,
    WizardMarkerComponent,

    BasePanelComponent,
    PageSignalCheckComponent,
    PageDvPlannerComponent,
    PageCalculatorsComponent,
  ],
  imports: [
    InputSelectComponent,
    InputFieldComponent,
    ValidationMessageComponent,
    InputNumberComponent,
    InputToggleComponent,

    CommonModule,
    CalculatorsRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    OverlayModule,
    HammerModule,
    PortalModule,

    DragDropModule,
    MatFormFieldModule,
    MatInputModule,
    MatExpansionModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatListModule,
    MatDialogModule,
    MatSnackBarModule,
    MatSelectModule,
    MatRippleModule,
    MatMenuModule,
    MatSliderModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatBadgeModule,
    MatCardModule,
    MatTooltipModule,
    MatTabsModule,
    MatProgressBarModule,
    MatBottomSheetModule,
    MatStepperModule,

    ImageCropperModule,
    AdsenseManagerModule,
  ],
  providers: [
    {provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {duration: 4e3}},
  ],
})
export class CalculatorsModule {
}
