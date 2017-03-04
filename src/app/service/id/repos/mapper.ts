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

export abstract class AbstractMapper<MODEL> {
    constructor( private af: AngularFire, private readonly root: string ) {}
    private url( model: MODEL ) {
        return this.root + '/' + this.id( model );
    }
    protected abstract id( model: MODEL ): string;
    protected abstract _decomposeNewModel( model: MODEL ): any;
    protected abstract _decomposeUpdatedModel( model: MODEL ): any;
    protected abstract _composeModel( retrievedData: any ): Observable<MODEL>;
 
    get( id: string ): Observable<MODEL> {
        let source = this.af.database.object( this.root + '/' + id ) as Observable<any>;
        let obs = source.flatMap( dbdata => this._composeModel( dbdata ) );
        // 取得したデータ(dbdata)を使って、次のObservableを作る。
         return obs;
    }
 
 // 強制的に追加する
    set( model: MODEL ): Promise<void> {
        let source = this.af.database.object( this.url( model ) );
        return source.set( this._decomposeNewModel( model ) ) as Promise<void>;
    }

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
        let remainingChildren: number = 0;                          // 残りの子要素数
        let finishedChildren: { [ key: string ]: boolean } = {};    // 取得が完了した要素
        let retrievedChildren: { [ key: string ]: any } = {};       // 取得した要素
        let observers: { [ key: string ]: any }[] = [];             // 子オブザーバ
        
        // 全ての子要素
        for( let key in this.children ){
            finishedChildren[ key ] = false;
            remainingChildren = remainingChildren + 1;
            
            // 子要素を作成
            observers.push( this.children[ key ].get( dbdata[ key ] ).map( child => {
                if( !finishedChildren[ key ] ) {
                    finishedChildren[ key ] = true; 
                    remainingChildren = remainingChildren　-　1;
                }
                retrievedChildren[ key ] = child;
                return retrievedChildren;
            } ) );
        }
        
        return Observable.merge( observers ).filter(　()　=> ( remainingChildren === 0 ) )
                 .map(　()=> retrievedChildren );
    }
}
/* ####################################################################################################################
 * 並列オブザーバ
 * 複数のオブザーバをまとめたもの
 * combineLatestのようなものになる
 * ################################################################################################################# */

/*
class ParallelObserver<T> extends Observable<T> {
    remainingChildren: number = 0;                          // 残りの子要素数
    finishedChildren: { [ key: string ]: boolean } = {};    // 取得が完了した要素
    retrievedChildren: { [ key: string ]: any } = {};       // 取得した要素
    observers: { [ key: string ]: any }[] = [];             // 子オブザーバ

    constructor(){
        
    }
    return Observable.create( subscriber => {
        // オブザーバ内で使用する変数:　副作用を意図的に使っている
        let remainingChildren: number = 0;                          // 残りの子要素数
        let finishedChildren: { [ key: string ]: boolean } = {};    // 取得が完了した要素
        let retrievedChildren: { [ key: string ]: any } = {};       // 取得した要素
        
        // 全ての子要素
        for( let key in this.children ){
            finishedChildren[ key ] = false;
            remainingChildren = remainingChildren + 1;
            
            // creating child observer
            observers.push( this.subMappers[ key ].get( dbdata[ key ] ).map( child => {
                if( !finishedChildren[ key ] ) {
                    finishedChildren[ key ] = true; 
                    remainingChildren = remainingChildren　-　1;
                }
                retrievedChildren[ key ] = child;
                return retrievedChildren;
            } ) );
        }
        
        return Observable.merge( observers )
　　　　　　　　　　　　　　　　　.filter(　child　=> ( remainingChildren === 0 ) )
             .map( obj => {
                 return new ParentClass( '0','0', obj['A'], obj['B']);
         } ).subscribe( result => {
             subscriber.next( result );
         });
    } );
    
}

export abstract class ｋｋ<MODEL> {
    subMappers: { [ key: string ]: AbstractMapper<any> } = {};
    constructor( private af: AngularFire, private readonly root: string ) {}
    private url( model: MODEL ) {
        return this.root + '/' + this.id( model );
    }
    protected abstract id( model: MODEL ): string;
    protected abstract _decomposeNewModel( model: MODEL ): any;
    protected abstract _decomposeUpdatedModel( model: MODEL ): any;
    protected abstract _composeModel( retrievedData: any ): Observable<MODEL>;
    
    get( id: string ): Observable<MODEL> {
        let source = this.af.database.object( this.root + '/' + id ) as Observable<any>;
        let obs = source.flatMap( dbdata => this._composeModel( dbdata ) );
        // 取得したデータ(dbdata)を使って、次のObservableを作る。
        if( this.subMappers ) {
            return obs;
        } else {
            return obs;
        }
    }
    
    // 強制的に追加する
    add( model: MODEL ): Promise<void> {
        let source = this.af.database.object( this.url( model ) );
        return source.set( this._decomposeNewModel( model ) ) as Promise<void>;
    }

    update( model: MODEL ): Promise<void> {
        let source = this.af.database.object( this.url( model ) );
        return source.update( this._decomposeUpdatedModel( model ) ) as Promise<void>;
    }

    // composeの過程で、更に子要素にアクセスが必要な場合に追加する
    has( mapper: AbstractMapper<any>, name: string ) {
        // 重複した場合は前のが消される
        this.subMappers[ name ] = mapper;
    }
    
    createChildObservers( dbdata: any ){
        return Observable.create( subscriber => {
            // オブザーバ内で使用する変数:　副作用を意図的に使っている
            let remainingChildren: number = 0;                          // 残りの子要素数
            let finishedChildren: { [ key: string ]: boolean } = {};    // 取得が完了した要素
            let retrievedChildren: { [ key: string ]: any } = {};       // 取得した要素
            let observers: { [ key: string ]: any }[] = [];             // 子オブザーバ
            
            // 全ての子要素
            for( let key in this.subMappers ){
                finishedChildren[ key ] = false;
                remainingChildren = remainingChildren + 1;
                
                // creating child observer
                observers.push( this.subMappers[ key ].get( dbdata[ key ] ).map( child => {
                    if( !finishedChildren[ key ] ) {
                        finishedChildren[ key ] = true; 
                        remainingChildren = remainingChildren　-　1;
                    }
                    retrievedChildren[ key ] = child;
                    return retrievedChildren;
                } ) );
            }
            
            return Observable.merge( observers )
　　　　　　　　　　　　　　　　　　　　　.filter(　child　=> ( remainingChildren === 0 ) )
                 .map( obj => {
                     return new ParentClass( '0','0', obj['A'], obj['B']);
             } ).subscribe( result => {
                 subscriber.next( result );
             });
        } );
    }
}
*/