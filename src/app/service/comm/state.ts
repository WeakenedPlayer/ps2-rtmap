import { DB } from '../index';
import { Observable } from 'rxjs';
import { AngularFire  } from 'angularfire2';

class StateSnapshot {
    constructor( public readonly initialized: boolean = false,
                 public readonly blocked: boolean = false,
                 public readonly finalized: boolean = false,
                 public readonly result: boolean = false) {}
}

/* ####################################################################################################################
 * ハンドシェイクやセッションの状態
 * 状態: 初期, ブロック, 完了
 * 値:　　 結果
 * ################################################################################################################# */
export class State extends DB.SimpleMapper<StateSnapshot> {
    constructor( af:AngularFire, path: DB.Path ) {
        super( af, path );
    }

    // --------------------------------------------------------------------------------------------
    // 型変換
    // --------------------------------------------------------------------------------------------
    protected db2obj( keys: any, values: any ): StateSnapshot {
        if( values.$exists() ) {
            return new StateSnapshot( values.i, values.b, values.f, values.r );
        } else {
            return null;
        }
    }

    /* --------------------------------------------------------------------------------------------
     * DB操作
     * ----------------------------------------------------------------------------------------- */
    private initializeDb(): Promise<void> {
        // initialized: true
        // blocked: false
        // result: false
        // finished: false
        return this.setDb( { i: true, b: false, f: false, r: false } );
    }

    private blockDb( block: boolean ): Promise<void> {
        // blocked: block
        return this.updateDb( { b: block } );
    }

    private concludeDb( result: boolean ): Promise<void> {
        // result: result
        // finished: true
        // blocked: true
        return this.updateDb( { r: result, f: true, b: true} );
    }

    private undoDb(): Promise<void> {
        // result: false
        // finished: false
        // blocked: false
        return this.updateDb( { r: false, f: false, b: false } );
    }

    private deleteDb(): Promise<void> {
        return this.removeDb();
    }
    
    // --------------------------------------------------------------------------------------------
    // DBの状態取得
    // --------------------------------------------------------------------------------------------
    // 修正:　DBがキーを作れるようにする… 
    get(): Observable<StateSnapshot> {
        return this.getDb();
    }
    
    getOnce(): Promise<StateSnapshot> {
        return this.get().take(1).toPromise();
    }
    
    /* --------------------------------------------------------------------------------------------
     * 状態の判定
     * ----------------------------------------------------------------------------------------- */
    private check( decision: ( state: StateSnapshot ) => boolean ) {
        return this.getOnce().then( state => {
            // stateが存在し、判定結果が真かどうか
            return Promise.resolve( decision( state ) );
        } );
    }
    // 存在するか
    checkIfExists(): Promise<boolean> {
        return this.check( state => (state) ? true : false );
    }
    
    // 初期化されているか
    checkIfInitialized(): Promise<boolean> {
        return this.check( state => ( state && state.initialized ) );
    }
    
    // ブロックされているか
    checkIfBlocked(): Promise<boolean> {
        return this.check( state => state && state.blocked );
    }

    // 完了しているか
    checkIfFinalized(): Promise<boolean> {
        return this.check( state => state && state.finalized );
    }

    // 成功しているか
    checkIfSuccess(): Promise<boolean> {
        return this.check( state => ( state && state.finalized && state.result ) );
    }
    
    /* --------------------------------------------------------------------------------------------
     * Reception: 操作
     * Clientの操作をブロックしてから行う
     * 後段で、必要ならブロックを解除する
     * ----------------------------------------------------------------------------------------- */
    private blockAndDo(): Promise<StateSnapshot> {
        return this.blockDb( true ).then( () => {
            return this.getOnce();
        } ).then( state => {
            if( !state || !state.initialized ) {
                // 存在しないデータへの操作のため削除の上Reject
                this.delete().then( () => {
                    Promise.reject( 'Data does no exists.' );
                } );
            }
            // 次の工程に進む
            return Promise.resolve( state );
        } );
    }

    /* --------------------------------------------------------------------------------------------
     * Reception: DBの初期化
     * 既に存在する場合、強制上書きを指定しないと初期化できない
     * ----------------------------------------------------------------------------------------- */
    initialize( force: boolean = false ): Promise<void> {
        if( force ) {
            return this.initializeDb();
        } else {
            return this.checkIfInitialized().then( isInitialized => {
                if( isInitialized ) {
                    return Promise.reject( 'Cannot re-initialize existing State.' );
                } else {
                    return this.initializeDb();
                }
            } );
        }
    }
    
    /* --------------------------------------------------------------------------------------------
     * Reception: 判定結果を保存する
     * ----------------------------------------------------------------------------------------- */
    conclude( decision: Promise<boolean> ): Promise<boolean> {
        return this.blockAndDo().then( state => {
            if( state.finalized  ) {
                Promise.reject( 'Handshake has already been terminated.' );
            }
            // 判定してよい場合は、判定する
            return decision;
        } ).then( result => {
            // 結果を格納し、終わったら結果をPromiseで渡す
            return this.concludeDb( result ).then( ()=> Promise.resolve( result ) );
        } );
    }

    /* --------------------------------------------------------------------------------------------
     * Reception: 状態を判定前に戻す
     * ----------------------------------------------------------------------------------------- */
    revert(): Promise<void> {
        return this.blockAndDo().then( state => {
            if( !state.finalized  ) {
                Promise.reject( 'Handshake is not finished.' );
            }
            return this.undoDb();
        } );
    }

    /* --------------------------------------------------------------------------------------------
     * Reception: 無条件で削除する
     * ----------------------------------------------------------------------------------------- */
    delete(): Promise<void> {
        return this.deleteDb();
    }
}

