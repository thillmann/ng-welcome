import { OnDestroy, Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable()
export class OnboardingContainer implements OnDestroy {
	private containerElement?: HTMLElement;

	constructor(@Inject(DOCUMENT) private document: any) {}

	private createContainer(): void {
		const container = this.document.createElement('div');
		container.classList.add('onboarding');
		this.document.body.appendChild(container);
		this.containerElement = container;
	}

	ngOnDestroy(): void {
		if (this.containerElement) {
			this.document.body.removeChild(this.containerElement);
		}
	}

	getContainerElement(): HTMLElement {
		if (!this.containerElement) {
			this.createContainer();
		}
		return this.containerElement;
	}
}
