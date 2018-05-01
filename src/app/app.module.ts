import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { NgWelcomeModule } from '../lib/public_api';

@NgModule({
	declarations: [AppComponent],
	imports: [BrowserModule, NgWelcomeModule, NgbModule.forRoot()],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule {}
