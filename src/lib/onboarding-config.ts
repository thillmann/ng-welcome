import { ElementRef, TemplateRef, ViewContainerRef } from '@angular/core';
import { PositionStrategy, ComponentType } from '@angular/cdk/overlay';
import { OnboardingStep } from './onboarding-step';
import { Observable } from 'rxjs/Observable';

export interface OnboardingStepConfig {
	content: TemplateRef<any> | ComponentType<any>;
	attachTo?: ElementRef;
	data?: any;
	position?: 'top' | 'left' | 'right' | 'bottom';
	offsetX?: number;
	offsetY?: number;
	hasHighlight?: boolean;
	nextWhen?: () => Observable<any> | Observable<any>;
}

export interface OnboardingConfig {
	steps: OnboardingStepConfig[];
	hasBackdrop?: boolean;
	backdropClass?: string;
	disableClose?: boolean;
	closeOnNavigation?: boolean;
	nextOnArrowKeys?: boolean;
	viewContainerRef?: ViewContainerRef;
	container?: ComponentType<OnboardingStep>;
	smoothScroll?: boolean;
	autoFocus?: boolean;
}
