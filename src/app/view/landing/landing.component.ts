import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFire , FirebaseObjectObservable, FirebaseListObservable, AngularFireAuth, FirebaseRef } from 'angularfire2';
import * as firebase from 'firebase';       // required for timestamp
import { Subscription, Observable } from 'rxjs';
import 'rxjs/add/operator/toPromise';

import * as Identification from '../../service/identification';

@Component({
  selector: 'landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit, OnDestroy {
    authSubscriber: Subscription;
    msg: string = 'n/a';
    constructor( private af: AngularFire ) {
        this.authSubscriber = this.af.auth.subscribe( auth => {
            this.authSubscriber.unsubscribe();
            if( auth ) {
                this.msg = 'login as ' + auth.auth.displayName;
                
            } else {
                this.msg = 'logout';
            }
        } );
        
    }
    ngOnInit(){}
    ngOnDestroy() {
    }

    login() {
      this.af.auth.login();
    }

    logout() {
       this.af.auth.logout();
    }
}