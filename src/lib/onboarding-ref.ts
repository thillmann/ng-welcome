import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { OnboardingStep } from './onboarding-step';
import { filter } from 'rxjs/operators/filter';
import { take } from 'rxjs/operators/take';
import { takeUntil } from 'rxjs/operators/takeUntil';
import { OnboardingConfig, OnboardingStepConfig } from './onboarding-config';
import { OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, TemplatePortal } from '@angular/cdk/portal';
import { Injector, ComponentRef } from '@angular/core';
import { SimpleOnboardingStep } from './simple-onboarding-step';
import { Onboarding } from './onboarding.service';

function hasHighlight(config: OnboardingStepConfig): boolean {
	return config.attachTo && (config.hasHighlight === undefined || config.hasHighlight);
}

export class OnboardingRef {
	private result?: any;
	private currentStepIdx = -1;
	private currentStep: OnboardingStep;
	private afterOpen = new Subject<void>();
	private beforeClose = new Subject<any>();
	private afterClosed = new Subject<any>();
	private afterNext = new Subject<number>();

	constructor(
		private config: OnboardingConfig,
		private injector: Injector,
		private onboarding: Onboarding
	) {
		Promise.resolve().then(() => {
			this.next();

			this.currentStep.animationStateChanged$
				.pipe(
					filter(event => event.phaseName === 'done' && event.toState === 'enter'),
					take(1)
				)
				.subscribe(() => {
					this.afterOpen.next();
					this.afterOpen.complete();
				});
		});
	}

	private createOverlay(config: OnboardingStepConfig): OverlayRef {
		return this.onboarding.createOverlay(this.config, config);
	}

	private attachOnboardingStep(config: OnboardingStepConfig): OnboardingStep {
		const overlayRef = this.createOverlay(config);
		const componentRef: ComponentRef<OnboardingStep> = overlayRef.attach(
			new ComponentPortal(
				this.config.container || SimpleOnboardingStep,
				this.config.viewContainerRef,
				this.injector
			)
		);
		const containerInstance = componentRef.instance;
		containerInstance.attachTemplatePortal(
			new TemplatePortal(config.template, this.config.viewContainerRef, {
				$implicit: {},
				onboardingRef: this
			})
		);

		if (hasHighlight(config)) {
			config.attachTo.nativeElement.classList.add('onboarding-element');
		}

		containerInstance.animationStateChanged$
			.pipe(filter(event => event.phaseName === 'start' && event.toState === 'exit'), take(1))
			.subscribe(() => {
				if (this.config.hasBackdrop) {
					overlayRef.detachBackdrop();
				}
				if (hasHighlight(config)) {
					config.attachTo.nativeElement.classList.remove('onboarding-element');
				}
			});

		containerInstance.animationStateChanged$
			.pipe(filter(event => event.phaseName === 'done' && event.toState === 'exit'), take(1))
			.subscribe(() => {
				overlayRef.dispose();
			});

		if (this.config.hasBackdrop) {
			overlayRef
				.backdropClick()
				.pipe(takeUntil(this.afterNext))
				.subscribe(() => {
					if (!this.config.disableClose) {
						this.close();
					}
				});
		}

		return containerInstance;
	}

	afterOpen$(): Observable<void> {
		return this.afterOpen.asObservable();
	}

	beforeClose$(): Observable<any> {
		return this.beforeClose.asObservable();
	}

	afterClosed$(): Observable<any> {
		return this.afterClosed.asObservable();
	}

	afterNext$(): Observable<number> {
		return this.afterNext.asObservable();
	}

	close(result?: any): void {
		this.result = result;

		this.currentStep.animationStateChanged$
			.pipe(filter(event => event.phaseName === 'start'), take(1))
			.subscribe(() => {
				this.beforeClose.next(result);
				this.beforeClose.complete();
			});

		this.currentStep.animationStateChanged$
			.pipe(filter(event => event.phaseName === 'done'), take(1))
			.subscribe(() => {
				this.afterClosed.next(this.result);
				this.afterClosed.complete();
				this.afterNext.complete();
				this.currentStep = null;
				this.onboarding = null;
				this.injector = null;
			});

		this.currentStep.startExitAnimation();
	}

	next(backwards?: boolean): void {
		const idx = Math.max(backwards ? --this.currentStepIdx : ++this.currentStepIdx, 0);
		if (idx > this.config.steps.length - 1) {
			return this.close();
		}
		this.afterNext.next(this.currentStepIdx);
		const step = this.config.steps[idx];
		if (this.currentStep) {
			this.currentStep.startExitAnimation();
		}
		this.currentStep = this.attachOnboardingStep(step);
	}
}
