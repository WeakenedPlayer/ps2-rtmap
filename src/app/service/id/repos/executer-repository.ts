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
    
    getByUser( user: User ): Observable<Acl.Executer> {
        return Observable.create( ( subscriber: Subscriber<Acl.Executer> ) => {
            let tmp = new Acl.PermissionSet();
            this.af.database.list( this.url( user ) )
            .flatMap( ( permissions: Array<any> ) => {
                return permissions;
            } )
            .map( permission => {
                return permission;
            } )
            .subscribe(
                result => {
                    subscriber.next( result );
                },
                err => {},
                () => {}
            );
        } );
    }
}