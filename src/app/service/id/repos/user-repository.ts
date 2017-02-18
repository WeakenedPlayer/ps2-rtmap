// rxjs
import { Observable, Subscriber } from 'rxjs';
import 'rxjs/add/operator/toPromise';

// firebase
import { AngularFire , FirebaseObjectObservable, FirebaseListObservable, AngularFireAuth, FirebaseRef } from 'angularfire2';
import * as firebase from 'firebase';       // required for timestamp

// models
import { User, Repository } from '../index';

/* ####################################################################################################################
 * ユーザをFirebaseから取得するリポジトリ
 * ################################################################################################################# */
export class UserRepository {
    constructor( private af: AngularFire, private readonly root: string ) {}
    
    // Userのが格納されたURLを返す
    url( uid: string ): string {
        if( !uid ) {
            throw new Repository.UidEmptyError;
        }
        return this.root + '/user/' + uid;
    }
    
    // UserのObservableを返す
    getUserObservableById( uid: string ): Observable<User> {
        return Observable.create( ( subscriber: Subscriber<User> ) => {
            let source = this.af.database.object( this.url( uid ) );
            let subscription = source.subscribe( val => {
                try {
                    if( val.$exists() ){
                        // toPromiseを動かすための処置 : https://github.com/Reactive-Extensions/RxJS/issues/1088
                        // DBからの復元(定型)
                        let user = new User( val.$key, val.disabled, val.createdAt );
                        subscriber.next( user );
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
            });
            return subscription;
        } );
    }
    
    getUserById( uid: string ): Promise<User> {
        return this.getUserObservableById( uid ).toPromise();
    }
    
    addUser( user: User ): Promise<void> {
        // Firebaseが生成する uid は重複しないことが保証されているので、書き込み可能
        let source = this.af.database.object( this.url( user.uid ) );
        return source.set( { disabled: false, createdAt: firebase.database.ServerValue.TIMESTAMP } ) as Promise<void>;
    }

    updateUser( user: User ): Promise<void> {
        let source = this.af.database.object( this.url( user.uid ) );
        return source.update( { disabled: false } ) as Promise<void>;
    }
}
