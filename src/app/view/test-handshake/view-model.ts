import { Census, Identification, Comm, DB } from '../../service';
import { AngularFire, AngularFireAuth } from 'angularfire2';
import { Observable, Subscription } from 'rxjs';

import { HandshakeTest } from '../../test';

/* ####################################################################################################################
 * 受付 出題する
 * 要求 ゲームを通して回答する
 * 連絡: 一致していたら登録確認、不一致ならリトライ確認
 * ################################################################################################################# */
const maxBuffer = 3;
const reqPerPage = 2;

class ReceptionQuerySnapshot {
    constructor( public readonly cid: string,
                 public readonly timestamp: number,
                 public readonly question: string ){}
}

class ClientAnswerSnapshot {
    constructor( public readonly answer: string ){}
}

class ConfirmCidHandshake extends Comm.Handshake<ReceptionQuerySnapshot,ClientAnswerSnapshot> {
    constructor( af: AngularFire, rid: string, cid: string ) {
        super( af, new DB.Path( [ 'ids', 'hs', rid, cid, 'cfm' ] ) );
    }
    
    protected decide( snapshot: Comm.HandshakeSnapshot<ReceptionQuerySnapshot,ClientAnswerSnapshot> ): boolean {
        // 送信と受信が同じならOK
        if( snapshot && snapshot.client.message && snapshot.reception.message ) {
            return ( snapshot.client.message.answer === snapshot.reception.message.question );
        } else {
            return false;
        }
    }
}

export class ViewModel {
    // Censusで検索する情報
    requestList: Observable<Identification.Request[]>;
    profileMapObservable: Observable<{ [key:string]: Census.CharacterProfile }>;
    worldList: Observable<Census.World[]>;

    constructor( private af: AngularFire,
                 private census: Census.Service,
                 private ids: Identification.Service ){
        
        ids.authStateObservable
        let hs1 = new ConfirmCidHandshake( af, 'sPOD5jUfXfO7k4DdwNFLoq0MpKu2', 'sPOD5jUfXfO7k4DdwNFLoq0MpKu2' );
    }
}