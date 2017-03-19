import { DB, Identification } from '../../index';
import { AngularFire  } from 'angularfire2';

export class UserRepos extends DB.SimpleMapper<Identification.User> {
    constructor( af:AngularFire, base: string ) {
        super( af, base + 'user/$id/' );
    }
    
    obj2db( user: Identification.User, isNew: boolean ): any {
        if( isNew ) {
            return { id: user.uid, enabled: user.enabled, createdAt: DB.TimeStamp }; 
        } else {
            return { id: user.uid, enabled: user.enabled }; 
        }
    }

    db2obj( keys: any, values: any ): Identification.User {
        return new Identification.User( keys.id, values.enabled, values.createdAt );
    }
}
