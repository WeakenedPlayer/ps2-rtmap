import { DB, Comm } from '../index';
import { AngularFire  } from 'angularfire2';
import { Observable } from 'rxjs';

/* ####################################################################################################################
 * 
 * 開始: 最初のHandshake
 * ################################################################################################################# */
export abstract class Session {
    state: Comm.State;
    currentHandshake: Comm.Handshake<any,any>;
    log: Comm.Handshake<any,any>[] = [];

    constructor(　private af:AngularFire, private path: DB.Path ) {
        this.state = new Comm.State( af, path.move( DB.Path.fromUrl( 's' ) ) );
    }

    // terminate の時に result をどうするか
    protected abstract initializeFirstHandshake(): Promise<void>;

    /* --------------------------------------------------------------------------------------------
     * 削除
     * ----------------------------------------------------------------------------------------- */
    private deleteHandshakes(): Promise<void> {
        let deletePromises = Array<Promise<void>>( this.log.length );
        for( let i=1; i < this.log.length; i++ ) {
            deletePromises[i] = this.log[i].delete();
        }
        return Promise.all( deletePromises );
    }
    
    private proceedHandshake( next: Comm.Handshake<any,any> ): void {
        this.currentHandshake = next;
        this.log.push( next );
    }

//    private terminate(): Promise<void> {
//        return this.state.doUnlessBlocked().then( () => {
//            this.getSnapshotOnce().then( snapshot => {
//                if( snapshot ) {
//                    resolve( this.decide( snapshot ) );
//                } else {
//                    reject( 'handshake does not exist.' );
//                }
//            } ); 
//        } );
//        return this.state.conclude( decision );
//    }
    /* --------------------------------------------------------------------------------------------
     * セッションを開始する
     * ----------------------------------------------------------------------------------------- */
    initialize( force: true ): Promise<void> {
        return this.state.initialize( force ).then( () => {
            // この時点で書き込み可能になっている （そうでなければ reject されている) 
            return this.deleteHandshakes();
        } ).then( () => {
            this.proceedHandshake( this.initializeFirstHandshake() );
        } );
    }
    /* --------------------------------------------------------------------------------------------
     * 次に進める
     * ----------------------------------------------------------------------------------------- */
//    proceed(): Promise<void> {
//        return this.state.doUnlessBlocked().then( () => {
//            return this.currentHandshake.terminate();
//        } ).then( () => {
//            return this.currentHandshake.state.doWhenSuccess();
//        } ).then( () => {
//            let next = this.nextHandshake( result );
//            let promise: Promise<void>;
//            if( next ) {
//                this.proceedHandshake( next );
//                promise = Promise.resolve();
//            } else {
//                promise = this.terminate();
//            }
//            return promise;
//        } );
//    }
    /* --------------------------------------------------------------------------------------------
     * 削除する
     * ----------------------------------------------------------------------------------------- */
    delete(): Promise<void> {
        // 状態を削除することで、削除中の変更を防ぐ
        return this.state.delete().then( () => {
            return this.deleteHandshakes();
        } ); 
    }
    
    /* --------------------------------------------------------------------------------------------
     * 削除する
     * ----------------------------------------------------------------------------------------- */
    undoTerminate(): Promise<void> {
        return this.state.revert();
    }
}
