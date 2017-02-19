import { User, Acl } from '../index';
import { Observable } from 'rxjs';

/* ####################################################################################################################
 * 実行者(executor)
 * 権限(permission)を与えられる。
 * 権限が付与されているかを確認するインターフェースを持つ。
 * 
 * 条件は一度作ってしまえば派生しないので、ハードコードできてしまう
 * 属性は、属性の構造と値という観点があるので、
 * 属性の構造は決まっても値は持てない
 * ⇒あってるか?
 * 属性は値オブジェクトで不変
 * 属性値は可変
 * なのでそこは分けないといけない
 * 属性の集まりはリポジトリからとってくるなどするエンティティ。変化する
 * 
 * 厳密には
 * AttributeKey
 * Attribute (key,value)
 * なのかもしれない
 * コピーするのはどうするか
 * 構造も含めてコピーするなら、あらかじめ元を作っておいて、コピーさせてから値をセットするか
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
