import * as Repositories from './index';
import { AngularFire , FirebaseObjectObservable, FirebaseListObservable, AngularFireAuth, FirebaseRef } from 'angularfire2';
import * as firebase from 'firebase';       // required for timestamp
import { Subscription, Observable, Subject, Subscriber } from 'rxjs';
import * as Model from '../model';
import 'rxjs/add/operator/toPromise';



export class UserRepository {
    constructor( private af: AngularFire, private readonly root: string ) {}
    
    url( uid: string ): string {
        if( !uid ) {
            throw new Repositories.UidEmptyError;
        }
        return this.root + '/user/' + uid;
    }
    
    getUserObserverById( uid: string ): Observable<Model.User> {
        return Observable.create( ( subscriber: Subscriber<Model.User> ) => {
            let source = this.af.database.object( this.url( uid ) );
            let subscription = source.subscribe( val => {
                try {
                    if( val.$exists() ){
                        // DBからの復元(定型)
                        let user = new Model.User( val.$key, val.disabled, val.createdAt );
                        subscriber.next( user );
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
    
    getUserById( uid: string ): Promise<Model.User> {
        return new Promise( ( resolve, reject ) => {
            try {
                let subscription = this.getUserObserverById( uid ).subscribe( user => {
                    resolve( user );
                    subscription.unsubscribe();
                } );
            } catch( err ){
                throw new Error( err );
            }
        } );
    }
    
    // uid は重ならないので
    addUser( uid: string ): Promise<void> {
        let source = this.af.database.object( this.url( uid ) );
        return source.set( { disabled: false, createdAt: firebase.database.ServerValue.TIMESTAMP } ) as Promise<void>;
    }

    enableUser( uid: string ): Promise<void> {
        let source = this.af.database.object( this.url( uid ) );
        return source.update( { disabled: false } ) as Promise<void>;
    }
    
    disableUser( uid: string ): Promise<void> {
        let source = this.af.database.object( this.url( uid ) );
        return source.update( { disabled: true } ) as Promise<void>;
    }
}
