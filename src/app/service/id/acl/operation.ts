import * as Acl from './index';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/count';

export class PermissionDeniedError implements Error {
    name: string;
    message: string;
    constructor() {
        this.name = 'Cannot execute operation.';
        this.message = 'Permission denied.';
    }
}

export abstract class Operation {
    requirement: Acl.Requirement;    
    requires( requirement: Acl.Requirement ) {
        this.requirement = requirement;
    }
    execute( executer: Acl.Executer ) {
        if( this.requirement.isFulfilledBy( executer ) ) {
            this._execute();
        } else {
            throw new PermissionDeniedError;
        }
    }
    protected abstract _execute();
}
