// firebase
import { DB } from './index';
import { AngularFire , FirebaseObjectObservable, FirebaseListObservable, AngularFireAuth, FirebaseRef } from 'angularfire2';
import * as firebase from 'firebase';
import { Observable, Subscriber } from 'rxjs';

/* ####################################################################################################################
 * 簡単なクラスに変換するマッパ
 * 外部キーがあってもJoinはしない
 * ################################################################################################################# */
export abstract class SimpleMapper<T> implements DB.GroupMapper<T> {
    private mapper: DB.ObjectMapper = null;
    constructor( af: AngularFire, url: string ) {
        this.mapper = new DB.ObjectMapper( af, url );
    }
    
    // --------------------------------------------------------------------------------------------
    // キーとDBから取得した値を用いて値を復元する
    // --------------------------------------------------------------------------------------------
    protected abstract db2obj( keys: any, values: any ): T;
    protected abstract obj2db( obj: T, isNew: boolean ): any;

    // --------------------------------------------------------------------------------------------
    // [C]RUD
    // オブジェクトを渡して、新しい値を作る(既存の場合は上書き)
    // --------------------------------------------------------------------------------------------
    set( obj: T ): Promise<void> {
        return this.mapper.set( this.obj2db( obj, true ) );
    }
    
    // --------------------------------------------------------------------------------------------
    // [C]RUD
    // --------------------------------------------------------------------------------------------
    push( obj: T ): Promise<string> {
        return new Promise( ( resolve ) => {
            this.mapper.push( this.obj2db( obj, true ) ).then( obj => {
                resolve( obj.key );
            } );
        } );
    }

    // --------------------------------------------------------------------------------------------
    // C[R]UD
    // キーとDBから取得した値を用いて読み出す
    // --------------------------------------------------------------------------------------------
    get( keys: any ): Observable<T> {
        // materialize を防ぐため、map は使わず、必要な処理を一つのObservableで実行する。
        return Observable.create( ( subscriber: Subscriber<T> ) => {
            let subscription = this.mapper.get( keys ).subscribe( ( dbData ) => {
                let result: T;
                if( dbData.values.$exists ) {
                    result = this.db2obj( dbData.keys, dbData.values );
                } else {
                    // Subscribeしていたデータが消滅したら null にする
                    result = null;
                }
                subscriber.next( result );
            },
            (err)=>{},
            ()=>{} );
            return subscription;
        } );
    }

    // --------------------------------------------------------------------------------------------
    // C[R]UD
    // --------------------------------------------------------------------------------------------
    getAll( keys ?: any ) {
        // materialize を防ぐため、map は使わず、必要な処理を一つのObservableで実行する。
        return Observable.create( ( subscriber: Subscriber<T[]> ) => {
            let subscription = this.mapper.getAll( keys ).subscribe( ( dbData ) => {
                let result = Array<T>( dbData.values.length );
                dbData.values.forEach( ( value, index ) => {
                    if( value.$exists ) {
                        result[ index ] = this.db2obj( dbData.keys, value );
                    } else { 
                        result[ index ] = null;
                    }
                } );
                subscriber.next( result );
            },
            (err)=>{},
            ()=>{} );
            return subscription;
        } );
    }

    // --------------------------------------------------------------------------------------------
    // オブジェクトを渡して、DBの値を一部上書きする(タイムスタンプを上書きから除外したい場合を想定)
    // --------------------------------------------------------------------------------------------
    update( obj: T ): Promise<void> {
        return this.mapper.update( this.obj2db( obj, false ) );
    }

    // --------------------------------------------------------------------------------------------
    // キーを指定して、該当するオブジェクトを削除
    // --------------------------------------------------------------------------------------------
    remove( keys: any ): Promise<void> {
        return this.mapper.remove( keys );
    }
    
    // --------------------------------------------------------------------------------------------
    // キーを指定して、該当するオブジェクト群を削除
    // --------------------------------------------------------------------------------------------
    removeAll( keys: any ): Promise<void> {
        return this.mapper.removeAll( keys );
    }
}

