import {
	Component,
	ViewChild,
	ElementRef,
	ViewContainerRef,
	TemplateRef,
	AfterViewInit
} from '@angular/core';
import { Onboarding } from '../lib/public_api';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { takeUntil } from 'rxjs/operators/takeUntil';
import { switchMap } from 'rxjs/operators/switchMap';
import { filter } from 'rxjs/operators/filter';
import { merge } from 'rxjs/observable/merge';
import { tap } from 'rxjs/operators/tap';
import * as Chart from 'chart.js';
import { take } from 'rxjs/operators/take';
import { Observable } from 'rxjs/Observable';

const points = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0].map((x, i) => ({
	x: i,
	y: Math.round(Math.random() * 10000) + 1000
}));

const DATA = {
	labels: points.map(x => {
		const date = new Date();
		date.setMonth(x.x);
		return date.toLocaleString('en-us', { month: 'long' });
	}),
	datasets: [
		{
			label: 'Revenue',
			data: points,
			borderColor: 'rgb(0, 123, 255)',
			backgroundColor: 'rgb(0, 123, 255, 0.25)'
		}
	]
};

@Component({
	selector: 'ng-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
	private chartRendered = new ReplaySubject<boolean>(1);

	onboardingFinished = false;
	onboardingResult = false;
	showAlert = true;

	@ViewChild('chart') chartRef: ElementRef;
	@ViewChild('sidebar') sidebarRef: ElementRef;
	@ViewChild('step1') step1Ref: TemplateRef<any>;
	@ViewChild('step2') step2Ref: TemplateRef<any>;
	@ViewChild('step3') step3Ref: TemplateRef<any>;
	@ViewChild('step4') step4Ref: TemplateRef<any>;

	constructor(private onboarding: Onboarding, private viewContainerRef: ViewContainerRef) {}

	ngAfterViewInit(): void {
		const ctx = this.chartRef.nativeElement.getContext('2d');
		const chart = new Chart(ctx, {
			type: 'line',
			data: DATA,
			options: {
				animation: {
					onComplete: () => {
						this.chartRendered.next(true);
					}
				},
				responsive: false
			}
		});
		this.start();
	}

	start(): void {
		const clicked$ = () => {
			return Observable.create(observer => {
				const links = this.sidebarRef.nativeElement.querySelectorAll('.nav-link');
				const linksArr = [];
				for (let i = 0; i < links.length; i++) {
					linksArr.push(links[i]);
				}
				const handleClick = event => observer.next(event);
				linksArr.forEach(link => link.addEventListener('click', handleClick));
				return () => {
					linksArr.forEach(link => link.removeEventListener('click', handleClick));
					observer.complete();
				};
			});
		};
		this.chartRendered.pipe(take(1)).subscribe(() => {
			this.onboardingFinished = false;
			this.onboardingResult = false;
			this.showAlert = true;
			const onboarding = this.onboarding.start({
				steps: [
					{
						content: this.step1Ref
					},
					{
						content: this.step2Ref,
						attachTo: this.chartRef,
						position: 'bottom',
						offsetY: 20
					},
					{
						content: this.step3Ref,
						attachTo: this.sidebarRef,
						position: 'right',
						offsetX: 20,
						nextWhen: clicked$
					},
					{
						content: this.step4Ref
					}
				],
				viewContainerRef: this.viewContainerRef,
				disableClose: true
			});
			onboarding.afterClosed$().subscribe(result => {
				this.onboardingResult = !!result;
				this.onboardingFinished = true;
			});
		});
	}
}
