import { DB, Identification } from '../../index';
import { AngularFire  } from 'angularfire2';
import { Observable } from 'rxjs';

export class RegisteredUserRepos extends DB.SimpleMapper<Identification.RegisteredUser> {
    constructor( af:AngularFire, base: string ) {
        super( af, base + 'reg/$id/' );
    }

    // 復元
    protected db2obj( keys: any, values: any ): Identification.RegisteredUser {
        return new Identification.RegisteredUser( keys.id, values.updatedAt, values.createdAt );
    }
    
    getById( uid: string ): Observable<Identification.RegisteredUser> {
        return this.getDb( { id: uid } );
    }
    
    register( uid: string ): Promise<void> {
        return this.setDb( { id: uid, updatedAt: DB.TimeStamp, createdAt: DB.TimeStamp } );
    }
    
    update( uid: string ): Promise<void> {
        return this.updateDb( { id: uid, updatedAt: DB.TimeStamp } );
    }
}
