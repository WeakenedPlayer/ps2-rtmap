import * as Acl from './index';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/count';

/* ####################################################################################################################
 * 操作
 * ################################################################################################################# */
export abstract class Operation {
    requirement: Acl.Requirement;    
    requires( requirement: Acl.Requirement ) {
        this.requirement = requirement;
    }
    execute( executer: Acl.Executer ) {
        if( this.requirement.isFulfilledBy( executer ) ) {
            this._execute();
        } else {
            throw new Acl.PermissionDeniedError;
        }
    }
    protected abstract _execute();
}
