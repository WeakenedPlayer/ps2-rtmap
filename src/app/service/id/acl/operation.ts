import { Acl } from '../index';
/* ####################################################################################################################
 * 例外
 * ################################################################################################################# */
export class PermissionDeniedError implements Error {
    name: string;
    message: string;
    constructor() {
        this.name = 'Cannot execute operation.';
        this.message = 'Permission denied.';
    }
}

/* ####################################################################################################################
 * 操作
 * ################################################################################################################# */
export abstract class Operation {
    requirement: Acl.IRequirement;
    requires( requirement: Acl.IRequirement ) {
        this.requirement = requirement;
    }
    execute() {
        if( this.requirement.isFulfilled() ) {
            this._execute();
        } else {
            throw new Acl.PermissionDeniedError;
        }
    }
    protected abstract _execute();
}
