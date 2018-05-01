import {
	Component,
	ViewChild,
	ElementRef,
	ViewContainerRef,
	TemplateRef,
	AfterViewInit
} from '@angular/core';
import { Onboarding } from '../lib/public_api';
import { Subject } from 'rxjs/Subject';
import { takeUntil } from 'rxjs/operators/takeUntil';
import { switchMap } from 'rxjs/operators/switchMap';
import { filter } from 'rxjs/operators/filter';
import { merge } from 'rxjs/observable/merge';
import { tap } from 'rxjs/operators/tap';
import * as Chart from 'chart.js';
import { take } from 'rxjs/operators/take';

@Component({
	selector: 'ng-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
	private chartRendered = new Subject<void>();

	clicked = new Subject<void>();

	@ViewChild('chart') chartRef: ElementRef;
	@ViewChild('step1') step1Ref: TemplateRef<any>;
	@ViewChild('step2') step2Ref: TemplateRef<any>;

	constructor(private onboarding: Onboarding, private viewContainerRef: ViewContainerRef) {}

	ngAfterViewInit(): void {
		const ctx = this.chartRef.nativeElement.getContext('2d');
		const chart = new Chart(ctx, {
			type: 'bar',
			data: {
				labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
				datasets: [
					{
						label: '# of Votes',
						data: [12, 19, 3, 5, 2, 3],
						backgroundColor: [
							'rgba(255, 99, 132, 0.2)',
							'rgba(54, 162, 235, 0.2)',
							'rgba(255, 206, 86, 0.2)',
							'rgba(75, 192, 192, 0.2)',
							'rgba(153, 102, 255, 0.2)',
							'rgba(255, 159, 64, 0.2)'
						],
						borderColor: [
							'rgba(255,99,132,1)',
							'rgba(54, 162, 235, 1)',
							'rgba(255, 206, 86, 1)',
							'rgba(75, 192, 192, 1)',
							'rgba(153, 102, 255, 1)',
							'rgba(255, 159, 64, 1)'
						],
						borderWidth: 1
					}
				]
			},
			options: {
				animation: {
					onComplete: () => {
						this.chartRendered.next();
					}
				},
				scales: {
					yAxes: [
						{
							ticks: {
								beginAtZero: true
							}
						}
					]
				}
			}
		});
		this.start();
	}

	start(): void {
		this.chartRendered.pipe(take(1)).subscribe(() => {
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
							.pipe(
								takeUntil(merge(onboarding.afterNext$(), onboarding.beforeClose$()))
							)
					)
				)
				.subscribe(() => onboarding.next());
		});
	}
}
