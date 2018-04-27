import { Component, ViewChild, ElementRef, ViewContainerRef, TemplateRef } from '@angular/core';
import { Onboarding } from '../lib/public_api';
import { Subject } from 'rxjs/Subject';
import { takeUntil } from 'rxjs/operators/takeUntil';
import { switchMap } from 'rxjs/operators/switchMap';
import { filter } from 'rxjs/operators/filter';
import { merge } from 'rxjs/observable/merge';
import { tap } from 'rxjs/operators/tap';

@Component({
	selector: 'ng-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent {
	title = 'app';

	clicked = new Subject<void>();

	@ViewChild('image') imageRef: ElementRef;
	@ViewChild('link') linkRef: ElementRef;
	@ViewChild('titleRef') titleRef: ElementRef;
	@ViewChild('first') step1Ref: TemplateRef<any>;
	@ViewChild('second') step2Ref: TemplateRef<any>;
	@ViewChild('third') step3Ref: TemplateRef<any>;
	@ViewChild('fourth') step4Ref: TemplateRef<any>;

	constructor(private onboarding: Onboarding, private viewContainerRef: ViewContainerRef) {}

	start(): void {
		const onboarding = this.onboarding.start({
			steps: [
				{
					content: this.step2Ref,
					attachTo: this.linkRef,
					position: 'top',
					offsetY: -20,
					data: 'Test'
				},
				{
					content: this.step1Ref,
					attachTo: this.imageRef,
					position: 'right',
					offsetX: 20
				},
				{
					content: this.step3Ref,
					attachTo: this.titleRef,
					position: 'bottom',
					offsetY: 20
				},
				{
					content: this.step4Ref
				}
			],
			viewContainerRef: this.viewContainerRef,
			disableClose: true
		});
		onboarding.afterOpen$().subscribe(() => {
			console.warn('Onboarding started');
		});
		onboarding.afterClosed$().subscribe(result => {
			if (result) {
				console.warn('Finished onboarding');
			} else {
				console.warn('Skipped onboarding');
			}
		});
		onboarding
			.afterNext$()
			.pipe(
				filter(idx => idx === 1),
				switchMap(() =>
					this.clicked
						.asObservable()
						.pipe(takeUntil(merge(onboarding.afterNext$(), onboarding.beforeClose$())))
				)
			)
			.subscribe(() => onboarding.next());
	}
}
