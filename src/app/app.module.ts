import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { ViewModule } from './view/view.module';
import { CensusService } from './service/census/census.service';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    ViewModule,
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [ CensusService ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
