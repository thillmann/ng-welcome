import { ElementRef, TemplateRef, ViewContainerRef } from '@angular/core';
import { PositionStrategy, ComponentType } from '@angular/cdk/overlay';
import { OnboardingStep } from './onboarding-step';

export interface OnboardingStepConfig {
	template: TemplateRef<any>;
	attachTo?: ElementRef;
	data?: any;
	position?: 'top' | 'left' | 'right' | 'bottom';
	offsetX?: number;
	offsetY?: number;
	hasHighlight?: boolean;
}

export interface OnboardingConfig {
	steps: OnboardingStepConfig[];
	hasBackdrop?: boolean;
	disableClose?: boolean;
	viewContainerRef?: ViewContainerRef;
	container?: ComponentType<OnboardingStep>;
}
