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
    msg: string = 'test';
    constructor( private af: AngularFire ) {
        console.log( this.af.auth );
        this.authSubscriber = this.af.auth.subscribe( auth => {
            if( auth.auth ) {
                console.log(auth.auth.uid);
                this.msg = auth.auth.uid;
            } else {
                console.log( 'failed' );
            }
        } );
    }
    ngOnInit(){}
    ngOnDestroy() {
        this.authSubscriber.unsubscribe();
    }

    login() {
      this.af.auth.login();
      console.log( this.af.auth );
    }

    logout() {
       this.af.auth.logout();
       console.log( this.af.auth );
    }
}