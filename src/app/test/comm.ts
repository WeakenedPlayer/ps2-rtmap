import { DB, Comm } from '../service/index';
import { AngularFire, AngularFireAuth } from 'angularfire2';
import { Observable, Subscription } from 'rxjs';


class TestHandShake extends Comm.Handshake<string,string> {
    constructor( af: AngularFire, rid: string, cid: string ) {
        super( af, new DB.Path( [ 'refactor', 'handshake', rid, cid, 'stage1' ] ) );
    }
    
    protected decide( snapshot: Comm.HandshakeSnapshot<string,string> ): boolean {
        // 送信と受信が同じならOK
        let result: boolean = false;
        if( snapshot.reception && snapshot.client ) {
            result = snapshot.reception.message === snapshot.client.message;
        }
        return result;
    }
}

export class CommCheck {
    constructor( private af: AngularFire ) {}
    
    check( correctAnswer: string, wrongAnswer: string ) {
        let comm = new TestHandShake( this.af, 'sPOD5jUfXfO7k4DdwNFLoq0MpKu2', 'sPOD5jUfXfO7k4DdwNFLoq0MpKu2' );

        console.log( 'Handshake: Delete old data' );
        comm.delete().then( () => {
            console.log( 'Reception: Initialize' );
            return comm.initialize( correctAnswer, true );
        } ).then( () => {
            console.log( 'Client: Response' );
            return comm.respond( wrongAnswer );
        } ).then( () => {
            console.log( 'Reception: Terminate' );
            return comm.terminate();
        } ).then( result => {
            if( result ) {
                console.log( 'Result: success' );
            } else {                
                console.log( 'Result: fail' );
                console.log( 'Client: Retry...but it will be rejected' );
                return comm.respond( correctAnswer );
            }
        } ).catch( reason => {
            console.log( '---------------------------------' );
            console.log( reason );
            console.log( '---------------------------------' );
            console.log( 'Reception: Undo termination' );
            return comm.undoTerminate().then( () => {
                console.log( 'Client: Retry...this time, it will be resolved.' );
                return comm.respond( 'hello' );
            } ).then( () => {
                console.log( 'Reception: Terminate' );
                return comm.terminate();
            } ).then( result => {
                if( result ) {
                    console.log( 'Result: success!!' );
                } else {                
                    console.log( 'Result: failed...something is wrong.');
                }
            } );
        } );
    }
}
