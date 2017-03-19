import {  Identification } from '../../index';

/* ####################################################################################################################
 * 要求 なんか変だけど UserIdentity(確認済み)とは分けて考える
 * Userの属性に見えるが…一応ライフサイクルが違うので作成してある
 * ほとんど値オブジェクトみたいなもの
 * スナップショットを作る責務があるくらいか
 * ################################################################################################################# */
export class Request{
    constructor(
            public readonly uid,
            public readonly cid,
            public readonly requestedAt?: number ) {
    }
    
    isUpdated( req: Request ): boolean {
        return ( this.requestedAt !== req.requestedAt );
    }
    
    isIdentical( req: Request ): boolean {
        return ( ( this.uid === req.uid )
              && ( this.cid === req.cid )
              && ( this.requestedAt === req.requestedAt ) );
    }
}

export class RequestHeader {
    public readonly userId: string;
    public readonly userName: string;
    public readonly characterId: string;
    public readonly characterName: string;
    public readonly requestedAt: number;
    constructor( 
            ){}
}

/* ####################################################################################################################
 * 要求を受け付けた時のスナップショット = DBに格納する形
 * ################################################################################################################# */
export class RequestSnapshot {
    // 新規に作る場合のみ
    constructor(
            public readonly uid: string,
            public readonly cid: string,
            public readonly requestedAt: number) {
    }
}
