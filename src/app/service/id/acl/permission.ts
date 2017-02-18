import { Acl } from '../index';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/count';

/* ####################################################################################################################
 * 許可(permission)
 * 操作(operation)の実行ができるかどうかを調べるのに使う値オブジェクト。
 * 許可コードは、Firebaseから持ってきたり、ローカルで生成したりする。
 * ################################################################################################################# */
export class Permission {
    constructor( public readonly code: string　) {}
    equals( permission: Permission ): boolean {
        return ( this.code === permission.code );
    }
}

/* ####################################################################################################################
 * 権限(permission)が与えられているかどうかを調べるだけの要求
 * ################################################################################################################# */
export class PermissionRequirement implements Acl.Requirement {
    private requirements: Acl.Permission[] = [];
    isFulfilledBy( executer: Acl.Executer ): boolean {
        // 効率は悪いが、数は多くないのでこれでよい。(1msかからないので、頻繁にコールしなければ支障なし)
        let rejected: number;
        Observable.from( this.requirements )
        .map( permission => executer.isGranted( permission ) )
        .count( result => ( result === false ) )
        .subscribe( count => rejected = count );
        return ( rejected === 0 );
    }
    add( permission: Acl.Permission ): void {
        this.requirements.push( permission );
    }
}
