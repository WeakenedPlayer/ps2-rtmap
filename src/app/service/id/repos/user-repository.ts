import { AngularFire , FirebaseObjectObservable, FirebaseListObservable, AngularFireAuth, FirebaseRef } from 'angularfire2';
import * as firebase from 'firebase';       // required for timestamp
import { Subscription, Observable, Subject, Subscriber } from 'rxjs';

import { User, Repository } from '../index';
import 'rxjs/add/operator/toPromise';

export class UserRepository {
    constructor( private af: AngularFire, private readonly root: string ) {}
    
    url( uid: string ): string {
        if( !uid ) {
            throw new Repository.UidEmptyError;
        }
        return this.root + '/user/' + uid;
    }
    
    getUserObservableById( uid: string ): Observable<User> {
        return Observable.create( ( subscriber: Subscriber<User> ) => {
            let source = this.af.database.object( this.url( uid ) );
            let subscription = source.subscribe( val => {
                try {
                    if( val.$exists() ){
                        // DBからの復元(定型)
                        let user = new User( val.$key, val.disabled, val.createdAt );
                        subscriber.next( user );
                        // toPromiseを動かすための処置 : https://github.com/Reactive-Extensions/RxJS/issues/1088
                        subscriber.complete();
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
    
    getUserById( uid: string ): Promise<User> {
        return this.getUserObservableById( uid ).toPromise();
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
