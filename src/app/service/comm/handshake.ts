import { DB, Comm } from '../index';
import { AngularFire  } from 'angularfire2';
import { Observable } from 'rxjs';

/* ####################################################################################################################
 * ハンドシェイクをDB上で行うクラス
 * ハンドシェイクの開始を送信側ととらえTX、受け手をRXと表現している。
 * TX側: initiate, terminate
 * RX側: respond
 * ################################################################################################################# */
export abstract class Handshake<TX,RX> extends DB.SimpleMapper<Comm.HandShakeData<TX,RX>> {
    constructor( af:AngularFire, private uid: string, urlPrefix: string, urlSuffix: string ) {
        super( af, urlPrefix + '/$tid/$rid' + urlSuffix );
    }

    // DB状のデータのデータの復元
    protected db2obj( keys: any, values: any ): Comm.HandShakeData<TX,RX> {
        let tx = ( values.t === undefined ) ? null : new Comm.Message<TX>( keys.tid, values.t.t, values.t.m );
        let rx = ( values.r === undefined ) ? null : new Comm.Message<RX>( keys.rid, values.r.t, values.r.m );
        let s  = new Comm.State( values.result, values.blocked, values.finalized );
        return new Comm.HandShakeData<TX,RX>( tx, rx, s );
    }

    protected abstract validate( state: Comm.HandShakeData<TX,RX> ): boolean;
    
    // --------------------------------------------------------------------------------------------
    // TX側のメソッド
    // --------------------------------------------------------------------------------------------
    // 削除
    delete( uid: string ): Promise<void> {
        return this.removeDb( { tid: this.uid, rid: uid } ); 
    }

    // ハンドシェイク開始
    initiate( uid: string, tx: TX, force: boolean = false ): Promise<void> {
        // 応答は初期化される
        return new Promise( ( resolve, reject ) => {
            this.getStateOnce( uid )
            .then( data => {
                if( !data || force || !data.state.finalized ) {
                    return this.setDb( { tid: this.uid,
                                         rid: uid,
                                         t: { t: DB.TimeStamp, m: tx },
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
    
    // 応答をブロックしたうえで結果を入力する
    terminate( uid: string ): Promise<boolean> {
        return new Promise( ( resolve, reject ) => {
            let result: boolean = false;
            // 応答をブロック
            return this.updateDb( { tid: this.uid,
                                    rid: uid,
                                    blocked: true } )
            .then( () => {
                // 最新の応答値を取得
                return this.getState( uid ).take(1).toPromise();
            } )
            .then( ( data ) => {
                if( ( !data ) || data.state.finalized ) {
                    console.log( 'oops');
                    reject();
                }
                // 検証
                result = this.validate( data );
                return this.updateDb( { tid: this.uid,
                                        rid: uid,
                                        result: result,
                                        blocked: true,
                                        finalized: true } );
            } ).then( () => {
                resolve( result );
            } );
        } );
    }
    
    // 完了状態と入力ブロックを解除し、再判定できるようにする
    undoTerminate( uid: string ): Promise<void> {
        return this.updateDb( { tid: this.uid,
                                rid: uid,
                                result: false,
                                blocked: false,
                                finalized: false } );
    }

    // --------------------------------------------------------------------------------------------
    // RX側のメソッド
    // --------------------------------------------------------------------------------------------
    // 応答
    respond( uid: string, rx: RX ): Promise<void> {
        return this.updateDb( { tid: uid,
                                rid: this.uid,
                                r: { t: DB.TimeStamp, m: rx } } );
    }

    // --------------------------------------------------------------------------------------------
    // 共通のメソッド
    // --------------------------------------------------------------------------------------------
    // メッセージと状態全て取得する
    getState( uid: string ): Observable<Comm.HandShakeData<TX,RX>> {
        return this.getDb( { tid: this.uid, rid: uid } );
    }

    getStateOnce( uid: string ): Promise<Comm.HandShakeData<TX,RX>> {
        return this.getDb( { tid: this.uid, rid: uid } ).take(1).toPromise();
    }
}
