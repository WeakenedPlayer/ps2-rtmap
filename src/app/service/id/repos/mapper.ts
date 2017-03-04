// rxjs
import { Observable } from 'rxjs';

// firebase
import { AngularFire , FirebaseObjectObservable, FirebaseListObservable, AngularFireAuth, FirebaseRef } from 'angularfire2';
import * as firebase from 'firebase';

/* ####################################################################################################################
 * タイムスタンプ
 * この値をFirebaseに格納すると、自動でUniqueなタイムスタンプが作られる。
 * ################################################################################################################# */
export const Timestamp = firebase.database.ServerValue.TIMESTAMP;

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
    
    protected abstract id( model: MODEL ): string;                              // MODELから ID 情報を取得する(URLに使用するため)
    protected abstract _decomposeNewModel( model: MODEL ): any;                 // データベースに格納する値を作る(新規作成時)
    protected abstract _decomposeUpdatedModel( model: MODEL ): any;             // データベースに格納する値を作る(更新時)
    protected abstract _composeModel( retrievedData: any ): Observable<MODEL>;  // MODELに復元する
 
    // IDを指定して、該当するオブジェクトを取得する
    get( id: string ): Observable<MODEL> {
        let source = this.af.database.object( this.root + '/' + id ) as Observable<any>;
        return source.flatMap( dbdata => this._composeModel( dbdata ) );
    }
    
    getAll(): Observable<MODEL[]>{
        // 備考: Firebaseのlistは、一要素の変更があっても全要素が更新される。
        // Firebaseから配列を一式もらうごとに、データベースに格納したデータをMODELに変形するObservableを後段に渡す
        let source = this.af.database.list( this.root ) as Observable<any>;
        let obs = source.flatMap( dbdatum => {
            let observables = new Array<Observable<any>>( dbdatum.length );
            for( let i = 0; i < dbdatum.length; i++ ) {
                observables[i] = this._composeModel( dbdatum[i] );
            }

            return Observable.from( observables )           // Observable の配列の全要素
                             .mergeAll()                    // ↑ を並列に実行
                             .take( dbdatum.length )        // ↑ 配列の要素数だけ集まるまで待機する
                             .toArray();                    // ↑ を配列にまとめて後段に渡す
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
 * 子要素が揃っているか確認するために使う「積算」クラス。外部には公開しない。
 * http://reactivex.io/documentation/operators/scan.html
 * ################################################################################################################# */
class Accumulator {
    private finishedCount: number = 0;
    private elementCount: number = 0;
    private _accumulatedValues: { [key:string]: any } = {};
    constructor( public key: string = "", public value: any = null ){}

    // 子要素の数を設定するとともに、取得完了カウンタを0に戻す
    resetCount( elementCount: number ): Accumulator {
        this.finishedCount = 0;
        this.elementCount = elementCount;
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
        return ( this.finishedCount == this.elementCount );
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
    constructor( af: AngularFire, root: string ) {
        super( af, root );
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
        
        return firstObservable                                          // 積算用の最初の要素
               .concat( Observable.from( observables ).mergeAll() )     // ↑ が実行された後、子要素用のオブザーバを並列で実行する
               .scan( ( acc, item ) => acc.accumulate( item ) )         // ↑ の結果を積算する
               .filter( acc => acc.isFinished() )                       // ↑ すべての子要素が取得できるまでは後段にデータを渡さない
               .map( acc => acc.accumulatedValues );                    // ↑ 後段に、積算した結果のみを渡す = 子要素の[key,value] が読み出せるようになる
    }
}