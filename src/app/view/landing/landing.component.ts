import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFire , FirebaseObjectObservable, FirebaseListObservable, AngularFireAuth, FirebaseRef } from 'angularfire2';
import * as firebase from 'firebase';       // required for timestamp
import { Subscription } from 'rxjs';

class IdentificationRequest {
    cid: string;
    ts = firebase.database.ServerValue.TIMESTAMP;
    constructor( cid: string ){
        this.cid = cid;
    }
}

class Identification {
    constructor( private uid: string, private af: AngularFire ) {}
    private url() { return '/idsrv/application/' + this.uid + '/apl'; }

    deleteRequest(): Promise<void> {
        return new Promise( ( resolve, reject ) => {
            if( this.uid ) {
                resolve( this.af.database.object( this.url() ).remove() );
            } else {
                reject( 'not logged in' );
            }
        });
    }
    
    registerRequest( cid: string ): Promise<any> {
        return new Promise( ( resolve, reject ) => {
            if( this.uid ) {
                resolve( this.af.database.object( this.url() ).set( new IdentificationRequest( cid ) ) );
            } else {
                reject( 'not logged in' );
            }
        } );
    }
}

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
                let request = new Identification( auth.auth.uid, af );
                this.msg = 'login as ' + auth.auth.displayName;
                request.deleteRequest()
                .then( success => {
                            console.log('succeed');
                            console.log(success);
                            }, fail => { console.log( 'failed' );
                        } );
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