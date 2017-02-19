import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { ViewModule } from './view/view.module';
import { AppComponent } from './app.component';
import { AngularFireModule, AuthProviders, AuthMethods } from 'angularfire2';
import { AlertModule } from 'ng2-bootstrap';

import { Census } from './service/census';

const firebaseConfig = {
        apiKey: "AIzaSyDGS2xVjmK_q5HtLfOg5TztHz_Ftu00bQ8",
        authDomain: "ps2-rtmap-pts.firebaseapp.com",
        databaseURL: "https://ps2-rtmap-pts.firebaseio.com",
        storageBucket: "ps2-rtmap-pts.appspot.com",
        messagingSenderId: "1048696211507"
      };


const firebaseAuthConfig = {
        provider: AuthProviders.Google,
        method: AuthMethods.Redirect
};
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    ViewModule,
    BrowserModule,
    FormsModule,
    HttpModule,AlertModule.forRoot(),
    AngularFireModule.initializeApp( firebaseConfig, firebaseAuthConfig )
  ],
  providers: [ Census.Service ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
