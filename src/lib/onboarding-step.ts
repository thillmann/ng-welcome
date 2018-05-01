import { Component, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { BasePortalOutlet } from '@angular/cdk/portal';
import { AnimationEvent } from '@angular/animations';
import { OverlayRef } from '@angular/cdk/overlay';
import { Observable } from 'rxjs/Observable';
import { FocusTrap, FocusTrapFactory } from '@angular/cdk/a11y';
import { OnboardingStepConfig, OnboardingConfig } from './public_api';

export abstract class OnboardingStep extends BasePortalOutlet implements OnDestroy {
	private state: 'enter' | 'exit' | 'void' = 'enter';
	private animationStateChanged = new EventEmitter<AnimationEvent>();
	private focusTrap?: FocusTrap;

	overlayRef: OverlayRef;
	config: OnboardingStepConfig;
	onboardingConfig: OnboardingConfig;
	animationStateChanged$ = this.animationStateChanged.asObservable();

	constructor(
		private changeDetectorRef: ChangeDetectorRef,
		private focusTrapFactory: FocusTrapFactory
	) {
		super();
	}

	private trapFocus(): void {
		if (!this.focusTrap) {
			this.focusTrap = this.focusTrapFactory.create(this.overlayRef.overlayElement);
		}

		if (this.onboardingConfig.autoFocus) {
			this.focusTrap.focusInitialElementWhenReady();
		}
	}

	ngOnDestroy(): void {
		this.focusTrap.destroy();
	}

	onAnimationStart(event: AnimationEvent): void {
		this.animationStateChanged.emit(event);
	}

	onAnimationDone(event: AnimationEvent): void {
		if (event.toState === 'enter') {
			this.trapFocus();
		}

		this.animationStateChanged.emit(event);
	}

	startExitAnimation(): void {
		this.state = 'exit';
		this.changeDetectorRef.markForCheck();
	}
}
