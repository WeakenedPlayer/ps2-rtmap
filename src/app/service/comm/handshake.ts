import { DB, Comm } from '../index';
import { AngularFire  } from 'angularfire2';
import { Observable } from 'rxjs';

/* ####################################################################################################################
 * ハンドシェイクをDB上で行うクラス
 * ハンドシェイクの開始を送信側ととらえTX、受け手をRXと表現している。
 * reception
 * client
 * ################################################################################################################# */
export abstract class Handshake<RECEPTION,CLIENT> extends DB.SimpleMapper<Comm.HandShakeData<RECEPTION,CLIENT>> {
    constructor( af:AngularFire, private rid: string, private cid: string, urlPrefix: string, urlSuffix: string ) {
        super( af, urlPrefix + '/$rid/$cid' + urlSuffix );
    }

    // DB状のデータのデータの復元
    protected db2obj( keys: any, values: any ): Comm.HandShakeData<RECEPTION,CLIENT> {
        // r: reception
        // c: client
        let rm = ( values.r === undefined ) ? null : new Comm.Message<RECEPTION>( keys.rid, values.r.t, values.r.m );
        let cm = ( values.c === undefined ) ? null : new Comm.Message<CLIENT>( keys.cid, values.c.t, values.c.m );
        let s  = new Comm.State( values.result, values.blocked, values.finalized );
        return new Comm.HandShakeData<RECEPTION,CLIENT>( rm, cm, s );
    }

    // terminate の時に result をどうするか
    protected abstract conclude( state: Comm.HandShakeData<RECEPTION,CLIENT> ): boolean;
    
    // --------------------------------------------------------------------------------------------
    // Reception methods
    // --------------------------------------------------------------------------------------------
    // ハンドシェイクを削除する
    delete(): Promise<void> {
        return this.removeDb( { rid: this.rid, cid: this.cid } ); 
    }

    // ハンドシェイクを開始する
    initiate( receptionMessage: RECEPTION, force: boolean = false ): Promise<void> {
        // 応答は初期化される
        return new Promise( ( resolve, reject ) => {
            this.getStateOnce()
            .then( data => {
                if( !data || force || !data.state.finalized ) {
                    return this.setDb( { rid: this.rid,
                                         cid: this.cid,
                                         r: { t: DB.TimeStamp, m: receptionMessage },
                                         result: false,
                                         blocked: false,
                                         finalized: false }
                    ).then( () => { resolve() } );
                } else {
                    reject();
                }
            } );
        } );
    }
    
    // 応答をブロックしたうえで、判定結果を入力し、完了状態にする。
    terminate(): Promise<boolean> {
        return new Promise( ( resolve, reject ) => {
            let result: boolean = false;
            // 応答をブロック
            return this.updateDb( { rid: this.rid,
                                    cid: this.cid,
                                    blocked: true } )
            .then( () => {
                // 最新の応答値を取得
                return this.getState().take(1).toPromise();
            } )
            .then( ( data ) => {
                if( ( !data ) || data.state.finalized ) {
                    console.log( 'oops');
                    reject();
                }
                // 検証
                result = this.validate( data );
                return this.updateDb( { rid: this.rid,
                                        cid: this.cid,
                                        result: result,
                                        blocked: true,
                                        finalized: true } );
            } ).then( () => {
                resolve( result );
            } );
        } );
    }
    
    // 完了状態と入力ブロックを解除し、再度判定できるようにする
    undoTerminate(): Promise<void> {
        return this.updateDb( { rid: this.rid,
                                cid: this.cid,
                                result: false,
                                blocked: false,
                                finalized: false } );
    }

    // --------------------------------------------------------------------------------------------
    // Client methods
    // --------------------------------------------------------------------------------------------
    // 応答
    respond( clientMessage: CLIENT ): Promise<void> {
        return this.updateDb( { rid: this.rid,
                                cid: this.cid,
                                c: { t: DB.TimeStamp, m: clientMessage } } );
    }

    // --------------------------------------------------------------------------------------------
    // State
    // --------------------------------------------------------------------------------------------
    // メッセージと状態全て取得する
    getState(): Observable<Comm.HandShakeData<RECEPTION,CLIENT>> {
        return this.getDb( { rid: this.rid, cid: this.cid } );
    }

    getStateOnce(): Promise<Comm.HandShakeData<RECEPTION,CLIENT>> {
        return this.getState().take(1).toPromise();
    }
}
