import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';
import { Observable } from 'rxjs';

import { AngularFire, AngularFireAuth, FirebaseAuthState } from 'angularfire2';

import { Identification } from '../';

@Injectable()
export class Service {
    currentUserObservable: Observable<Identification.RegisteredUser>;
    authStateObservable: Observable<FirebaseAuthState>;

    userRepos: Identification.RegisteredUserRepos;

    constructor( private af: AngularFire ) {
        this.userRepos = new Identification.RegisteredUserRepos( this.af, '/id/' );
        
        this.authStateObservable = ( this.af.auth as Observable<FirebaseAuthState> ).publishReplay(1).refCount();
        this.currentUserObservable = this.authStateObservable.flatMap( authState => {
            if( authState ) {
                return this.userRepos.get( { id: authState.auth.uid } );
            } else {
                return Observable.of( null );
            } 
        } ).publishReplay(1).refCount();
        this.firstLogin();
    } 
    
    firstLogin() {
        Observable.combineLatest( this.authStateObservable, this.currentUserObservable, ( authState, user ) => {
            if( ( authState !== null ) && ( user === null ) ) {
                return authState.auth.uid;
            } else {
                return null;
            }
        } )
        .do( ( uid ) => {
            if( uid ) {
                this.userRepos.set( new Identification.RegisteredUser( uid ) );
            }
        } )
        .take(1).subscribe( user => console.log( user ) );
    }
}
