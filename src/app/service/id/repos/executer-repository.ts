// rxjs
import { Observable, Subscriber } from 'rxjs';
import 'rxjs/add/operator/toPromise';

// Firebase
import { AngularFire , FirebaseObjectObservable, FirebaseListObservable, AngularFireAuth, FirebaseRef } from 'angularfire2';
import * as firebase from 'firebase';       // required for timestamp

// model
import { User, Repository, Acl } from '../index';


export class ExecuterRepository {
    constructor( private af: AngularFire, private readonly root: string ) {}
    
    url( user: User ): string {
        if( !user.uid ) {
            throw new Repository.UidEmptyError;
        }
        return this.root + '/executer/' + user.uid;
    }
    
    getExecuter( user: User ): Observable<Acl.Executer> {
        return Observable.create( ( subscriber: Subscriber<Acl.Executer> ) => {
            let executer = new Acl.Executer( user );
            this.af.database.list( this.url( user ) )
            .flatMap( ( permissions: Array<any> ) => permissions )
            .filter( permission => permission.$value )
            .map( permission => {
                executer.grant( new Acl.Permission( permission.$key ) );
                return executer;
            } )
            .subscribe(
                result => {
                    console.log( result );
                },
                err => {},
                () => {}
            );
            /*
            let subscription = source.subscribe( val => {
                try {
                    if( val.$exists() ){
                        // DBからの復元(定型)
                        let executer = new Acl.Executer( user );
                        subscriber.next( executer );
                        subscriber.complete();
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
            */
        } );
    }
}