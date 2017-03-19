import { DB, Identification } from '../../../service';
import { AngularFire  } from 'angularfire2';
import { Observable } from 'rxjs';

export class RequestRepos extends DB.SimpleMapper<Identification.Request> {
    constructor( af:AngularFire, base: string ) {
        super( af, base + 'req/$uid' );
    }
    
    protected db2obj( keys: any, values: any ): Identification.Request {
        return new Identification.Request( values.$key, values.cid, values.updatedAt );
    }

    getById( uid: string ): Observable<Identification.Request> {
        return this.getDb( { uid: uid } );
    }
    
    register( uid: string, cid: string ): Promise<void> {
        return this.setDb( { uid: uid, cid: cid, updatedAt: DB.TimeStamp } );
    }
    
    update( uid: string ): Promise<void> {
        return this.updateDb( { uid: uid, updatedAt: DB.TimeStamp } );
    }
    
    remove( uid: string): Promise<void> {
        return this.removeDb( { uid: uid } );
    }
    
    getAll(): Observable<Identification.Request[]> {
        return this.getAllDb();
    }
}
