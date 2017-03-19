import { DB, Identification } from '../../../service';
import { AngularFire  } from 'angularfire2';

/*
export class RequestRepos extends DB.CompositeMapper<Identification.Request> {
    constructor( af:AngularFire, base: string, userRepo: DB.Mapper<Identification.User> ) {
        super( af, base + '/$uid/' );
        
        this.addChild( 'uid', userRepo, (keys, values) => { return { id: keys.uid } } );
    }
    
    obj2db( req: Identification.Request, isNew: boolean ): any {
        if( isNew ) {
            return { uid: req.user, cid: req.cid, requestedAt: DB.TimeStamp }; 
        } else {
            return { uid: req.user, cid: req.cid };
        }
    }

    db2obj( keys: any, values: any, children: any ): Identification.Request {
        return new Identification.Request( children.uid, children.cid, values.requestedAt );
    }
}
*/