import { AngularFire , FirebaseObjectObservable, FirebaseListObservable, AngularFireAuth, FirebaseRef } from 'angularfire2';
import * as firebase from 'firebase';       // required for timestamp
import { Subscription, Observable, Subject, Subscriber } from 'rxjs';
import 'rxjs/add/operator/toPromise';

import { Repository, Identification } from '../index';

export class RequestRepository {
    constructor( private af: AngularFire, 
                 private userRepos: Repository.UserRepository,
                 private readonly root: string ) {}
    
    url( uid: string ): string {
        if( !uid ) {
        }
        return this.root + '/req/' + uid;
    }

    getIdentificationRequestSnapshotObservable( uid: string ): Observable<Identification.RequestSnapshot> {
        return Observable.create( ( subscriber: Subscriber<Identification.RequestSnapshot> ) => {
            let source = this.af.database.object( this.url( uid ) );
            let subscription = source.subscribe( val => {
                try {
                    if( val.$exists() ){
                        // DBからの復元(定型)
                        let req = new Identification.RequestSnapshot( val.$key, val.cid, val.requestedAt );
                        subscriber.next( req );
                    } else {
                        throw new Repository.NotFoundError;
                    }
                } catch( err ) {
                    subscriber.error( err );
                }
            },
            err => subscriber.error( err ),
            () => {
                subscriber.complete();
                console.log('completed');
            });
            return subscription;
        } );
    }
    
    getIdentificationRequestObservable( uid: string ): Observable<Identification.Request> {
        return Observable.create( ( subscriber: Subscriber<Identification.Request> ) => {
            let reqObserver = this.getIdentificationRequestSnapshotObservable( uid );
            let userObserver = this.userRepos.getUserObservableById( uid );

            // 2つのストリームの最新値の2つのオブジェクトを使って、1つのオブジェクトを組み立てて後段に流す Observable
            // ( IdentificationRequestSnapshot, User ) => ( IdentificationRequest )
            let subscription =  Observable.combineLatest( reqObserver, userObserver,
                    ( req, user ) => { return new Identification.Request( user, new Identification.Character( req.cid, 'dmy', 0,1,2 ), req.requestedAt );
            } ).subscribe(
                val => {
                    subscriber.next( val );
                    subscriber.complete();
                },
                error => { console.log( 'error' ) },
                () => console.log('onCompleted')
            );
            return subscription;
        } );
    }
    
    addIdentificationRequest( req: Identification.Request ): Promise<void> {
        let source = this.af.database.object( this.url( req.user.uid ) );
        return source.set( { cid: req.character.cid, requestedAt: firebase.database.ServerValue.TIMESTAMP } ) as Promise<void>;
    }
}
