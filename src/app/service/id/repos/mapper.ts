// rxjs
import { Observable } from 'rxjs';

// firebase
import { AngularFire , FirebaseObjectObservable, FirebaseListObservable, AngularFireAuth, FirebaseRef } from 'angularfire2';
import * as firebase from 'firebase';

import * as Mapper from './index';

/* ####################################################################################################################
 * 抽象Mapper
 * Firebaseへの格納・取り出しを行う。
 * 継承して、MODEL(ローカルのオブジェクト)とデータベースに格納するオブジェクトを対応付ける。
 * 実装する必要があるメソッド
 * [1] getId: MODELのIDを取り出す
 * [2] getUlr: MODELのURLを指定する
 * [3] decomposeNewModel: MODELをFirebaseに登録する形に変換する(新規登録用)
 * [4] decomposeNewModel: MODELをFirebaseに登録する形に変換する(更新用)
 * [5] composeModel: Firebaseから取り出したデータをMODELに変換する
 * ################################################################################################################# */
export abstract class AbstractMapper<MODEL> {
    constructor( private af: AngularFire ) {}
    protected abstract getBaseUrl(): string;
    protected abstract getId( model: MODEL ): string;                           // MODELから ID 情報を取得する(URLに使用するため)
    protected abstract decomposeNewModel( model: MODEL ): any;                  // データベースに格納する値を作る(新規作成時)
    protected abstract decomposeUpdatedModel( model: MODEL ): any;              // データベースに格納する値を作る(更新時)
    protected abstract composeModel( retrievedData: any ): Observable<MODEL>;   // MODELを復元する

    private getUrl( id: string ): string {
        return this.getBaseUrl() + '/' + id;
    }
    // IDを指定して、該当するオブジェクトを取得する
    get( id: string ): Observable<MODEL> {
        if( id ) {
            let source = this.af.database.object( this.getUrl( id ) ) as Observable<any>;
            return source.flatMap( dbdata => this.composeModel( dbdata ) );
        }
    }
    
    // 一括取得
    getAll(): Observable<MODEL[]>{
        // 備考: Firebaseのlistは、一要素の変更があっても全要素が更新される。
        // Firebaseから配列を一式もらうごとに、データベースに格納したデータをMODELに変形するObservableを後段に渡す
        let source = this.af.database.list( this.getBaseUrl() ) as Observable<any>;
        let obs = source.flatMap( dbdatum => {
            let observables = new Array<Observable<any>>( dbdatum.length );
            for( let i = 0; i < dbdatum.length; i++ ) {
                observables[i] = this.composeModel( dbdatum[i] );
            }

            return Observable.from( observables )           // Observable の配列の全要素
                             .mergeAll()                    //  +- を並列に実行
                             .take( dbdatum.length )        //  +- 配列の要素数だけ集まるまで待機する
                             .toArray();                    //  +- を配列にまとめて後段に渡す
        } );
        return obs;
    }
 
    // 追加する(既存の場合は強制的に書き換わる)
    set( model: MODEL ): Promise<void>{
        let id = this.getId( model );
        if( id ) {
            // IDがあれば実行
            let db = this.af.database.object( this.getUrl( id ) );
            return db.set( this.decomposeNewModel( model ) ) as Promise<void>;
        } else {
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
            throw new Mapper.NoIdError;
        }
    }
}
