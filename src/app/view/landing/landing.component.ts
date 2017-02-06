import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFire , FirebaseObjectObservable, FirebaseListObservable, AngularFireAuth, FirebaseRef } from 'angularfire2';
import * as firebase from 'firebase';       // required for timestamp
import { Subscription, Observable } from 'rxjs';

import 'rxjs/add/operator/toPromise';
const URL_BASE = '/idsrv/';

// 本人確認申請用データ
class ApplicationData {
    static CreateSendData( cid: string ) {
        return { 'cid': cid, 'appliedAt': firebase.database.ServerValue.TIMESTAMP };
    }
    constructor( public cid: string, public appliedAt: number, public $key?: string ){}
}

// 本人確認申請
class ApplicationRepository {
    constructor( private uid: string, private af: AngularFire ) {}
    private url( uid: string ) { return URL_BASE + 'application/' + uid; }

    deleteRequest(): Promise<void> {
        return new Promise( ( resolve, reject ) => {
            if( this.uid ) {
                resolve( this.af.database.object( this.url( this.uid ) ).remove() );
            } else {
                reject( 'not logged in' );
            }
        });
    }
    
    registerRequest( cid: string ): Promise<any> {
        return new Promise( ( resolve, reject ) => {
            if( this.uid ) {
                resolve( this.af.database.object( this.url( this.uid ) ).set( ApplicationData.CreateSendData( cid ) ) );
            } else {
                reject( 'not logged in' );
            }
        });
    }
    
    getRequest( applicantUid: string ): Observable<ApplicationData> {
        console.log(this.url( applicantUid ));
        return this.af.database.object( this.url( applicantUid ) );
    }
}

class IdentifiedUserInfo {
    static CreateSendData( identifierUid: string ) {
        return { 'by': identifierUid, 'ts': firebase.database.ServerValue.TIMESTAMP };
    }
    static FromReceivedData( any ) {
        return new IdentifiedUserInfo( any.$key, any.$value.by, any.$value.ts );
    }
    constructor( private uid: string, private identifiedBy: string, private timestamp: string ){}
}

class IdentifiedUserRepository {
    static url( uid?: string ): string {
        let tmp = URL_BASE + 'identified';
        if( uid ) {
            return tmp + '/' + uid;
        } else {
            return tmp;
        }
    }
    obs: FirebaseListObservable<any>;
    constructor( private identifierUid: string,private af: AngularFire ) {
        this.obs = af.database.list( URL_BASE + IdentifiedUserRepository.url() );
    }
    
    getAllIdentifiedUser(): Observable<any> { return this.obs; }
    
    registerUser( applicantUid: string ): Promise<void> {
        return new Promise( ( resolve, reject ) => {
            if( applicantUid ) {
                resolve( this.af.database.object( IdentifiedUserRepository.url( applicantUid ) )
                                         .update( IdentifiedUserInfo.CreateSendData( this.identifierUid ) ));
            } else {
                reject( 'no applicant uid specified' );
            }
        } );
    }
    
    unregisterUser( applicantUid: string ): Promise<void> {
        return new Promise( ( resolve, reject ) => {
            if( applicantUid ) {
                resolve( this.af.database.object( IdentifiedUserRepository.url( applicantUid ) ).remove() );
            } else {
                reject( 'no applicant uid specified' );
            }
        } );
    }
}

class SessionAcceptance {
    static CreateSendData( cid: string, appliedAt: number ) {
        return {
            'cid': cid,
            'appliedAt': appliedAt,
            'token': SessionAcceptance.generateToken(),
            'acceptedAt': firebase.database.ServerValue.TIMESTAMP
        };
    }
    
    static generateToken(): string {
        return 'abcdefg';
    }
    
    constructor(
        public cid: string,
        public appliedAt: number,
        public token: string,
        public acceptedAt: number,
        $key?: string){}
}

class SessionRepository {
    static url( method: string, applicantUid: string, identifierUid: string ) {
        return URL_BASE + 'session/' + applicantUid + '/' + method + '/' + identifierUid;
    }
    static answerUrl( applicantUid: string, identifierUid: string ) {
        return SessionRepository.url( 'answer', applicantUid, identifierUid );
    }
    static confirmationUrl( applicantUid: string, identifierUid: string ) {
        return SessionRepository.url( 'confirmation', applicantUid, identifierUid );
    }
    static acceptanceUrl( applicantUid: string, identifierUid: string ) {
        return SessionRepository.url( 'acceptance', applicantUid, identifierUid );
    }
    
    
    constructor( private uid: string,private af: AngularFire ) {}
    
    accept( appData: ApplicationData ) {
        let application = new ApplicationRepository( this.uid, this.af );
        this.af.database.object( SessionRepository.acceptanceUrl( this.uid, appData.$key ) )
            .update( SessionAcceptance.CreateSendData( appData.cid, appData.appliedAt ) )
            .then( result => { console.log( 'registered') 
        }, rejected => {
            console.log( 'no application found for user: ' + appData.$key );
        } );
    }

    // 質問に答える
    answerToQuestion( answer: string, identifierUid: string ) {
        this.af.database.object( SessionRepository.answerUrl( this.uid, identifierUid ) )
                        .set( answer );
    }
    
    // 確認する
    confirmAnswer( applicantUid: string ) {
        this.af.database.object( SessionRepository.confirmationUrl( applicantUid, this.uid ) )
                        .set( firebase.database.ServerValue.TIMESTAMP );
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
                this.msg = 'login as ' + auth.auth.displayName;
                /*
                let request = new IdentificationApplication( auth.auth.uid, af );
                request.registerRequest( 'test' )
                .then( success => {
                            console.log('succeed');
                            console.log(success);
                            }, fail => { console.log( 'failed' );
                        } ); 
                let request = new IdentifiedUserRepository( auth.auth.uid, af );
                request.registerUser( 'test23' )                .then( success => {
                    console.log('succeed');
                }, fail => {
                    console.log( fail );
                });

                let request = new ApplicationRepository( auth.auth.uid, af );
                request.getRequest('BCsQ8EmUFyewIa1gnn3HjqgotW13').subscribe( result => console.log( result) );
*/                
                /*
                let session = new SessionRepository( auth.auth.uid, af );
                let request = new ApplicationRepository( auth.auth.uid, af );

                console.log('test');
                request.getRequest( 'applicant' ).subscribe( result => {
                    console.log('test');
                    session.accept( result );
                }, reject => {
                    console.log('test');
                });
                */

                let session = new SessionRepository( auth.auth.uid, af );
                session.answerToQuestion( 'abcdefffff', '123');
                session.confirmAnswer('applicant');
                /*
                let request = new ApplicationRepository( auth.auth.uid, af );
                request.registerRequest( 'newCharacterId' );
                */
                
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