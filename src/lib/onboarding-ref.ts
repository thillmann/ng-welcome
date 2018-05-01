import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { OnboardingStep } from './onboarding-step';
import { filter } from 'rxjs/operators/filter';
import { take } from 'rxjs/operators/take';
import { takeUntil } from 'rxjs/operators/takeUntil';
import { OnboardingConfig, OnboardingStepConfig } from './onboarding-config';
import { OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, TemplatePortal, PortalInjector } from '@angular/cdk/portal';
import { Injector, ComponentRef, NgZone, TemplateRef, ElementRef } from '@angular/core';
import { SimpleOnboardingStep } from './simple-onboarding-step';
import { Onboarding } from './onboarding.service';
import { tap } from 'rxjs/operators/tap';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs/Subscription';
import { ONBOARDING_DATA } from './onboarding-data';

const SHOWING_CLASS = 'onboarding-backdrop--showing';

function hasHighlight(config: OnboardingStepConfig): boolean {
	return config.attachTo && (config.hasHighlight === undefined || config.hasHighlight);
}

function scrollTo(element: HTMLElement, smoothScroll = true): void {
	element.scrollIntoView({
		block: 'end',
		inline: 'nearest',
		behavior: smoothScroll ? 'smooth' : 'instant'
	});
}

export class OnboardingRef {
	private result?: any;
	private currentStepIdx = -1;
	private currentStep: OnboardingStep;
	private backdropElement: HTMLElement;
	private elementFocusedBeforeDialogWasOpened: HTMLElement | null = null;
	private locationChanges: any = Subscription.EMPTY;
	private afterOpen = new Subject<void>();
	private beforeClose = new Subject<any>();
	private afterClosed = new Subject<any>();
	private afterNext = new Subject<number>();
	private backdropClick = new Subject<MouseEvent>();

	constructor(
		private config: OnboardingConfig,
		private injector: Injector,
		private ngZone: NgZone,
		private onboarding: Onboarding,
		private document?: any,
		private location?: Location
	) {
		if (this.config.hasBackdrop) {
			this.attachBackdrop();
		}
		if (this.location && this.config.closeOnNavigation) {
			this.locationChanges = this.location.subscribe(() => this.close());
		}
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

	private savePreviouslyFocusedElement(): void {
		if (this.document) {
			this.elementFocusedBeforeDialogWasOpened = this.document.activeElement as HTMLElement;
		}
	}

	private attachBackdrop(): void {
		this.backdropElement = this.onboarding.createBackdrop(this.config.backdropClass);
		this.backdropElement.addEventListener('click', (event: MouseEvent) =>
			this.backdropClick.next(event)
		);
		if (typeof requestAnimationFrame !== 'undefined') {
			this.ngZone.runOutsideAngular(() => {
				requestAnimationFrame(() => {
					if (this.backdropElement) {
						this.backdropElement.classList.add(SHOWING_CLASS);
					}
				});
			});
		} else {
			this.backdropElement.classList.add(SHOWING_CLASS);
		}
	}

	private detachBackdrop(): void {
		const backdropToDetach = this.backdropElement;
		if (backdropToDetach) {
			const finishDetach = () => {
				if (backdropToDetach && backdropToDetach.parentNode) {
					backdropToDetach.parentNode.removeChild(backdropToDetach);
				}
				if (this.backdropElement === backdropToDetach) {
					this.backdropElement = null;
				}
			};
			backdropToDetach.classList.remove(SHOWING_CLASS);
			if (this.config.backdropClass) {
				backdropToDetach.classList.remove(
					this.config.backdropClass || 'onboarding-backdrop'
				);
			}

			backdropToDetach.addEventListener('transitionend', finishDetach);
			backdropToDetach.style.pointerEvents = 'none';
			this.ngZone.runOutsideAngular(() => setTimeout(finishDetach, 500));
		}
	}

	private createInjector(data: any): PortalInjector {
		const injectorTokens = new WeakMap();
		injectorTokens.set(OnboardingRef, this);
		injectorTokens.set(ONBOARDING_DATA, data);
		return new PortalInjector(this.injector, injectorTokens);
	}

	private createOverlay(config: OnboardingStepConfig): OverlayRef {
		return this.onboarding.createOverlay(this.config, config);
	}

	private attachOnboardingStep(config: OnboardingStepConfig): void {
		this.savePreviouslyFocusedElement();
		const overlayRef = this.createOverlay(config);
		const componentRef: ComponentRef<OnboardingStep> = overlayRef.attach(
			new ComponentPortal(
				this.config.container || SimpleOnboardingStep,
				this.config.viewContainerRef,
				this.injector
			)
		);
		const containerInstance = componentRef.instance;
		containerInstance.overlayRef = overlayRef;
		containerInstance.config = config;
		containerInstance.onboardingConfig = this.config;
		if (config.content instanceof TemplateRef) {
			containerInstance.attachTemplatePortal(
				new TemplatePortal(config.content, this.config.viewContainerRef, {
					$implicit: config.data,
					onboardingRef: this
				})
			);
		} else {
			containerInstance.attachComponentPortal(
				new ComponentPortal(
					config.content,
					this.config.viewContainerRef,
					this.createInjector(config.data)
				)
			);
		}

		if (hasHighlight(config)) {
			config.attachTo.nativeElement.classList.add('onboarding-element');
		}

		if (config.attachTo) {
			containerInstance.animationStateChanged$
				.pipe(
					filter(event => event.phaseName === 'start' && event.toState === 'enter'),
					take(1)
				)
				.subscribe(
					() =>
						config.attachTo &&
						scrollTo(config.attachTo.nativeElement, this.config.smoothScroll)
				);
		}

		containerInstance.animationStateChanged$
			.pipe(filter(event => event.phaseName === 'start' && event.toState === 'exit'), take(1))
			.subscribe(() => {
				if (hasHighlight(config)) {
					config.attachTo.nativeElement.classList.remove('onboarding-element');
				}
			});

		containerInstance.animationStateChanged$
			.pipe(filter(event => event.phaseName === 'done' && event.toState === 'exit'), take(1))
			.subscribe(() => {
				overlayRef.dispose();
			});

		if (!this.config.disableClose) {
			if (this.config.hasBackdrop) {
				this.backdropClick.pipe(takeUntil(this.afterNext)).subscribe(() => {
					this.close();
				});
			}
			overlayRef
				.keydownEvents()
				.pipe(takeUntil(this.afterNext), filter(event => event.key === 'Escape'))
				.subscribe(() => this.close());
		}

		if (this.config.nextOnArrowKeys) {
			overlayRef
				.keydownEvents()
				.pipe(
					takeUntil(this.afterNext),
					filter(event => event.key === 'ArrowLeft' || event.key === 'ArrowRight')
				)
				.subscribe(event => {
					if (event.key === 'ArrowRight') {
						this.next();
					} else {
						this.next(true);
					}
				});
		}

		this.currentStep = containerInstance;
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
				if (this.config.hasBackdrop) {
					this.detachBackdrop();
				}
				this.beforeClose.next(result);
				this.beforeClose.complete();
			});

		this.currentStep.animationStateChanged$
			.pipe(filter(event => event.phaseName === 'done'), take(1))
			.subscribe(() => {
				this.locationChanges.unsubscribe();
				this.afterClosed.next(this.result);
				this.afterClosed.complete();
				this.afterNext.complete();
				this.currentStep = null;
				this.onboarding = null;
				this.injector = null;

				const toFocus = this.elementFocusedBeforeDialogWasOpened;
				if (toFocus && typeof toFocus.focus === 'function') {
					toFocus.focus();
				}
				this.elementFocusedBeforeDialogWasOpened = null;
			});

		this.currentStep.startExitAnimation();
	}

	next(backwards?: boolean): void {
		const idx = backwards ? --this.currentStepIdx : ++this.currentStepIdx;
		if (idx < 0) {
			this.currentStepIdx++;
			return;
		}
		this.afterNext.next(this.currentStepIdx);
		if (idx > this.config.steps.length - 1) {
			return this.close();
		}
		const step = this.config.steps[idx];
		if (this.currentStep) {
			this.currentStep.startExitAnimation();
		}
		this.attachOnboardingStep(step);
	}
}
