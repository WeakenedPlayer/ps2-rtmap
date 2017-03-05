// rxjs
import { Observable } from 'rxjs';

// firebase
import { AngularFire , FirebaseObjectObservable, FirebaseListObservable, AngularFireAuth, FirebaseRef } from 'angularfire2';
import * as firebase from 'firebase';

import * as Mapper from './index';

/* ####################################################################################################################
 * 抽象Mapper
 * Firebaseへの格納・取り出しを行う。
 * 継承して、MODEL(ローカルのオブジェクト)とデータベースに格納するオブジェクトを対応付ける。
 * 実装する必要があるメソッド
 * [1] getId: MODELのIDを取り出す
 * [2] getUlr: MODELのURLを指定する
 * [3] decomposeNewModel: MODELをFirebaseに登録する形に変換する(新規登録用)
 * [4] decomposeNewModel: MODELをFirebaseに登録する形に変換する(更新用)
 * [5] composeModel: Firebaseから取り出したデータをMODELに変換する
 * ################################################################################################################# */
export abstract class AbstractMapper<MODEL> {
    constructor( private af: AngularFire ) {}
    protected abstract getBaseUrl(): string;
    protected abstract getId( model: MODEL ): string;                           // MODELから ID 情報を取得する(URLに使用するため)
    protected abstract decomposeNewModel( model: MODEL ): any;                  // データベースに格納する値を作る(新規作成時)
    protected abstract decomposeUpdatedModel( model: MODEL ): any;              // データベースに格納する値を作る(更新時)
    protected abstract composeModel( retrievedData: any ): Observable<MODEL>;   // MODELを復元する

    private getUrl( id: string ): string {
        return this.getBaseUrl() + '/' + id;
    }
    // IDを指定して、該当するオブジェクトを取得する
    get( id: string ): Observable<MODEL> {
        if( id ) {
            let source = this.af.database.object( this.getUrl( id ) ) as Observable<any>;
            return source.flatMap( dbdata => this.composeModel( dbdata ) );
        }
    }
    
    // 一括取得
    getAll(): Observable<MODEL[]>{
        // 備考: Firebaseのlistは、一要素の変更があっても全要素が更新される。
        // Firebaseから配列を一式もらうごとに、データベースに格納したデータをMODELに変形するObservableを後段に渡す
        let source = this.af.database.list( this.getBaseUrl() ) as Observable<any>;
        let obs = source.flatMap( dbdatum => {
            let observables = new Array<Observable<any>>( dbdatum.length );
            for( let i = 0; i < dbdatum.length; i++ ) {
                observables[i] = this.composeModel( dbdatum[i] );
            }

            return Observable.from( observables )           // Observable の配列の全要素
                             .mergeAll()                    //  +- を並列に実行
                             .take( dbdatum.length )        //  +- 配列の要素数だけ集まるまで待機する
                             .toArray();                    //  +- を配列にまとめて後段に渡す
        } );
        return obs;
    }
 
    // 追加する(既存の場合は強制的に書き換わる)
    set( model: MODEL ): Promise<void>{
        let id = this.getId( model );
        if( id ) {
            // IDがあれば実行
            let db = this.af.database.object( this.getUrl( id ) );
            return db.set( this.decomposeNewModel( model ) ) as Promise<void>;
        } else {
            throw new Mapper.NoIdError;
        }
    }
    
    // 変更のあったところだけ書き換える(同実装するかはお任せ)…場合によってはタイムスタンプを除外するのみ
    update( model: MODEL ): Promise<void> {
        let id = this.getId( model );
        if( id ) {
            // IDがあればそのまま使う
            let db = this.af.database.object( this.getUrl( id ) );
            return db.set( this.decomposeUpdatedModel( model ) ) as Promise<void>;
        } else {
            throw new Mapper.NoIdError;
        }
    }

    // IDは無視して追加する
    // ID追加後のモデルが必要となるので、Promiseで返す。
    push( model: MODEL ): Promise<string> {
        let db = this.af.database.list( this.getBaseUrl() );
        
        // FirebaseのThenableReferenceから、Key(新しく追加したオブジェクトのID)を返す
        return new Promise( (resolve,reject) => {
            db.push( this.decomposeNewModel( model ) ).then( result => {
                let key: string = result.key;
                resolve( key );
            } );
        } ); 
    }
    
    remove( id: string ): Promise<void> {
        if( id ) {
            return new Promise( ( resolve, reject ) => {
                let promise = this.af.database.object( this.getUrl( id ) ).remove();                
            } );
        } else {
            throw new Mapper.NoIdError;
        }
    }
}
/* ####################################################################################################################
 * 子要素が揃っているか確認するために使う「積算」クラス。外部には公開しない。
 * http://reactivex.io/documentation/operators/scan.html
 * ################################################################################################################# */
class Accumulator {
    private finishedCount: number = 0;
    private totalChildren: number = 0;
    private _accumulatedValues: { [key:string]: any } = {};
    constructor( public key: string = "", public value: any = null ){}

    // 子要素の数を設定するとともに、取得完了カウンタを0に戻す
    resetCount( elementCount: number ): Accumulator {
        this.finishedCount = 0;
        this.totalChildren = elementCount;
        return this;
    }
    
    // 子要素を積算する
    accumulate( item: Accumulator ): Accumulator {
        if( !this._accumulatedValues[ item.key ] ) {
            // 初めて取得した子要素があったら、取得完了カウンタを増やす
            this.finishedCount++;
        }
        this._accumulatedValues[ item.key ] = item.value;
        return this;
    }
    
    get accumulatedValues(): { [key:string]: any } {
        return this._accumulatedValues;
    }
    
    isFinished(): boolean {
        return ( this.finishedCount == this.totalChildren );
    }
}

/* ####################################################################################################################
 * JoinMapper
 * 外部キーと、対応する mapper を指定すると、Joinした結果を返すための mapper。
 * 配列を読み出すのは高コストになるので、極力オブジェクト単体に対して使うこと。
 * (Firebaseの仕組み上、Joinするより非正規化した方が良いので、ある程度低速なのは仕方ない)
 * 
 * 使い方:
 * このクラスを継承したクラスで以下を実行すること。
 * [1] has( key, mapper ) を実行し、外部キーとそれに対応する mapper を登録する。
 * [2] _composeModel 実装時、メソッド内で以下を実行する。 children には、[1]で登録した key に、mapperから取得した値が格納される。
 *     this.getChildren( firebaseから読みだしたデータ ).map( children => ... ) 
 * [3] _decomposeNewModel / _decomposeUpdatedModel 実装時、[1]で登録した key に外部キーを格納する。 
 * ################################################################################################################# */
export abstract class AbstractJoinMapper<MODEL> extends AbstractMapper<MODEL> {
    private children: { key: string, mapper: AbstractMapper<any> }[] = [];
    constructor( af: AngularFire ) {
        super( af );
    }
    
    protected has( key: string, mapper: AbstractMapper<any> ) {
        // key: 外部キーに相当
        this.children.push( { key: key, mapper: mapper } );
    }

    // DBから取得したデータをもとに、オブザーバを作る
    protected getChildren( dbdata: any ){
        // 全ての子要素用のオブザーバを作成し、配列にまとめる
        let observables = new Array<Observable<Accumulator>>( this.children.length);
        for( let i = 0; i < observables.length; i++ ) {
            observables[i] = this.children[i].mapper
                .get( dbdata[ this.children[i].key ] )
                .map( child =>  new Accumulator( this.children[i].key, child ) );
        }
        
        // 積算のための最初の要素を生成するobservable
        let firstObservable = Observable.of( new Accumulator().resetCount( observables.length ) );
        
        return firstObservable                                          // 積算用の最初の要素を生成するobservable
               .concat( Observable.from( observables ).mergeAll() )     //  +- が実行された後、子要素用のobservableを並列で実行する
               .scan( ( acc, item ) => acc.accumulate( item ) )         //  +- の結果を積算する
               .filter( acc => acc.isFinished() )                       //  +- すべての子要素が取得できるまでは後段にデータを渡さない
               .map( acc => acc.accumulatedValues );                    //  +- 後段に、積算した結果のみを渡す = 子要素の[key,value] が読み出せるようになる
    }
}