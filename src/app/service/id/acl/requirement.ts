import * as Acl from './index';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/count';

// 要求(requirement: operationの実行に必要な権限や条件)のインターフェース
// 実行者(executor)に依存する
// 将来的にオンライン状態であることも条件にしたい
export abstract class Requirement {
    abstract isFulfilledBy( executer: Acl.Executer ): boolean;
}

// 権限(permission)が与えられているかどうかの単純な要求
export class PermissionRequirement implements Requirement {
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
