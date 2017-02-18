import * as Acl from './index';
import { Observable } from 'rxjs';

// 権限を確認して実行するか判断するロジックを持たせる
export class Executer {
    private grantedPermissions: Acl.Permission[]= [];
    isGranted( requiredPermission: Acl.Permission ): boolean {
        let grantedCount;
        Observable.from( this.grantedPermissions )
        .map( permission => {
            return permission.equals( requiredPermission );
        } )
        .count( result => ( result === true ) )
        .subscribe( count => grantedCount = count );
        return ( grantedCount > 0 );
    }
    
    grant( permission: Acl.Permission ) {
        this.grantedPermissions.push( permission );
    }
}
