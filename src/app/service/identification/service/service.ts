import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';
import { Observable } from 'rxjs';

import { AngularFire, AngularFireAuth, FirebaseAuthState } from 'angularfire2';

import { Identification } from '../';

@Injectable()
export class Service {
    currentUserObservable: Observable<Identification.User>;
    authStateObservable: Observable<FirebaseAuthState>;

    userRepos: Identification.UserRepos;

    constructor( private af: AngularFire ) {
        this.userRepos = new Identification.UserRepos( this.af, '/id/' );
        
        this.authStateObservable = ( this.af.auth as Observable<FirebaseAuthState> ).publish().refCount();
        this.currentUserObservable = this.authStateObservable.flatMap( authState => {
            if( authState.auth ) {
                return this.userRepos.get( { id: authState.auth.uid } );
            } else {
                return Observable.of( null );
            } 
        } ).publish().refCount();
    } 
}
