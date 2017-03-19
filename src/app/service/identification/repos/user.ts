import { DB, Identification } from '../../index';
import { AngularFire  } from 'angularfire2';

export class RegisteredUserRepos extends DB.SimpleMapper<Identification.RegisteredUser> {
    constructor( af:AngularFire, base: string ) {
        super( af, base + 'user/$id/' );
    }
    
    obj2db( user: Identification.RegisteredUser, isNew: boolean ): any {
        if( isNew ) {
            return { id: user.uid, updatedAt: user.updatedAt, createdAt: DB.TimeStamp }; 
        } else {
            return { id: user.uid, updatedAt: user.updatedAt }; 
        }
    }

    db2obj( keys: any, values: any ): Identification.RegisteredUser {
        return new Identification.RegisteredUser( keys.id, values.updatedAt, values.createdAt );
    }
}
