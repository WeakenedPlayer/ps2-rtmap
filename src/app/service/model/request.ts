import * as Model from './index';

/* ####################################################################################################################
 * 要求 なんか変だけど UserIdentity(確認済み)とは分けて考える
 * Userの属性に見えるが…一応ライフサイクルが違うので作成してある
 * ほとんど値オブジェクトみたいなもの
 * スナップショットを作る責務があるくらいか
 * ################################################################################################################# */
export class IdentificationRequest{
    constructor(
            public readonly user: Model.User,
            public readonly character: Model.Character,
            public readonly requestedAt?: number ) {
    }
    
    takeSnapshot(): IdentificationRequestSnapshot {
        return new IdentificationRequestSnapshot(
            this.user.uid,
            this.character.cid,
            this.requestedAt );
    }
    
    isUpdated( snapshot: IdentificationRequestSnapshot ): boolean {
        return ( this.requestedAt > snapshot.requestedAt );
    }
    
    isIdentical( snapshot: IdentificationRequestSnapshot ): boolean {
        return ( ( this.user.isIdentical( snapshot.uid ) )
              && ( this.character.isIdentical( snapshot.cid ) )
              && ( this.requestedAt === snapshot.requestedAt ) );
    }
    
    isIdenticalUser( newRequest: IdentificationRequest ): boolean {
        return this.user.isIdentical( newRequest.user );
    }
}

/* ####################################################################################################################
 * 要求を受け付けた時のスナップショット
 * ################################################################################################################# */
export class IdentificationRequestSnapshot {
    // 新規に作る場合のみ
    constructor(
            public readonly uid: string,
            public readonly cid: string,
            public readonly requestedAt: number) {
    }
}
