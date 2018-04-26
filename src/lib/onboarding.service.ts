import {
	Injectable,
	Injector,
	Inject,
	ApplicationRef,
	ComponentFactoryResolver,
	EmbeddedViewRef,
	NgZone,
	ViewContainerRef
} from '@angular/core';
import {
	Overlay,
	OverlayRef,
	OverlayConfig,
	OriginConnectionPosition,
	OverlayConnectionPosition,
	PositionStrategy,
	OverlayKeyboardDispatcher,
	OverlayPositionBuilder
} from '@angular/cdk/overlay';
import {
	PortalInjector,
	TemplatePortal,
	ComponentPortal,
	DomPortalOutlet,
	PortalOutlet,
	Portal,
	ComponentType
} from '@angular/cdk/portal';
import { OnboardingConfig, OnboardingStepConfig } from './onboarding-config';
import { OnboardingContainer } from './onboarding-container';
import { DOCUMENT } from '@angular/common';
import { Subject } from 'rxjs/Subject';
import { take } from 'rxjs/operators/take';
import { Observable } from 'rxjs/Observable';
import { OnboardingRef } from './onboarding-ref';

function getOriginPos(position?: 'left' | 'right' | 'top' | 'bottom'): OriginConnectionPosition {
	if (!position) {
		return {
			originX: 'center',
			originY: 'center'
		};
	}
	return {
		originX: position === 'left' ? 'start' : position === 'right' ? 'end' : 'center',
		originY: position === 'top' ? 'top' : position === 'bottom' ? 'bottom' : 'center'
	};
}

function getOverlayPos(position: 'left' | 'right' | 'top' | 'bottom'): OverlayConnectionPosition {
	if (!position) {
		return {
			overlayX: 'center',
			overlayY: 'center'
		};
	}
	return {
		overlayX: position === 'left' ? 'end' : position === 'right' ? 'start' : 'center',
		overlayY: position === 'top' ? 'bottom' : position === 'bottom' ? 'top' : 'center'
	};
}

let nextUniqueId = 0;

@Injectable()
export class Onboarding {
	private map = new WeakMap();
	constructor(
		@Inject(DOCUMENT) private document: any,
		private container: OnboardingContainer,
		private componentFactoryResolver: ComponentFactoryResolver,
		private appRef: ApplicationRef,
		private injector: Injector,
		private ngZone: NgZone,
		private keyboardDispatcher: OverlayKeyboardDispatcher,
		private position: OverlayPositionBuilder
	) {}

	private createHostElement(): HTMLElement {
		return this.container.getContainerElement();
	}

	private createPaneElement(host: HTMLElement): HTMLElement {
		const pane = this.document.createElement('div');
		pane.id = 'onboarding-' + nextUniqueId++;
		pane.classList.add('onboarding-pane');
		host.appendChild(pane);
		return pane;
	}

	private createPortalOutlet(pane: HTMLElement): DomPortalOutlet {
		return new DomPortalOutlet(pane, this.componentFactoryResolver, this.appRef, this.injector);
	}

	private createInjector(): PortalInjector {
		const injectorTokens = new WeakMap();
		return new PortalInjector(this.injector, injectorTokens);
	}

	private getGlobalStrategy(config: OnboardingStepConfig): PositionStrategy {
		return this.position
			.global()
			.centerHorizontally()
			.centerVertically();
	}

	private getAttachedToStrategy(config: OnboardingStepConfig): PositionStrategy {
		return this.position
			.connectedTo(
				config.attachTo,
				getOriginPos(config.position),
				getOverlayPos(config.position)
			)
			.withOffsetX(config.offsetX || 0)
			.withOffsetY(config.offsetY || 0);
	}

	private getOverlayConfig(
		config: OnboardingConfig,
		stepConfig: OnboardingStepConfig
	): OverlayConfig {
		const positionStrategy = stepConfig.attachTo
			? this.getAttachedToStrategy(stepConfig)
			: this.getGlobalStrategy(stepConfig);
		return new OverlayConfig({
			hasBackdrop: config.hasBackdrop,
			backdropClass: 'onboarding-backdrop',
			positionStrategy
		});
	}

	createOverlay(config: OnboardingConfig, stepConfig: OnboardingStepConfig): OverlayRef {
		const host = this.createHostElement();
		const pane = this.createPaneElement(host);
		const portalOutlet = this.createPortalOutlet(pane);
		return new OverlayRef(
			portalOutlet,
			pane,
			this.getOverlayConfig(config, stepConfig),
			this.ngZone,
			this.keyboardDispatcher,
			this.document
		);
	}

	start(config: OnboardingConfig): OnboardingRef {
		return new OnboardingRef(
			{ hasBackdrop: true, disableClose: false, ...config },
			this.injector,
			this
		);
	}
}
