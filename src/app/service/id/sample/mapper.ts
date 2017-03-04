// rxjs
import { Observable, Subscriber, Subscription } from 'rxjs';
import 'rxjs/add/operator/mergeAll';

// firebase
import { AngularFire , FirebaseObjectObservable, FirebaseListObservable, AngularFireAuth, FirebaseRef } from 'angularfire2';
import * as firebase from 'firebase';       // required for timestamp


import { AbstractJoinMapper, AbstractMapper, Timestamp } from '../repos';

/* ####################################################################################################################
 * Firebaseのキャッシュ
 * 起動直後の読み込みは遅い(接続時間があるためか?): 1.0-1.5s位かかる
 * 起動後のあるデータの初回読み込み: 0.2-0.5s位かかる
 * 同じ個所の読み込み: 1msかからない
 * 
 * Subscribeをし続けるとどんどんメモリリークする。
 * どこかで明示的に消すこと。
 * 特に、オブザーバ内部で生成したSubscriptionは自動で消えない。
 * https://medium.com/@benlesh/rxjs-dont-unsubscribe-6753ed4fda87#.cntkmojgt
 * TakeUntilを使うと良い。http://reactivex.io/rxjs/class/es6/Subscription.js~Subscription.html
    get( id: string ): Observable<MODEL> {
        return Observable.create( ( subscriber: Subscriber<MODEL> ) => {
            let source = this.af.database.object( this.root + '/' + id );
            let subscription= source.subscribe( dbdata => {
            // validation required source.subscribe( dbdata => {
                try {
                    if( dbdata.$exists() ){
                        // ものによって変わる
                        console.log('child sub');
                        this.retrieve( dbdata ).subscribe( retrieved => {
                        subscriber.next( retrieved );
                        });
                    } else {
                        // throws an error
                    }
                } catch( err ) {
                    subscriber.error( err );
                }
            },
            err => subscriber.error( err ),
            () => {});
            return subscription;
        } );
    }
        let obs = source.flatMap( dbdatas => {                                 // Firebaseから配列が繰るごとに以下のObservableを返す
            return Observable.from( dbdatas )                                  // 配列のデータをそれぞれに対して処理すrObservableを作る
                            .flatMap( dbdata => this.retrieve( dbdata ) )      // 要素ごとに、サーバ上のデータをあMODELに変換
                            .map( model => [ model ] )                         // MODELを1要素だけ含む配列に変換
                            .scan( ( acc, val ) => acc.concat( val ) )         // MODELの配列を1つずつつなぐ
                            //.last();                                           // 結合完了後のみ後続の処理へ渡す
 * ################################################################################################################# 

// 対象をFirebaseに保存・取得するためのクラス
// 対象はオブジェクト単体
// オブジェクト配列
//　外部キーを持つかどうかなどなどいろいろある
// オブジェクト単体は比較的簡単。IDを持つかどうかは問題だけど
// リストはクエリーを持つのでちょっと面倒。
// URL
// root/xxxx/sm/
// シンプルなシリアライザはObservableで作れてしまう
/*
protected abstract summaryUrl(): string;
protected abstract summerize( model: MODEL ): HEADER; // 要約を作る
様利付は継承クラス


// POCOにしないといけなさそう??
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




class Accumulator {
    private finished: number = 0;
    private _accumulatedValues: { [key:string]: any } = {};
    private elementCount: number = 0;
    constructor( public key: string = "", public value: any = null ){}

    resetCount( elementCount: number ): Accumulator {
        this.finished = 0;
        this.elementCount = elementCount;
        return this;
    }
    
    accumulate( item: Accumulator ): Accumulator {
        if( !this._accumulatedValues[ item.key ] ) {
            this.finished++;
        }
        this._accumulatedValues[ item.key ] = item.value;
        return this;
    }
    
    get accumulatedValues(): { [key:string]: any } {
        return this._accumulatedValues;
    }
    
    isFinished(): boolean {
        return ( this.finished == this.elementCount );
    }
}

export abstract class AbstractCompositeMapper<MODEL> extends AbstractMapper<MODEL> {
    children: { key: string, mapper: AbstractMapper<any> }[] = [];
    constructor( af: AngularFire, root: string ) {
        super( af, root );
    }
    
    has( key: string, mapper: AbstractMapper<any> ) {
        // key: 外部キーに相当
        this.children.push( { key: key, mapper: mapper } );
    }
    
    // DBから取得したデータをもとに、オブザーバを作る
    // 既にあったらダブらないようにする
    createChildObserver( dbdata: any ){
        // 全ての子要素用のオブザーバを作成し、配列にまとめる
        let observables = new Array<Observable<Accumulator>>( this.children.length);
        for( let i = 0; i < observables.length; i++ ) {
            observables[i] = this.children[i].mapper
                .get( dbdata[ this.children[i].key ] )
                .map( child =>  new Accumulator( this.children[i].key, child ) );
        }
        
        // 積算のための最初の要素を生成するobservable
        let firstObservable = Observable.of( new Accumulator().resetCount( observables.length ) );
        
        // 積算のための最初の要素を生成後、全ての子要素の Observableを並列で実行
        // 並列で実行しているObservableから子要素が出てくるたびに積算していく
        // 全ての子要素が揃う( observables.length と acc.finished が一致) したら、後段に渡す
        return firstObservable.concat( Observable.from( observables ).mergeAll() )
                              .scan( ( acc, item ) => acc.accumulate( item ) )
                              .filter( acc => acc.isFinished() )
                              .map( acc => acc.accumulatedValues );
    }
}
*/

export class ChildClass {
    constructor( public readonly id: string,
                 public readonly name: string,
                 public readonly createdAt?: string ){}
}

export class ParentClass {
    constructor( public readonly id: string,
                 public readonly name: string,
                 public childA: ChildClass,
                 public childB: ChildClass,
                 public childC: ChildClass ){}
}

export class InfoClass {
    constructor( public readonly id: string, public info: string ){}
}

export class ChildDb extends AbstractMapper<ChildClass> {
    constructor( af: AngularFire, root: string ) {
        super( af, root );
    }
    
    id( model: ChildClass ): string {
        return model.id;
    }

    _decomposeNewModel( model: ChildClass ): any {
        return { n: model.name, t: Timestamp };
    }
    
    _decomposeUpdatedModel( model: ChildClass ): any {
        return { n: model.name };
    }
    
    _composeModel( dbmodel: any ): Observable<ChildClass> {
        return Observable.of( new ChildClass( dbmodel.$key, dbmodel.n, dbmodel.t ) );
    }
}


export class ParentDb extends AbstractJoinMapper<ParentClass> {
    constructor( af: AngularFire, root: string, private childDb: ChildDb ) {
        super( af, root );
        this.has( 'eid', childDb );
        this.has( 'fid', childDb );
        this.has( 'gid', childDb );
    }
    id( model: ParentClass ): string {
        return model.id;
    }

    _decomposeNewModel( model: ParentClass ): any {
        return { n: model.name, eid: model.childA.id, fid: model.childB.id, gid: model.childB.id };
    }
    _decomposeUpdatedModel( model: ParentClass ): any {
        return { n: model.name, eid: model.childA.id, fid: model.childB.id, gid: model.childB.id };
    }
    
    _composeModel( dbmodel: any ): Observable<ParentClass> {
        return this.getChildren( dbmodel ).map( children => {
            return new ParentClass( dbmodel.$key, dbmodel.n, children['eid'], children['fid'], children['gid']);            
        } );
    }
}
export class Sample {
    childDb: ChildDb;
    parentDb: ParentDb;

    constructor( private af: AngularFire ) {
        this.childDb = new ChildDb( af, '/test/mapper' );
        this.parentDb = new ParentDb( af, '/test/multi', this.childDb );
    }
    
    createChild( name: string ) {
        this.childDb.set( new ChildClass( null, 'hello' ) );
    }
    
    test1() {
        console.time('xyz');
        let subscription = this.childDb.get( 'abc' ).subscribe( result => {
            console.timeEnd('xyz');
            console.log( result );
        });
    }
    test2(){
        console.time('aaaaa');
        let subscription = this.parentDb.get('aaaaa').subscribe( result => {
            console.timeEnd('aaaaa');
            console.log( result );
        });
    }
    test3(){
        console.time('aaaaa');
        let subscription = this.parentDb.getAll().subscribe( result => {
            console.timeEnd('aaaaa');
            console.log( result );
        });
    }
}













