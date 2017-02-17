import * as Model from './index';
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

export class Operation {
    requirement: IRequirement;    
    requires( requirement: IRequirement ) {
        this.requirement = requirement;
    }
    execute( executer: Executer ) {
        if( this.requirement.isFulfilledBy( executer ) ) {
            this._execute();
        } else {
            throw PermissionDeniedError;
        }
    }
    protected _execute() {
        console.log( 'operation executed' );
    }
}

// 権限を確認して実行するか判断するロジックを持たせる
export class Executer {
    private grantedPermissions: Permission[]= [];
    isGranted( requiredPermission: Permission ): boolean {
        let grantedCount;
        // 効率は悪いが、数は多くないのでこれでよい。
        Observable.from( this.grantedPermissions )
        .map( permission => {
            return permission.equals( requiredPermission );
        } )
        .count( result => ( result === true ) )
        .subscribe( count => grantedCount = count );
        return ( grantedCount > 0 );
    }
    
    grant( permission: Permission ) {
        this.grantedPermissions.push( permission );
    }
}

export interface IRequirement {
    isFulfilledBy( executer: Executer ): boolean;
}

//許可(定数みたいなもの)
export class Permission {
 constructor( 
     public readonly code: string
 ) {}
 
 equals( permission: Permission ): boolean {
     return ( this.code === permission.code );
 }
}

export class PermissionRequirement implements IRequirement {
    private requirements: Permission[] = [];
    isFulfilledBy( executer: Executer ): boolean {
        let rejected: number;;
        console.log( executer );
        Observable.from( this.requirements )
        .map( permission => executer.isGranted( permission ) )
        .count( result => ( result === false ) )
        .subscribe( count => rejected = count );
        return ( rejected === 0 );
    }
    add( permission: Permission ): void {
        this.requirements.push( permission );
    }
}