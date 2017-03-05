// rxjs
import { Observable } from 'rxjs';
import * as Mapper from './index';

// firebase
import { AngularFire } from 'angularfire2';

/* ####################################################################################################################
 * ほぼそのままマッピングするもの
 * Firebaseを包んだだけ
 * ################################################################################################################# */
export abstract class AbstractRawMapper {
    constructor( private af: AngularFire ) {}
    protected abstract getBaseUrl( obj?: any ): string;
    protected abstract getId( data: any ): string; 
    
    private getUrl( id: string ): string {
        return this.getBaseUrl() + id;
    }
    
    // IDを指定して、該当するオブジェクトを取得する
    getRaw( id: string ): Observable<any> {
        if( id ) {
            return this.af.database.object( this.getUrl( id ) ) as Observable<any>;
        } else {
            // IDがない場合は修正できないため例外
            throw new Mapper.NoIdError;
        }
    }

    // 一括取得
    getAllRaw(): Observable<any[]>{
        return this.af.database.list( this.getBaseUrl() ) as Observable<any>;
    }
 
    // 追加する(既存の場合は強制的に書き換わる)
    setRaw( id: string, data: any ): Promise<void>{
        if( id ) {
            // IDがあれば実行
            let db = this.af.database.object( this.getUrl( id ) );
            return db.set( data ) as Promise<void>;
        } else {
            // IDがない場合は修正できないため例外
            throw new Mapper.NoIdError;
        }
    }
    
    // 変更のあったところだけ書き換える(同実装するかはお任せ)…場合によってはタイムスタンプを除外するのみ
    updateRaw( id, data: any ): Promise<void> {
        if( id ) {
            // IDがあれば実行
            let db = this.af.database.object( this.getUrl( id ) );
            return db.update( data ) as Promise<void>;
        } else {
            // IDがない場合は修正できないため例外
            throw new Mapper.NoIdError;
        }
    }

    // IDは無視して追加する
    // ID追加後のモデルが必要となるので、Promiseで返す。
    pushRaw( data: any ): Promise<string> {
        let db = this.af.database.list( this.getBaseUrl() );
        
        // FirebaseのThenableReferenceから、Key(新しく追加したオブジェクトのID)を返す
        return new Promise( (resolve,reject) => {
            db.push( data ).then( result => {
                let key: string = result.key;
                resolve( key );
            } );
        } ); 
    }
    
    remove( id: string ): Promise<void> {
        if( id ) {
            return new Promise( ( resolve, reject ) => {
                let promise = this.af.database.object( this.getUrl( id ) ).remove();                
            } );
        } else {
            // IDがない場合は修正できないため例外
            throw new Mapper.NoIdError;
        }
    }
}