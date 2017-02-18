import { Acl } from '../index';
import { Observable } from 'rxjs';

/* ####################################################################################################################
 * 実行者(executor)
 * 権限(permission)を与えられる。
 * 権限が付与されているかを確認するインターフェースを持つ。
 * ################################################################################################################# */
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
