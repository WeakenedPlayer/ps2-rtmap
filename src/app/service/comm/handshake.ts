import { DB, Comm } from '../index';
import { AngularFire  } from 'angularfire2';
import { Observable } from 'rxjs';

/* ####################################################################################################################
 * ハンドシェイクをDB上で行うクラス
 * ハンドシェイクの開始を送信側ととらえTX、受け手をRXと表現している。
 * reception
 * client
 * ################################################################################################################# */
export abstract class Handshake<RECEPTION,CLIENT> extends DB.SimpleMapper<Comm.HandshakeSnapshot<RECEPTION,CLIENT>> {
    state: Comm.State;
    constructor( af:AngularFire, path: DB.Path ) {
        super( af, path.move( DB.Path.fromUrl( 'm' ) ) );
        this.state = new Comm.State( af, path.move( DB.Path.fromUrl( 's' ) ) );
    }

    // DB状のデータのデータの復元
    protected db2obj( keys: any, values: any ): Comm.HandshakeSnapshot<RECEPTION,CLIENT> {
        // r: reception
        // c: client
        let rm = ( values.r === undefined ) ? null : new Comm.Message<RECEPTION>( values.r.t, values.r.m );
        let cm = ( values.c === undefined ) ? null : new Comm.Message<CLIENT>( values.c.t, values.c.m );
        return new Comm.HandshakeSnapshot<RECEPTION,CLIENT>( rm, cm );
    }

    // terminate の時に result をどうするか
    protected abstract decide( snapshot: Comm.HandshakeSnapshot<RECEPTION,CLIENT> ): boolean;
    
    // --------------------------------------------------------------------------------------------
    // Reception methods
    // --------------------------------------------------------------------------------------------
    // ハンドシェイクを削除する
    delete(): Promise<void> {
        return this.removeDb(); 
    }
    // ハンドシェイクを開始する
    initiate( receptionMessage: RECEPTION, force: boolean = false ): Promise<void> {
        return this.state.initialize( force ).then( () => {
            // この時点で書き込み可能になっている （そうでなければ reject されている) 
            return this.setDb( { r: { t: DB.TimeStamp, m: receptionMessage } } );
        } );
    }
    
    // 応答をブロックしたうえで、判定結果を入力し、完了状態にする。
    terminate(): Promise<void> {
        let decision = new Promise<boolean>( ( resolve, reject ) => {
            this.getSnapshotOnce().then( snapshot => {
                if( snapshot ) {
                    resolve( this.decide( snapshot ) );
                } else {
                    reject( 'handshake does not exist.' );
                }
            } );
        } );
        return this.state.conclude( decision );
    }
    
    // 完了状態と入力ブロックを解除し、再度判定できるようにする
    undoTerminate(): Promise<void> {
        return this.state.revert();
    }

    // --------------------------------------------------------------------------------------------
    // Client methods
    // --------------------------------------------------------------------------------------------
    // 応答
    respond( clientMessage: CLIENT ): Promise<void> {
        return this.updateDb( { c: { t: DB.TimeStamp, m: clientMessage } } );
    }

    // --------------------------------------------------------------------------------------------
    // State
    // --------------------------------------------------------------------------------------------
    // メッセージと状態全て取得する
    getSnapshot(): Observable<Comm.HandshakeSnapshot<RECEPTION,CLIENT>> {
        return this.getDb();
    }

    getSnapshotOnce(): Promise<Comm.HandshakeSnapshot<RECEPTION,CLIENT>> {
        return this.getSnapshot().take(1).toPromise();
    }
}
