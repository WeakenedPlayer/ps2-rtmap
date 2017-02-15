import * as Repositories from './index';
import { AngularFire , FirebaseObjectObservable, FirebaseListObservable, AngularFireAuth, FirebaseRef } from 'angularfire2';
import * as firebase from 'firebase';       // required for timestamp
import { Subscription, Observable, Subject, Subscriber } from 'rxjs';
import * as Model from '../model';
import 'rxjs/add/operator/toPromise';

export class IdentificationRequestRepository {
    constructor( private af: AngularFire, 
                 private userRepos: Repositories.UserRepository,
                 private readonly root: string ) {}
    
    url( uid: string ): string {
        if( !uid ) {
        }
        return this.root + '/req/' + uid;
    }

    getIdentificationRequestSnapshotObservable( uid: string ): Observable<Model.IdentificationRequestSnapshot> {
        return Observable.create( ( subscriber: Subscriber<Model.IdentificationRequestSnapshot> ) => {
            let source = this.af.database.object( this.url( uid ) );
            let subscription = source.subscribe( val => {
                try {
                    if( val.$exists() ){
                        // DBからの復元(定型)
                        let req = new Model.IdentificationRequestSnapshot( val.$key, val.cid, val.requestedAt );
                        subscriber.next( req );
                    } else {
                        throw new Repositories.NotFoundError;
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
    
    getIdentificationRequestObservable( uid: string ): Observable<Model.IdentificationRequest> {
        return Observable.create( ( subscriber: Subscriber<Model.IdentificationRequest> ) => {
            let reqObserver = this.getIdentificationRequestSnapshotObservable( uid );
            let userObserver = this.userRepos.getUserObservableById( uid );

            // 2つのストリームの最新値の2つのオブジェクトを使って、1つのオブジェクトを組み立てて後段に流す Observable
            // ( IdentificationRequestSnapshot, User ) => ( IdentificationRequest )
            let subscription =  Observable.combineLatest( reqObserver, userObserver,
                    ( req, user ) => { return new Model.IdentificationRequest( user, new Model.Character( req.cid, 'dmy', 0,1,2 ), req.requestedAt );
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
    
    addIdentificationRequest( req: Model.IdentificationRequest ): Promise<void> {
        let source = this.af.database.object( this.url( req.user.uid ) );
        return source.set( { cid: req.character.cid, requestedAt: firebase.database.ServerValue.TIMESTAMP } ) as Promise<void>;
    }
    
    
}
