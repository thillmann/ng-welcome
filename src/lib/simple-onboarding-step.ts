import {
	Component,
	ComponentRef,
	EmbeddedViewRef,
	ViewChild,
	ChangeDetectorRef
} from '@angular/core';
import { ComponentPortal, TemplatePortal, CdkPortalOutlet } from '@angular/cdk/portal';
import { FocusTrap, FocusTrapFactory } from '@angular/cdk/a11y';
import { ONBOARDING_ANIMATION } from './onboarding-animation';
import { OnboardingStep } from './onboarding-step';

@Component({
	selector: 'ng-onboarding-step',
	template: '<ng-template cdkPortalOutlet></ng-template>',
	styleUrls: ['./simple-onboarding-step.scss'],
	animations: [ONBOARDING_ANIMATION.slideOverlay],
	host: {
		tabindex: '-1',
		'[@slideOverlay]': 'state',
		'(@slideOverlay.start)': 'onAnimationStart($event)',
		'(@slideOverlay.done)': 'onAnimationDone($event)'
	}
})
export class SimpleOnboardingStep extends OnboardingStep {
	@ViewChild(CdkPortalOutlet) portalOutlet: CdkPortalOutlet;

	constructor(changeDetectorRef: ChangeDetectorRef, focusTrapFactory: FocusTrapFactory) {
		super(changeDetectorRef, focusTrapFactory);
	}

	attachComponentPortal<T>(portal: ComponentPortal<T>): ComponentRef<T> {
		return this.portalOutlet.attachComponentPortal(portal);
	}
	attachTemplatePortal<C>(portal: TemplatePortal<C>): EmbeddedViewRef<C> {
		return this.portalOutlet.attachTemplatePortal(portal);
	}
}
