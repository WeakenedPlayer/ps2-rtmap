import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFire , FirebaseObjectObservable, FirebaseListObservable, AngularFireAuth, FirebaseRef } from 'angularfire2';
import * as firebase from 'firebase';       // required for timestamp
import { Subscription, Observable } from 'rxjs';
import { Identification } from '../../service';
import 'rxjs/add/operator/toPromise';

@Component({
  selector: 'landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit, OnDestroy {
    msg: string = 'n/a';
    isLoggedIn: boolean = false;
    constructor( private af: AngularFire, private idservice: Identification.Service ) {
        this.idservice.authStateObservable.subscribe( authState => {
            if( authState ) {
                this.msg = 'login as ' + authState.auth.displayName;
                this.isLoggedIn = true;
            } else {
                this.msg = 'logout';
                this.isLoggedIn = false;
            }
        } );
    }
    ngOnInit(){
        }
    ngOnDestroy() {}
    
    login() {
        if( this.af.auth ){
            this.af.auth.login();
        }
    }

    logout() {
        if( this.af.auth ) {
            this.af.auth.logout();
        } else {
            console.log( 'already logged out' );
        }
    }
}