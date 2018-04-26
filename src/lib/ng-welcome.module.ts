import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { Onboarding } from './onboarding.service';
import { OnboardingContainer } from './onboarding-container';
import { OnboardingStep } from './onboarding-step';
import { SimpleOnboardingStep } from './simple-onboarding-step';

@NgModule({
	imports: [CommonModule, OverlayModule, PortalModule, BrowserAnimationsModule],
	exports: [],
	declarations: [SimpleOnboardingStep],
	entryComponents: [SimpleOnboardingStep],
	providers: [Onboarding, OnboardingContainer]
})
export class NgWelcomeModule {}
