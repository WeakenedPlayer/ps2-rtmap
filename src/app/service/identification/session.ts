import { AngularFire , FirebaseObjectObservable, FirebaseListObservable, AngularFireAuth, FirebaseRef } from 'angularfire2';
import * as firebase from 'firebase';       // required for timestamp
import { Subscription, Observable } from 'rxjs';
import * as UserIdentification from './common'; 
import * as Application from './application'; 

export class SessionAcceptance {
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

export class SessionRepository {
    static url( method: string, applicantUid: string, identifierUid: string ) {
        return UserIdentification.URL_BASE + 'session/' + applicantUid + '/' + method + '/' + identifierUid;
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
    
    acceptApplication( appData: Application.ApplicationData ) {
        this.af.database.object( SessionRepository.acceptanceUrl( this.uid, appData.$key ) )
            .set( SessionAcceptance.CreateSendData( appData.cid, appData.appliedAt ) )
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
