// rxjs
import { Observable, Subscriber, Subscription } from 'rxjs';

// firebase
import { AngularFire , FirebaseObjectObservable, FirebaseListObservable, AngularFireAuth, FirebaseRef } from 'angularfire2';
import * as firebase from 'firebase';       // required for timestamp

/* ####################################################################################################################
 * Firebaseのキャッシュ
 * 起動直後の読み込みは遅い(接続時間があるためか?): 1.0-1.5s位かかる
 * 起動後のあるデータの初回読み込み: 0.2-0.5s位かかる
 * 同じ個所の読み込み: 1msかからない
 * ################################################################################################################# */



/* ####################################################################################################################
 * 抽象Mapper
 * Firebaseへの格納・取り出しを行う。
 * 継承して、MODEL(ローカルのオブジェクト)とデータベースに格納するオブジェクトを対応付ける。
 * ################################################################################################################# */
export abstract class AbstractMapper<MODEL> {
    constructor( private af: AngularFire, private readonly root: string ) {}
    private url( model: MODEL ) {
        return this.root + '/' + this.id( model );
    }
    
    // URLに使用する、IDに該当する値を取得する
    protected abstract id( model: MODEL ): string;

    // 
    protected abstract _decomposeNewModel( model: MODEL ): any;
    protected abstract _decomposeUpdatedModel( model: MODEL ): any;
    protected abstract _composeModel( retrievedData: any ): Observable<MODEL>;
 
    // IDを指定して、該当するオブジェクトを取得する
    get( id: string ): Observable<MODEL> {
        let source = this.af.database.object( this.root + '/' + id ) as Observable<any>;
        let obs = source.flatMap( dbdata => this._composeModel( dbdata ) );
        // 取得したデータ(dbdata)を使って、次のObservableを作る。
         return obs;
    }
    
    // Firebaseの性質上、配列はすべて作り直しなのでこの構成にしている
    getAll(){
        let source = this.af.database.list( this.root ) as Observable<any>;
        let obs = source.flatMap( dbdatum => {
            // Firebaseから取得した配列の要素数分のObservableを用意し、Observableの配列に格納
            let observables = new Array<Observable<any>>( dbdatum.length );
            for( let i = 0; i < dbdatum.length; i++ ) {
                observables[i] = this._composeModel( dbdatum[i] );
            }
            
            // from, mergeAll: Observableの配列を並列処理
            // take: 全てのデータが揃うまでは後段に渡さない
            // toArray: 結果を配列に変換
            return Observable.from( observables ).mergeAll().take( dbdatum.length ).toArray();
        } );
        return obs;
    }
 
    // 強制的に追加する
    set( model: MODEL ): Promise<void> {
        let source = this.af.database.object( this.url( model ) );
        return source.set( this._decomposeNewModel( model ) ) as Promise<void>;
    }

    // 一部だけ直す
    update( model: MODEL ): Promise<void> {
        let source = this.af.database.object( this.url( model ) );
        return source.update( this._decomposeUpdatedModel( model ) ) as Promise<void>;
    }
}
/* ####################################################################################################################
 * 外部キーに対応するためのマッパー
 * あらかじめhas(**)で指定したメンバに格納した値は外部キーとして扱われる
 * compositeMapper.has( entity,'serverKey' );
 * -> composeModel( dbmodel ){
 *      getChildrenObserver( dbmodel ).map(  )
 * }
 * クラスを継承して使うか、外部から情報を与えて作る? 
 * どちらが良いか?
 * どちらの使いかt内も対応できるようにする。
 * 面倒なのは子オブザーバの作成...keyの設定とか
 * ################################################################################################################# */

export abstract class AbstractCompositeMapper<MODEL> extends AbstractMapper<MODEL> {
    children: { [key:string]: AbstractMapper<any> } = {};
    constructor( af: AngularFire, root: string ) {
        super( af, root );
    }
    
    has( key: string, mapper: AbstractMapper<any> ) {
        // key: 外部キーに相当
        this.children[ key ] = mapper;
    }
    
    // DBから取得したデータをもとに、オブザーバを作る
    // 既にあったらダブらないようにする
    createChildObserver( dbdata: any ){
        // オブザーバ内で使用する変数:　副作用を意図的に使っている
        let unfinishedChildrenCount: number = 0;                    // 残りの子要素数
        let finishedChildren: { [ key: string ]: boolean } = {};    // 取得が完了した要素
        let latestChildren: { [ key: string ]: any } = {};          // 最新の子要素
        let observables: Observable<any>[] = [];                    // 子要素のオブザーバ

        // 全ての子要素用のオブザーバを作成し、配列にまとめる
        for( let key in this.children ){
            finishedChildren[ key ] = false;
            unfinishedChildrenCount++;
            
            observables.push( this.children[ key ].get( dbdata[ key ] ).map( child => {     
                return { key: key, value: child };
            } ) );
        }

        // 全ての子要素の Observableを並列で実行
        return Observable.from( observables ).mergeAll()
            .map( ( keyValue )=> {
                // observableをまとめた後で副作用のある操作を実施

                if( !finishedChildren[ keyValue.key ] ) {
                    finishedChildren[ keyValue.key ] = true; 
                    unfinishedChildrenCount--;
                }
                // 最新の値を保持
                latestChildren[ keyValue.key ] = keyValue.value;
                return latestChildren;
            } )
            .filter( () => unfinishedChildrenCount == 0 );  // 未取得の子要素があれば待機する
    }
}