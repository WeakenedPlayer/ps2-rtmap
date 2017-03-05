// rxjs
import { Observable } from 'rxjs';
import * as Mapper from './index';

// firebase
import { AngularFire } from 'angularfire2';

/* ####################################################################################################################
 * Firebaseを包むとともに、データをPathに含ませる方式をサポートする
 * ################################################################################################################# */
export class RawMapper {
    constructor( private af: AngularFire ) {}
    
    // IDを指定して、該当するオブジェクトを取得する
    protected getObject( path: string ): Observable<any> {
        return this.af.database.object( path );
    }

    // 一括取得
    protected getList( path: string ): Observable<any[]>{
        return this.af.database.list( path ) as Observable<any>;
    }
 
    // 追加する(既存の場合は強制的に書き換わる)
    protected setObject( path: string, obj: any ): Promise<void>{
        let db = this.af.database.object( path );
        return db.set( obj ) as Promise<void>;
    }
    
    // 変更のあったところだけ書き換える(同実装するかはお任せ)…場合によってはタイムスタンプを除外するのみ
    protected updateObject( path: string, obj: any ): Promise<void> {
        let db = this.af.database.object( path );
        return db.update( obj ) as Promise<void>;
    }

    // IDは無視して追加する
    // ID追加後のモデルが必要となるので、Promiseで返す。
    protected pushObject( path: string, obj: any ): Promise<string> {
        let db = this.af.database.list( path );
        
        // FirebaseのThenableReferenceから、Key(新しく追加したオブジェクトのID)を返す
        return new Promise( (resolve,reject) => {
            db.push( obj ).then( result => {
                let key: string = result.key;
                resolve( key );
            } );
        } ); 
    }
    
    protected removeObject( path: string ): Promise<void> {
        return new Promise( ( resolve, reject ) => {
            let promise = this.af.database.object( path ).remove();                
        } );
    }
}

/* ####################################################################################################################
 * 格納したいオブジェクトを、パスと格納用のオブジェクトに変換する
 * [1] get
 *      必要なパラメータを与えてインスタンス化する
 *      ・パスを生成する                                                ( Path )
 *      ・取得したデータからオブジェクトを生成する　　　( 取得データ ) => ( Obj )
 * [2] set/update/remove
 *      オブジェクトを与えてインスタンス化する ( Obj ) => ( 格納データ )
 *      ・オブジェクトからパスを生成する          ( Obj ) => ( Path )
 *      ・格納のためのデータを渡す
 * 値オブジェクトであること!変わると困る
 * ################################################################################################################# */
export abstract class AbstractKeyValue<T> {
    private dbKeys: string[] = [];
    private dbValue: any = {};
    constructor( obj?: T, isNew?: boolean, opt?: any ) {
        if( obj ) {
            // set/update で格納対象のオブジェクトがもらえる場合
            this.dbValue = this.object2DbValue( obj, isNew, opt );
            this.dbKeys  = this.object2Key( obj );
        }
    }

    protected abstract object2Key( obj: T ): string[];              // パスのもととなるキーを作る
    protected abstract object2DbValue( obj: T, isNew: boolean, opt?: any ): any;    // 格納するオブジェクトを作る
    protected abstract dbKeyValue2Object( keys: string[], value: any, opt?: any ): T;

    // パスを取得する
    public toPath(): string {
         return this.dbKeys.join( '/' );
    }

    // パスを取得する
    public toParentPath(): string {
        let tmp = this.dbKeys;
        tmp.pop();
         return tmp.join( '/' );
    }
    
    // キーは継承クラス内で作らせる。一度作ったら変更しないこと。
    protected setKeys( keys: string[] ) {
        this.dbKeys = keys;
    }

    toValue( dbValue: any, opt?: any ): T {
        return this.dbKeyValue2Object( this.dbKeys, dbValue, opt );
    }
    
    toDbValue(): any {
        return this.dbValue;
    }
}

/* ####################################################################################################################
 * Firebaseを包むとともに、データをPathに含ませる方式をサポートする
 * ################################################################################################################# */
export abstract class AbstractClassMapper<T> extends RawMapper {
    constructor( af: AngularFire, private root: string ) { super( af ); }

    protected get( keyValue: AbstractKeyValue<T> ): Observable<T> {
        return this.getObject( this.root + keyValue.toPath() )
                   .map( dbValue => {
                       if( dbValue.$exists() ) {
                           return keyValue.toValue( dbValue );
                       }
                   } ); 
    }
    
    protected set( keyValue: AbstractKeyValue<T> ): Promise<void> {
        return this.setObject( this.root + keyValue.toPath(), keyValue.toDbValue() ) as Promise<void>;
    }
    
    // 変更のあったところだけ書き換える(同実装するかはお任せ)…場合によってはタイムスタンプを除外するのみ
    protected update( keyValue: AbstractKeyValue<T> ): Promise<void> {
        return super.updateObject( this.root + keyValue.toPath(), keyValue.toDbValue() ) as Promise<void>;
    }

}
