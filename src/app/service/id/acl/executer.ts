import { User, Acl } from '../index';
import { Observable } from 'rxjs';

/* ####################################################################################################################
 * 実行者(executor)
 * 権限(permission)を与えられる。
 * 権限が付与されているかを確認するインターフェースを持つ。
 * ################################################################################################################# */
export class Executer {
    private grantedPermissions: Acl.PermissionSet;
    private user: User;
    constructor( user: User ) {
        this.user = user;
    }

    isGranted( requiredPermissions: Acl.PermissionSet ): boolean {
        return this.grantedPermissions.containAll( requiredPermissions );
    }
    
    grant( permission: Acl.Permission ): void {
        this.grantedPermissions.allow( permission );
    }

    revoke( permission: Acl.Permission ): void {
        this.grantedPermissions.remove( permission );
    }
    
    revokeAll(): void {
        this.grantedPermissions.denyAll();
    }
}
