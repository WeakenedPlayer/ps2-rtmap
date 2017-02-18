import { Acl } from '../index';

/* ####################################################################################################################
 * 操作(operation)の実行に必要な権限や条件をまとめた要求(requirement)のインターフェース
 * 実行者(executor)に依存し、実行者が要求を満足するかを確認する isFulfilledBy を提供する
 * ################################################################################################################# */
export abstract class Requirement {
    abstract isFulfilledBy( executer: Acl.Executer ): boolean;
}

/* ####################################################################################################################
 * 権限(permission)が与えられているかどうかを調べるだけの要求
 * ################################################################################################################# */
export class PermissionRequirement implements Acl.Requirement {
    private requirements: Acl.PermissionSet;
    isFulfilledBy( executer: Acl.Executer ): boolean {
        let rejected: number =9;
//        Observable.from( this.requirements )
//        .map( permission => executer.isGranted( permission ) )
//        .count( result => ( result === false ) )
//        .subscribe( count => rejected = count );
        return ( rejected === 0 );
    }
    add( permission: Acl.Permission ): void {
        //this.requirements.push( permission );
    }
}
