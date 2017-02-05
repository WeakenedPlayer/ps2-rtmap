import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFire , FirebaseObjectObservable, FirebaseListObservable, AngularFireAuth } from 'angularfire2';
import { Subscription } from 'rxjs';


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
            if( auth ) {
                this.msg = 'login as ' + auth.auth.displayName;
            } else {
                this.msg = 'logout';
            }
        } );
    }
    ngOnInit(){}
    ngOnDestroy() {
        this.authSubscriber.unsubscribe();
    }

    login() {
      this.af.auth.login();
    }

    logout() {
        console.log( this.af );
       this.af.auth.logout();
    }
}