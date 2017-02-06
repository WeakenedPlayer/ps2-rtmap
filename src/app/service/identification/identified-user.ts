import { AngularFire , FirebaseObjectObservable, FirebaseListObservable, AngularFireAuth, FirebaseRef } from 'angularfire2';
import * as firebase from 'firebase';       // required for timestamp
import { Subscription, Observable } from 'rxjs';
import * as UserIdentification from './common'; 

export class IdentifiedUserInfo {
    static CreateSendData( identifierUid: string ) {
        return { 'by': identifierUid, 'ts': firebase.database.ServerValue.TIMESTAMP };
    }
    static FromReceivedData( any ) {
        return new IdentifiedUserInfo( any.$key, any.$value.by, any.$value.ts );
    }
    constructor( private uid: string, private identifiedBy: string, private timestamp: string ){}
}

export class IdentifiedUserRepository {
    static url( uid?: string ): string {
        let tmp = UserIdentification.URL_BASE + 'identified';
        if( uid ) {
            return tmp + '/' + uid;
        } else {
            return tmp;
        }
    }
    obs: FirebaseListObservable<any>;
    constructor( private identifierUid: string,private af: AngularFire ) {
        this.obs = af.database.list( UserIdentification.URL_BASE + IdentifiedUserRepository.url() );
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
