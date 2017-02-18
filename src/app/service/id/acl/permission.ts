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
            // 禁止文字列 / 等もチェックするよう改良する
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
    private permissions:  { [ key: string ]: boolean } = {};
    
    // 配列からセットを生成
    static fromPermissionList( permissions: Permission[] ) {
        let tmp = new PermissionSet();
        for( let p of permissions ) {
            tmp.allow( p );
        }
        return tmp;
    }
    
    set( permission: Permission, val: boolean ) : void {
        this.permissions[ permission.code ] = val;
    }

    // 許可追加
    allow( permission: Permission ): void {
        this.set( permission, true );
    }
    // 
    deny( permission: Permission): void {
        this.set( permission, false );
    }

    remove( permission: Permission): void {
        // 条件をなくす
        this.permissions[ permission.code ] = null;
    }
    
    // 全許可削除
    denyAll(): void {
        this.permissions = {};
    }

    //　付け足す
    append( permissionSet: PermissionSet ): void {
        // 参照渡しにならないようコピーする
        for( let code in permissionSet.permissions ) {
            this.permissions[ code ] = permissionSet.permissions[ code ];            
        }
    }

    // コピー
    copy( permissionSet: PermissionSet ): void {
        this.denyAll();
        this.append( permissionSet );
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
