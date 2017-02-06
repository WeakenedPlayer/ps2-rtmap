import { AngularFire , FirebaseObjectObservable, FirebaseListObservable, AngularFireAuth, FirebaseRef } from 'angularfire2';
import * as firebase from 'firebase';       // required for timestamp
import { Subscription, Observable } from 'rxjs';
import * as UserIdentification from './common'; 

// 本人確認申請用データ
export class RequestData {
    static CreateSendData( cid: string ) {
        return { 'cid': cid, 'requestedAt': firebase.database.ServerValue.TIMESTAMP };
    }
    // key = applicant uid set by Firebase
    constructor( public cid: string, public requestedAt: number, public $key?: string ){}
}

// 本人確認申請
export class RequestRepository {
    constructor( private uid: string, private af: AngularFire ) {}
    private url( uid: string ) { return UserIdentification.URL_BASE + 'request/' + uid; }

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
                resolve( this.af.database.object( this.url( this.uid ) ).set( RequestData.CreateSendData( cid ) ) );
            } else {
                reject( 'not logged in' );
            }
        });
    }

    getRequestObserver( applicantUid: string ): FirebaseObjectObservable<RequestData> {
        return this.af.database.object( this.url( applicantUid ) );
    }
    
    // 一度だけ申請を取得する
    getRequestSnapshot( applicantUid: string ): Promise<RequestData> {
        return new Promise<RequestData>( ( resolve, reject ) => {
            // うまくいかないので暫定
            let subscriber = this.af.database.object( this.url( applicantUid ) ).subscribe( result => {
                subscriber.unsubscribe();
                if( result ) {
                    resolve( result );                    
                } else {
                    reject( 'get request rejected' );
                }
            } );
        } );
    }
}