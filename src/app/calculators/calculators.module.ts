import { NgModule } from '@angular/core';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { CraftDetailsDialogComponent } from '../overlays/craft-details-dialog/craft-details-dialog.component';
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
import { WizardMessageComponent } from '../components/wizard-message/wizard-message.component';
import { WizardMarkerComponent } from '../components/wizard-marker/wizard-marker.component';
import { FaqDialogComponent } from '../overlays/faq-dialog/faq-dialog.component';
import { ManageStateDialogComponent } from '../overlays/manage-state-dialog/manage-state-dialog.component';
import { PageCalculatorsComponent } from './components/page-calculators/page-calculators.component';
import { CalculatorsRoutingModule } from './calculators-routing.module';


@NgModule({
  imports: [
    // Use with spotlight service
    WizardMessageComponent,
    WizardMarkerComponent,

    CraftDetailsDialogComponent,
    DifficultySettingsDialogComponent,
    AnalyticsDialogComponent,
    PolicyDialogComponent,
    AccountDialogComponent,
    CreditsDialogComponent,
    BuyMeACoffeeDialogComponent,
    FeedbackDialogComponent,
    FaqDialogComponent,
    ManageStateDialogComponent,
    SimpleDialogComponent,

    PageCalculatorsComponent,
    CalculatorsRoutingModule,
    // HammerModule,
  ],
  providers: [
    {provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {duration: 4e3}},
  ],
})
export class CalculatorsModule {
}
