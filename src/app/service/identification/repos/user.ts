import { DB, Identification } from '../../index';
import { AngularFire  } from 'angularfire2';

export class RegisteredUserRepos extends DB.SimpleMapper<Identification.RegisteredUser> {
    constructor( af:AngularFire, base: string ) {
        super( af, base + 'reg/$id/' );
    }

    // 復元
    protected db2obj( keys: any, values: any ): Identification.RegisteredUser {
        return new Identification.RegisteredUser( keys.id, values.updatedAt, values.createdAt );
    }
    
    register( uid: string ) {
        this.set( { id: uid, lastLoggedInAt: DB.TimeStamp, createdAt: DB.TimeStamp } );
    }
    
    updateLastLogin( uid: string ) {
        this.update( { id: uid, lastLoggedInAt: DB.TimeStamp } );
    }
}
