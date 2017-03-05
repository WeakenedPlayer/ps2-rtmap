// rxjs
import { Observable } from 'rxjs';

// firebase
import { AngularFire , FirebaseObjectObservable, FirebaseListObservable, AngularFireAuth, FirebaseRef } from 'angularfire2';
import * as firebase from 'firebase';

import * as Mapper from './index';

/* ####################################################################################################################
 * クラスマッパ
 * Firebaseへの格納・取り出しを行う。
 * 継承して、MODEL(ローカルのオブジェクト)とデータベースに格納するオブジェクトを対応付ける。
 * 実装する必要があるメソッド
 * [1] getId: MODELのIDを取り出す
 * [2] getUlr: MODELのURLを指定する
 * [3] decomposeNewModel: MODELをFirebaseに登録する形に変換する(新規登録用)
 * [4] decomposeNewModel: MODELをFirebaseに登録する形に変換する(更新用)
 * [5] composeModel: Firebaseから取り出したデータをMODELに変換する
 * ################################################################################################################# */
export abstract class AbstractClassMapper<T> extends Mapper.AbstractRawMapper {
    constructor( af: AngularFire ) { super( af ); }
    protected abstract getId( data: T ): string;
    protected abstract decomposeNewModel( data: T ): any;      // データベースに格納する値を作る(新規作成時)
    protected abstract decomposeUpdatedModel( data: T ): any;  // データベースに格納する値を作る(更新時)
    protected abstract composeModel( retrievedData: any ): T;   // MODELを復元する

    // IDを指定して、該当するオブジェクトを取得する
    get( id: string ): Observable<T> {
        return this.getRaw( id ).map( dbData => this.composeModel( dbData ) );
    }
    
    // 一括取得
    getAll(): Observable<T[]>{
        let obs = super.getAllRaw().map( dbDatum => {
            // Observableは使わず、配列のまま処理する(ReactiveX風ではないが速いかもしれないので)
            let datum = new Array<T>( dbDatum.length );
            for( let i = 0; i < dbDatum.length; i++ ) {
                datum[i] = this.composeModel( dbDatum[i] );
            }
            return datum;
        } );
        return obs;
    }
 
    // 追加する(既存の場合は強制的に書き換わる)
    set( data: T ): Promise<void>{
        return super.setRaw( this.getId( data ), this.decomposeNewModel( data ) ) as Promise<void>;
    }
    
    // 変更のあったところだけ書き換える(同実装するかはお任せ)…場合によってはタイムスタンプを除外するのみ
    update( data: T ): Promise<void> {
        return super.updateRaw( this.getId( data ),  this.decomposeUpdatedModel( data ) ) as Promise<void>;
    }

    // IDは無視して追加する
    // ID追加後のモデルが必要となるので、Promiseで返す。
    push( data: T ): Promise<string> {
        return super.pushRaw( this.decomposeNewModel( data ) ) as Promise<void>;
    }
}
