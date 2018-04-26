import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { NgWelcomeModule } from '../lib/public_api';
import { PortalModule } from '@angular/cdk/portal';

@NgModule({
	declarations: [AppComponent],
	imports: [BrowserModule, PortalModule, NgWelcomeModule],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule {}
