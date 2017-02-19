// rxjs
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/count';

// model
import { Acl } from '../index';

/* ####################################################################################################################
 * 操作
 * ################################################################################################################# */
export abstract class Operation {
    requirement: Acl.Condition;    
    requires( requirement: Acl.Condition ) {
        this.requirement = requirement;
    }
    execute( executer: Acl.Executer ) {
        if( this.requirement.test( executer ) ) {
            this._execute();
        } else {
            throw new Acl.PermissionDeniedError;
        }
    }
    protected abstract _execute();
}
