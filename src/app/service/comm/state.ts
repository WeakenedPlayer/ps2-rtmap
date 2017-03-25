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
     * 定型操作
     * block をセットしてから操作を行う。
     * block の解除が必要なら、データベースの更新時に行う
     * ----------------------------------------------------------------------------------------- */
    private execute( action: ( s: StateSnapshot ) => Promise<any> ): Promise<any> {
        return new Promise( ( resolve, reject ) => {
            this.blockDb( true ).then( () => {
                return this.getOnce();
            } ).then( ( state ) => {
                // 初期化されていない場合（データがBlockedだけの場合）は削除してからReject
                if( ( !state )  && !state.initialized ) {
                    this.deleteDb().then( () => reject( 'Cannot execute action: Data does no exists.' ) );   
                }

                // 実行可能なら実行する
                action( state ).then( ( result ) => resolve( result ) );
            } );
        } );
    }
    
    /* --------------------------------------------------------------------------------------------
     * DBの初期化
     * 既に存在する場合、強制上書きを指定しないと初期化できない
     * ----------------------------------------------------------------------------------------- */
    initialize( force: boolean = false ): Promise<void> {
        if( force ) {
            return this.initializeDb();
        } else {
            return new Promise( ( resolve, reject ) => {
                return this.getOnce().then( ( state ) => {
                    if( ( !state ) || ( !state.initialized ) ) {
                        return this.initializeDb().then( () => resolve() );
                    } else {
                        reject( 'Cannot re-initialize existing State.' );
                    }
                } );
            } );
        }
    }
    
    /* --------------------------------------------------------------------------------------------
     * 判定結果を保存する
     * ----------------------------------------------------------------------------------------- */
    conclude( decision: Promise<boolean> ): Promise<boolean> {
        let action = ( state ) => {
            return new Promise( ( resolve, reject ) => {
                // 初期化されていない場合（データがBlockedだけの場合）は削除してからReject
                if( state.finalized  ) {
                    reject();
                } else {
                    // 判定してよい場合は、判定し、最後にResolve
                    decision.then( ( result ) => {                    
                        this.concludeDb( result ).then( () => resolve( result ) );
                    } );
                }
            } );
        };
        
        return this.execute( action );
    }

    /* --------------------------------------------------------------------------------------------
     * 状態を判定前に戻す
     * ----------------------------------------------------------------------------------------- */
    revert(): Promise<void> {
        let action = ( state ) => {
            return new Promise( ( resolve, reject ) => {
                // 初期化されていない場合（データがBlockedだけの場合）は削除してからReject
                if( !state.finalized  ) {
                    reject();
                } else {
                    this.undoDb().then( () => resolve() );
                }
            } );
        };
        
        return this.execute( action );
    }
}

