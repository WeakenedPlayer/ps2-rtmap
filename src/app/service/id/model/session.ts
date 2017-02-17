import * as Model from './index';
export class IdentificationSessionOutdatedError implements Error {
    public name: string;
    public message: string;
    constructor() {
        this.name = 'Session outdated';
        this.message = 'Original request is updated.';
    }
}

export class IdentificationRequesterUnmatchedError implements Error {
    public name: string;
    public message: string;
    constructor() {
        this.name = 'Requester unmatched.';
        this.message = 'Requester unmatched.';
    }
}

// このオブジェクトを作るのは難しい。リポジトリにアクセスして使って作らないといけないのでFactoryが必要
export class IdentificationSession {
    private originalRequest: Model.IdentificationRequest;         // uid -> Request
    private snapshot: Model.IdentificationRequestSnapshot;
    private acceptedBy: Model.User;
    private token: string;
    private receivedToken: string;

    // このセッションの有効性チェック
    validateSession(): boolean {
        // RULE: スナップショットとリクエストが同一であること
        return this.originalRequest.isIdentical( this.snapshot );
    }

    // 新しいリクエストを受け入れるときの有効性チェック
    validateNewRequest(): boolean {
        // RULE: 更新時の新しいリクエストの条件 = 同一ユーザかつ更新されている
        let res = ( this.originalRequest.isIdentical( this.snapshot ) )
               && ( this.originalRequest.isUpdated( this.snapshot ) );      
        return res;
    }
    
    // 暫定: 乱数で6桁
    private generateToken(): string {
        let rnd: number;
        let tmp: string;
        let newToken: string;

        rnd = Math.floor( 100000 * Math.random() );
        tmp = '000000' + rnd.toString();
        newToken = tmp.slice( 6 - tmp.length );
        
        return newToken;
    }

    // セッションの更新(新しいリクエストを受け入れる)
    // 不変条件: トークンを新しくする
    updateSession() {
        if( !this.validateNewRequest() ){
            throw new IdentificationRequesterUnmatchedError;
        }
        this.updateToken();
        this.snapshot = this.originalRequest.takeSnapshot();
    }

    // 合言葉の更新
    // 不変条件: 更新と同時に受け取った合言葉も消す
    updateToken(): void {
        if( !this.validateSession() ){
            throw new IdentificationSessionOutdatedError;
        }
        // 新しい合言葉は絶対に一致しない
        this.receivedToken = '******';
        this.token = this.generateToken();
    }

    // 受け取った合言葉の入力
    receiveToken( receivedToken: string ) {
        if( !this.validateSession() ){
            throw new IdentificationSessionOutdatedError;
        }
        this.receivedToken = receivedToken;
    }

    // 合言葉の判定
    isTokenMatched(): boolean {
        return this.token === this.receivedToken;
    }
    
    getToken(): string {
        // 確認者には見せないようにする(アプリケーション層の仕事)
        return this.token;
    }
    
    // 本人確認実施
    identify(): Model.UserIdentity {
        if( !this.validateSession() ){
            throw new IdentificationSessionOutdatedError;
        }
        return new Model.UserIdentity(
                this.originalRequest.user,
                this.originalRequest.character,
                this.acceptedBy,
                null );
    }
}


