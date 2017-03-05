// rxjs
import { Observable } from 'rxjs';
import * as Mapper from './index';

// firebase
import { AngularFire , FirebaseObjectObservable, FirebaseListObservable, AngularFireAuth, FirebaseRef } from 'angularfire2';

/* ####################################################################################################################
 * ほぼそのままマッピングするもの
 * ################################################################################################################# */
export abstract class AbstractRawMapper<MODEL> {
    constructor( private af: AngularFire ) {}
    protected abstract getBaseUrl(): string;
    protected abstract getId( model: MODEL ): string;                           // MODELから ID 情報を取得する(URLに使用するため)
    protected abstract decomposeNewModel( model: MODEL ): any;                  // データベースに格納する値を作る(新規作成時)
    protected abstract decomposeUpdatedModel( model: MODEL ): any;              // データベースに格納する値を作る(更新時)
    protected abstract composeModel( retrievedData: any ): MODEL;               // MODELを復元する

    private getUrl( id: string ): string {
        return this.getBaseUrl() + '/' + id;
    }
    // IDを指定して、該当するオブジェクトを取得する
    get( id: string ): Observable<MODEL> {
        if( id ) {
            let source = this.af.database.object( this.getUrl( id ) ) as Observable<any>;
            return source.map( dbdata => this.composeModel( dbdata ) );
        }
    }

    // 一括取得
    getAll(): MODEL[]{
        let source = this.af.database.list( this.getBaseUrl() ) as Observable<any>;
        let result: Array<MODEL>;
        source.map( datum => {
            // Observableのチェインにせず、配列のまま扱う
            result = new Array<MODEL>( datum.length );
            for( let i = 0; i < datum.length; i++ ) {
                result[i] = this.composeModel( datum[i] );
            }
        } );
        return result;
    }
 
    // 追加する(既存の場合は強制的に書き換わる)
    set( model: MODEL ): Promise<void>{
        let id = this.getId( model );
        if( id ) {
            // IDがあれば実行
            let db = this.af.database.object( this.getUrl( id ) );
            return db.set( this.decomposeNewModel( model ) ) as Promise<void>;
        } else {
            // IDがない場合は修正できないため例外
            throw new Mapper.NoIdError;
        }
    }
    
    // 変更のあったところだけ書き換える(同実装するかはお任せ)…場合によってはタイムスタンプを除外するのみ
    update( model: MODEL ): Promise<void> {
        let id = this.getId( model );
        if( id ) {
            // IDがあればそのまま使う
            let db = this.af.database.object( this.getUrl( id ) );
            return db.set( this.decomposeUpdatedModel( model ) ) as Promise<void>;
        } else {
            // IDがない場合は修正できないため例外
            throw new Mapper.NoIdError;
        }
    }

    // IDは無視して追加する
    // ID追加後のモデルが必要となるので、Promiseで返す。
    push( model: MODEL ): Promise<string> {
        let db = this.af.database.list( this.getBaseUrl() );
        
        // FirebaseのThenableReferenceから、Key(新しく追加したオブジェクトのID)を返す
        return new Promise( (resolve,reject) => {
            db.push( this.decomposeNewModel( model ) ).then( result => {
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