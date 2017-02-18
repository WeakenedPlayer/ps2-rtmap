// rxjs
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/count';

/* ####################################################################################################################
 * 不正な許可コード(Permissionのcodeが空)
 * ################################################################################################################# */
export class InvalidPermissionCode implements Error {
    name: string;
    message: string;
    constructor() {
        this.name = 'Invalid Permission Code.';
        this.message = 'Permission code is invalid.';
    }
}

/* ####################################################################################################################
 * 許可(permission)
 * 操作(operation)の実行ができるかどうかを調べるのに使う値オブジェクト。
 * 許可コードは、Firebaseから持ってきたり、ローカルで生成したりする。
 * ################################################################################################################# */
export class Permission {
    constructor( public readonly code: string　) {
        if( !code ) {
            throw new InvalidPermissionCode;
        }
    }
    equals( permission: Permission ): boolean {
        return ( this.code === permission.code );
    }
}

/* ####################################################################################################################
 * 許可のセット
 * ################################################################################################################# */
export class PermissionSet {
    private 
    permissions:  { [ key: string ]: boolean } = {};
    static fromPermissionList( permissions: Permission[] ) {
        let tmp = new PermissionSet();
        for( let p of permissions ) {
            tmp.add( p );
        }
        return tmp;
    }
    
    // 許可追加
    add( permission: Permission ): void {
        this.permissions[ permission.code ] = true;
    }
    
    // 許可削除
    remove( permission: Permission ): void {
        this.permissions[ permission.code ] = false;
    }

    // 全許可削除
    removeAll(): void {
        this.permissions = {};
    }
    
    // 引数で与えられた許可をすべて持つか
    containAll( permissionSet: PermissionSet ): boolean {
        let result = true;
        for( let p in permissionSet.permissions ) {
            result = result && ( this.permissions[ p ] ) ? true : false;
        }
        return result;
    }

    // 引数で与えられた許可を持つか
    contain( permission: Permission ): boolean {
        return ( this.permissions[ permission.code ] ) ? true : false;
    }
}
