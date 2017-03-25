import { DB, Identification } from '../../index';
import { AngularFire  } from 'angularfire2';
import { Observable } from 'rxjs';

export class RegisteredUserRepos extends DB.SimpleMapper<Identification.RegisteredUser> {
    constructor( af:AngularFire, prefix: DB.Path ) {
        super( af, prefix.move( DB.Path.fromUrl( 'reg/$id' ) ) );
    }

    // 復元
    protected db2obj( keys: any, values: any ): Identification.RegisteredUser {
        // console.log( keys, values );
        return new Identification.RegisteredUser( values.$key, values.updatedAt, values.createdAt );
    }
    
    getById( uid: string ): Observable<Identification.RegisteredUser> {
        // console.log( uid );
        return this.getDb( { id: uid } );
    }
    
    register( uid: string ): Promise<void> {
        return this.setDb( { id: uid, updatedAt: DB.TimeStamp, createdAt: DB.TimeStamp } );
    }
    
    update( uid: string ): Promise<void> {
        console.log( uid );
        return this.updateDb( { id: uid, updatedAt: DB.TimeStamp } );
    }
}
