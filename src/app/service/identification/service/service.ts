import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';
import { Observable } from 'rxjs';
import { AngularFire, AngularFireAuth, FirebaseAuthState } from 'angularfire2';

import { Identification } from '../';
const root = '/ids/';

@Injectable()
export class Service {
    currentUserObservable: Observable<Identification.RegisteredUser>;
    authStateObservable: Observable<FirebaseAuthState>;

    userRepos: Identification.RegisteredUserRepos;

    constructor( private af: AngularFire ) {
        this.userRepos = new Identification.RegisteredUserRepos( this.af, root );
        
        this.authStateObservable = ( this.af.auth as Observable<FirebaseAuthState> ).publishReplay(1).refCount();
        this.currentUserObservable = this.authStateObservable.flatMap( authState => {
            if( authState ) {
                return this.userRepos.get( { id: authState.auth.uid } );
            } else {
                return Observable.of( null );
            } 
        } ).publishReplay(1).refCount();
        this.postLogin();
    } 
    
    postLogin() {
        return this.authStateObservable.filter( authState => authState !== null )
            .flatMap( authState => { 
                // 1回だけUIDの更新 or 登録を行う
                return this.userRepos.get( { id: authState.auth.uid } ).take(1).do( user => {
                    if( user ) {
                        this.userRepos.update( user.id );
                    } else {
                        this.userRepos.register( authState.auth.uid );
                    }
                } );
            } ).take(1).subscribe();
    }
}
