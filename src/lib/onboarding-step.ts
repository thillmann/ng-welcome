import { Component, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { BasePortalOutlet } from '@angular/cdk/portal';
import { AnimationEvent } from '@angular/animations';
import { OverlayRef } from '@angular/cdk/overlay';
import { Observable } from 'rxjs/Observable';

export abstract class OnboardingStep extends BasePortalOutlet {
	private state: 'enter' | 'exit' | 'void' = 'enter';
	private animationStateChanged = new EventEmitter<AnimationEvent>();

	overlayRef: OverlayRef;
	animationStateChanged$ = this.animationStateChanged.asObservable();

	constructor(private changeDetectorRef: ChangeDetectorRef) {
		super();
	}

	onAnimationStart(event: AnimationEvent): void {
		this.animationStateChanged.emit(event);
	}

	onAnimationDone(event: AnimationEvent): void {
		if (event.toState === 'enter') {
		} else if (event.toState === 'exit') {
		}

		this.animationStateChanged.emit(event);
	}

	startExitAnimation(): void {
		this.state = 'exit';
		this.changeDetectorRef.markForCheck();
	}
}
