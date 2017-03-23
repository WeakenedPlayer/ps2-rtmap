import { DB } from '../index';
import { AngularFire  } from 'angularfire2';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/toPromise';


// local
import * as HS from './local';

/* ####################################################################################################################
 * ハンドシェイクをDB上で行うクラス
 * ハンドシェイクの開始を送信側ととらえTX、受け手をRXと表現している。
 * TX側: initiate, terminate
 * RX側: respond
 * ################################################################################################################# */
export class HandShake<TX,RX> extends DB.SimpleMapper<HS.HandShakeData<TX,RX>> {
    constructor( af:AngularFire, url: string, private uid: string) {
        super( af, url );
    }

    // 復元
    protected db2obj( keys: any, values: any ): HS.HandShakeData<TX,RX> {
        let tx = ( values.t === undefined ) ? null : new HS.Message<TX>( keys.tid, values.t.t, values.t.m );
        let rx = ( values.r === undefined ) ? null : new HS.Message<RX>( keys.rid, values.r.t, values.r.m );
        let s  = new HS.State( values.v, values.l, values.f );
        return new HS.HandShakeData<TX,RX>( tx, rx, s );
    }

    // --------------------------------------------------------------------------------------------
    // TX側のメソッド
    // --------------------------------------------------------------------------------------------
    // ロック状態の変更
    private setLock( uid: string, lock: boolean ): Promise<void> {
        return this.updateDb( { tid: this.uid,
                                rid: uid,
                                l: lock } );
    }
    lock( uid: string ): Promise<void>       { return this.setLock( uid, true ); }
    unlock( uid: string ): Promise<void>     { return this.setLock( uid, false ); }

    // 有効・無効の変更
    private setValidity( uid: string, validity: boolean ): Promise<void> {
        return this.updateDb( { tid: this.uid,
                                rid: uid,
                                v: validity } );
    }
    invalidate( uid: string ): Promise<void> { return this.setValidity( uid, true ); }
    validate( uid: string ): Promise<void>   { return this.setValidity( uid, false ); }

    // 削除
    delete( uid: string ): Promise<void>     { return this.removeDb( { tid: this.uid, rid: uid } ); }


    // ハンドシェイク開始
    initiate( uid: string, data: TX ): Promise<void> {
        // 応答は初期化される
        return this.setDb( { tid: this.uid,
                             rid: uid,
                             t: { t: DB.TimeStamp, m: data },
                             v: false,
                             l: false,
                             f: false } );
    }

    // ハンドシェイク終了(終了するとともにロックもする)
    terminate( uid: string ): Promise<void> {
        return this.updateDb( { tid: this.uid,
                                rid: uid,
                                f: true,
                                l: true } );
    }

    // --------------------------------------------------------------------------------------------
    // RX側のメソッド
    // --------------------------------------------------------------------------------------------
    // 応答
    respond( uid: string, data: RX ): Promise<void> {
        return this.updateDb( { tid: uid,
                                rid: this.uid,
                                r: { t: DB.TimeStamp, m: data } } );
    }

    // --------------------------------------------------------------------------------------------
    // 共通のメソッド
    // --------------------------------------------------------------------------------------------
    // メッセージと状態全て取得する
    getState( uid: string ): Observable<HS.HandShakeData<TX,RX>> {
        return this.getDb( { tid: this.uid, rid: uid } );
    }
}
