import { Acl } from '../index';
/* ####################################################################################################################
 * 例外
 * ################################################################################################################# */
export class PermissionDeniedError implements Error {
    name: string;
    message: string;
    constructor() {
        this.name = 'Cannot execute operation.';
        this.message = 'requirements are not fulfilled.';
    }
}

/* ####################################################################################################################
 * 操作
 * ################################################################################################################# */
export abstract class Operation {
    requirement: Acl.Requirement;
    requires( requirement: Acl.Requirement ) {
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

/* ####################################################################################################################
 * 無名操作( パラメータを取らない簡単なものに限定)
 * ################################################################################################################# */
export class AnonymousOperation extends Operation {
    constructor( private op: () => void ) {
        super();
    }
    protected _execute(): void {
        this.op();
    }
}
