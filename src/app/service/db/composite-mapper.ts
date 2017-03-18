// firebase
import { DB } from './index';
import { AngularFire , FirebaseObjectObservable, FirebaseListObservable, AngularFireAuth, FirebaseRef } from 'angularfire2';
import * as firebase from 'firebase';
import { Observable, Subscription, Subscriber } from 'rxjs';

//単純に古いSubscriptionをUnsubscribeする
class DbSubscription {
    subscription: Subscription;
    constructor( 
            private mapper: DB.Mapper<any>,
            private dbData2Key: ( keys: any, values: any ) => any ) {
    }

    subscribe( dbData: DB.DbData, callback: (value:any)=>void ): void {
        if( this.subscription ) {
            this.unsubscribe();
        }
        this.subscription = this.mapper.get( this.dbData2Key( dbData.keys, dbData.values ) ).subscribe( (subDbData) => {
            callback( subDbData );
        } );
    }
    
    unsubscribe(): void {
        this.subscription.unsubscribe();
    }
}
/* ####################################################################################################################
 * 子要素を持つマッパ
 * ################################################################################################################# */
export abstract class CompositeMapper<T> implements DB.Mapper<T> {
    private numberOfChildren: number = 0;
    private dbSubscription: { [key: string]: DbSubscription } = {};
    private mapper: DB.ObjectMapper = null;

    constructor( af: AngularFire, url: string ) {
        this.mapper = new DB.ObjectMapper( af, url );
    }
    
    // --------------------------------------------------------------------------------------------
    // キーとDBから取得した値を用いて値を復元する
    // --------------------------------------------------------------------------------------------
    protected abstract db2obj( keys: any, values: any, children ): T;
    protected abstract obj2db( obj: T, isNew: boolean ): any;

    // --------------------------------------------------------------------------------------------
    // サブクラスで子要素を追加する
    // --------------------------------------------------------------------------------------------
    protected addChild( key: string, mapper: DB.Mapper<any>, dbData2Key: ( keys: any, values: any ) => any ): void { 
        this.dbSubscription[ key ] = new DbSubscription( mapper, dbData2Key );
        this.numberOfChildren++;
    }

    // --------------------------------------------------------------------------------------------
    // [C]RUD
    // オブジェクトを渡して、新しい値を作る(既存の場合は上書き)
    // --------------------------------------------------------------------------------------------
    set( obj: T ): Promise<void> {
        return this.mapper.set( this.obj2db( obj, true ) );
    }
    
    // --------------------------------------------------------------------------------------------
    // [C]RUD
    // 機能として実装するが、使ってよいかどうかはデータ構造にゆだねる
    // 自動で割り振られるキーがパスの「親ディレクトリ」になる場合、存在しない外部キーを持つことになる。
    // --------------------------------------------------------------------------------------------
    push( obj: T ): Promise<string> {
        return new Promise( ( resolve ) => {
            this.mapper.push( this.obj2db( obj, true ) ).then( obj => {
                resolve( obj.key );
            } );
        } );
    }
    
    // --------------------------------------------------------------------------------------------
    // 子要素とキーとDBから取得した値を用いて値を復元する
    // 複雑な機能を有したObservableを作成...
    //    副作用を利用して、Subscribeするごとに新しいObservableの実体を生成する。
    //    get するたびに新しい実体が作られるので、 let した変数はすべて独立する
    // --------------------------------------------------------------------------------------------
    get( keys?: any ): Observable<any> {
        // 各子要素ごとに管理する情報
        let subscription: { [key: string]: Subscription } = {};

        // 集計のための情報
        let isFinished: { [key: string]: boolean } = {};
        let results: { [key: string]: any } = {};
        let finishedCount = 0;
        let tmpDbData: DB.DbData; // 暫定
        
        // 後片付け
        let deposite: ()=>void = ()=>{
            for( let k in this.dbSubscription ) {
                this.dbSubscription[k].unsubscribe();
            }
        }

        return Observable.create( (subscriber: Subscriber<any>) => {
            // ------------------------------------------------------------------------------------
            // 全ての子要素を並列して監視するObservable
            // 変化があったら子要素のKeyと、その値を、{key,value}の形式で後段に伝える。
            // TODO: 重複が増える使い方に備え、Subscriptionの管理を見直す
            // ------------------------------------------------------------------------------------
            this.mapper.get( keys ).subscribe( dbData => {
                // 親要素の再読出しに伴う処置
                tmpDbData = dbData;
                finishedCount = 0;
                isFinished={};
                
                
                // 子要素のSubscriptionを作成する
                for( let k in this.dbSubscription ) {
                    this.dbSubscription[k].subscribe( dbData, (value) => { 
                        subscriber.next( { key: k, value: value } );
                    } );
                }
            },
            (err)=>{
                deposite();
            },
            ()=>{
                deposite();
            } );
            // ------------------------------------------------------------------------------------
        } ).map( kv => {
            // ------------------------------------------------------------------------------------
            // 集計するObservable
            // 「全ての子要素を並列して監視するObservable」から出てくる、子要素ごとの {key,value} を受け取り、子要素全体の取得状況を更新する
            // ------------------------------------------------------------------------------------
            // 子要素の集計
            if( finishedCount < this.numberOfChildren )
                if( !isFinished[ kv.key ] ) {
                isFinished[ kv.key ] = true;
                finishedCount++;
            }
            results[kv.key] = kv.value;
            return this.db2obj( tmpDbData.keys, tmpDbData.values, results) ;
        } ).filter( () => {
            // ------------------------------------------------------------------------------------
            // 全要素が最低1回取得できるまでは後段に伝えない
            // ------------------------------------------------------------------------------------
            return finishedCount === this.numberOfChildren; 
        } );
    }
    
    // --------------------------------------------------------------------------------------------
    // オブジェクトを渡して、DBの値を一部上書きする(タイムスタンプを上書きから除外したい場合を想定)
    // --------------------------------------------------------------------------------------------
    update( obj: T ): Promise<void> {
        return this.mapper.update( this.obj2db( obj, false ) );
    }

    // --------------------------------------------------------------------------------------------
    // キーを指定して、該当するオブジェクトを削除
    // --------------------------------------------------------------------------------------------
    remove( keys: any ): Promise<void> {
        return this.mapper.remove( keys );
    }
}
