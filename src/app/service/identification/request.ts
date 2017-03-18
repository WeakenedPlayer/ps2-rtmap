import { User, Identification } from '../index';

/* ####################################################################################################################
 * 要求 なんか変だけど UserIdentity(確認済み)とは分けて考える
 * Userの属性に見えるが…一応ライフサイクルが違うので作成してある
 * ほとんど値オブジェクトみたいなもの
 * スナップショットを作る責務があるくらいか
 * ################################################################################################################# */
export class Request{
    constructor(
            public readonly user: User,
            public readonly character: Identification.Character,
            public readonly requestedAt?: number ) {
    }
    
    takeSnapshot(): RequestSnapshot {
        return new RequestSnapshot(
            this.user.uid,
            this.character.cid,
            this.requestedAt );
    }
    
    isUpdated( snapshot: RequestSnapshot ): boolean {
        return ( this.requestedAt > snapshot.requestedAt );
    }
    
    isIdentical( snapshot: RequestSnapshot ): boolean {
        return ( ( this.user.isIdentical( snapshot.uid ) )
              && ( this.character.isIdentical( snapshot.cid ) )
              && ( this.requestedAt === snapshot.requestedAt ) );
    }
    
    isIdenticalUser( newRequest: Request ): boolean {
        return this.user.isIdentical( newRequest.user );
    }
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
