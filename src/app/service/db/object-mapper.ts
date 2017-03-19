// firebase
import { AngularFire　} from 'angularfire2';
import * as firebase from 'firebase';
import { Observable, Subscriber } from 'rxjs';
import { DB } from './index';

/* ####################################################################################################################
 * オブジェクトをDBに格納する・DBから復元する
 * 格納対象をキーと本体に分解
 * ################################################################################################################# */
export class ObjectMapper {
    urlParts: string[] = [];
    urlIndex: { [key:string]: number } = {};
    constructor( private af: AngularFire, url: string ) {
        // $から始まる場合はパラメータとして扱う。
        this.urlParts = url.split( '/' );
        this.urlParts.forEach( ( part, index ) => {
            if( part[0] === '$' ) {
                let body = part.substring( 1, part.length );
                this.urlIndex[ body ] = index;
            }
        } );
    }
    // --------------------------------------------------------------------------------------------
    // オブジェクトを元にパスを作成する
    // --------------------------------------------------------------------------------------------
    private toPath( object: any ): string[] {
        let parts: string[] = [].concat( this.urlParts );

        // console.log( parts );
    
        // パラメータを置き換える。不足している場合はFirebaseがエラーを返す(不正なURLと認識)
        if( object ) {
            for( let key in this.urlIndex ) {
                if( object[ key ] ) {
                    parts[ this.urlIndex[ key ] ] = object[ key ];
                }
            }
        }
        return parts;
    }
    // --------------------------------------------------------------------------------------------
    // オブジェクトを元にDBに格納するオブジェクトを作成する
    // --------------------------------------------------------------------------------------------
    private toDbObject( object: any ): any {
        let newObject = Object.assign( Object.create( object ), object );
        
        for( let key in this.urlIndex ) {
            delete newObject[ key ];
        }
        
        return newObject;
    }

    // --------------------------------------------------------------------------------------------
    // オブジェクトを取得する
    // complete を発行しないので、利用者が止めること。
    // --------------------------------------------------------------------------------------------
    get( keys: any = {} ): Observable<DB.DbData> {
        return Observable.create( ( subscriber: Subscriber<DB.DbData>　) => {
            let parts = this.toPath( keys );
            let observable = this.af.database.object( parts.join( '/' ) );
            let subscription = observable.subscribe( data => {
                subscriber.next( new DB.DbData( keys, data ) );
            },
            (err) => {},
            () => {} );
            return subscription;
        } );
    }

    // --------------------------------------------------------------------------------------------
    // オブジェクトを取得する(同階層すべて)
    // --------------------------------------------------------------------------------------------

    getAll( keys: any = {} ): Observable<DB.DbData> {
        return Observable.create( ( subscriber: Subscriber<DB.DbData> ) => {
            let parts = this.toPath( keys );
            parts.pop();
            let observable = this.af.database.list( parts.join( '/' ) ) as Observable<any[]>;
            let subscription = observable.subscribe( data => {
                subscriber.next( data );
            },
            (err) => {},
            () => {} );
        
        return subscription;
        } );
    }
    
    // --------------------------------------------------------------------------------------------
    // オブジェクトを格納する
    // --------------------------------------------------------------------------------------------
    set( object: any ): Promise<void> {
        let keys = this.toPath( object );
        let dbObject = this.toDbObject( object );

        console.log( dbObject );
        let ref = this.af.database.object( keys.join( '/' ) );
        return new Promise( ( resolve ) => {
            ref.set( dbObject ).then( ()=>{ resolve(); } );
        } );
    }

    // --------------------------------------------------------------------------------------------
    // オブジェクトを更新する
    // --------------------------------------------------------------------------------------------
    update( object: any ): Promise<void> {
        let keys = this.toPath( object );
        let dbObject = this.toDbObject( object );

        let ref = this.af.database.object( keys.join( '/' ) );
        return new Promise( ( resolve ) => {
            ref.update( dbObject ).then( ()=>{ resolve(); } );
        } );
    }
    
    // --------------------------------------------------------------------------------------------
    // オブジェクトを追加(IDは自動付与)する
    // --------------------------------------------------------------------------------------------
    push( object: any ): Promise<any> {
        let keys = this.toPath( object );
        let dbObject = this.toDbObject( object );
        keys.pop();

        let ref = this.af.database.list( keys.join( '/' ) );
        return new Promise( ( resolve ) => {
            ref.push( dbObject ).then( ( result )=>{ resolve( result ); } );
        } );
    }

    // --------------------------------------------------------------------------------------------
    // オブジェクトを削除する
    // --------------------------------------------------------------------------------------------
    remove( keys: any = {} ): Promise<void> {
        let parts = this.toPath( keys );
        return new Promise( (resolve) => {
            this.af.database.object( parts.join( '/' ) ).remove().then( ()=>{
                resolve();
            } );
        } );
    }
    
    // --------------------------------------------------------------------------------------------
    // オブジェクトを削除する(URLの末端(通常はID)の階層を)
    // TODO: さらに上の階層で削除がいる場合は想定していなかったが、必要なら作ること。
    // --------------------------------------------------------------------------------------------
    removeAll( keys: any = {} ): Promise<void> {
        let parts = this.toPath( keys );
        parts.pop();
        
        return new Promise( (resolve) => {
            this.af.database.object( parts.join( '/' ) ).remove().then( ()=>{
                resolve();
            } );
        } );
    }
}
