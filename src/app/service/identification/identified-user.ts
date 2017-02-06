import { AngularFire , FirebaseObjectObservable, FirebaseListObservable, AngularFireAuth, FirebaseRef } from 'angularfire2';
import * as firebase from 'firebase';       // required for timestamp
import { Subscription, Observable } from 'rxjs';
import * as UserIdentification from './common'; 
import * as Session from './session'; 

export class IdentifiedUserInfo {
    static CreateSendData( identifierUid: string ) {
        return { 'confirmedBy': identifierUid, 'confirmedAt': firebase.database.ServerValue.TIMESTAMP };
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

    constructor( private identifierUid: string,private af: AngularFire ) {}

    getIdentifiedUserObserver( uid: string): FirebaseObjectObservable<IdentifiedUserInfo> {
        return this.af.database.object( IdentifiedUserRepository.url( uid ) );
    }
    
    getAllIdentifiedUserObserver(): FirebaseListObservable<IdentifiedUserInfo[]> {
        return this.af.database.list( IdentifiedUserRepository.url() );
    }
    
    registerUser( identifiedUser: string ): Promise<void> {
        return new Promise( ( resolve, reject ) => {
            if( identifiedUser ) {
                resolve( this.af.database.object( IdentifiedUserRepository.url( identifiedUser ) )
                                         .update( IdentifiedUserInfo.CreateSendData( this.identifierUid ) ));
            } else {
                reject( 'no uid specified' );
            }
        } );
    }
    
    unRegisterUser( identifiedUid : string ): Promise<void> {
        return new Promise( ( resolve, reject ) => {
            if( identifiedUid ) {
                resolve( this.af.database.object( IdentifiedUserRepository.url( identifiedUid ) ).remove() );
            } else {
                reject( 'no uid specified' );
            }
        } );
    }
}
