// rxjs
import { Observable, Subscriber, Subscription } from 'rxjs';
import 'rxjs/add/operator/mergeAll';

// firebase
import { AngularFire , FirebaseObjectObservable, FirebaseListObservable, AngularFireAuth, FirebaseRef } from 'angularfire2';
import * as firebase from 'firebase';       // required for timestamp

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
 * ################################################################################################################# */

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
*/

// POCOにしないといけなさそう??
export abstract class AbstractMapper<MODEL> {
    constructor( private af: AngularFire, private readonly root: string ) {}
    private url( model: MODEL ) {
        return this.root + '/' + this.id( model );
    }
    protected abstract id( model: MODEL ): string;
    protected abstract store( model: MODEL ): any;
    protected abstract retrieve( dbdata: any ): Observable<MODEL>;
    
    get( id: string ): Observable<MODEL> {
        let source = this.af.database.object( this.root + '/' + id ) as Observable<any>;
        // 取得したデータ(dbdata)を使って、次のObservableを作る。
        return source.flatMap( dbdata => this.retrieve( dbdata ) );
    }
    
    // 強制的に追加する
    set( model: MODEL ): Promise<void> {
        let source = this.af.database.object( this.url( model ) );
        return source.set( this.store( model ) ) as Promise<void>;
    }

    update( model: MODEL ): Promise<void> {
        let source = this.af.database.object( this.url( model ) );
        return source.update( this.store( model ) ) as Promise<void>;
    }
}


//格納対象となるクラス
export class ChildClass {
    constructor( public readonly id: string, public readonly name: string ){}
}


export class ParentClass {
    // 内部のオブジェクトの参照を渡すことは可能だが、一時的に使わせるのみにする
    constructor( public readonly id: string, public readonly name: string, public childA: ChildClass, public childB: ChildClass ){}
}

export class ChildDb extends AbstractMapper<ChildClass> {
    constructor( af: AngularFire, root: string ) {
        super( af, root );
    }
    
    id( model: ChildClass ): string {
        return model.id;
    }
    
    store( model: ChildClass ): any {
        return { n: model.name };
    }
    
    retrieve( dbmodel: any ): Observable<ChildClass> {
        // 単純な値の場合、一つの値を返すobservableを作ればよい
        return Observable.of( new ChildClass( dbmodel.$key, dbmodel.n ) );
    }
}

export class ParentDb extends AbstractMapper<ParentClass> {
    constructor( af: AngularFire, root: string, private childDb: ChildDb ) {
        super( af, root );
    }
    id( model: ParentClass ): string {
        return model.id;
    }
    
    store( model: ParentClass ): any {
        return { n: model.name, eid: model.childA.id, fid: model.childB.id };
    }
    
    retrieve( dbmodel: any ): Observable<ParentClass> {
        return Observable.create( subscriber => {
            let cnt =2;
            let tmp: { [key:string]: any } = {};
            let finished: { [key:string]: boolean } = {};
            let childA = this.childDb.get( dbmodel.eid ).map( child => {
                if( !finished['A'] ) {
                    finished['A'] = true; 
                    cnt = cnt-1;
                }
                tmp['A'] = child;
                console.log( cnt );
                return tmp;
            } );
            let childB = this.childDb.get( dbmodel.fid ).map( child => {
                if( !finished['B'] ) {
                    finished['B'] = true; 
                    cnt = cnt-1;
                }
                tmp['B'] = child;
                console.log( cnt );
                return tmp;
            } );
            return Observable.merge( childA, childB ).filter( (child) => ( cnt === 0 ) ).map( obj => {
                return new ParentClass( '0','0', obj['A'], obj['B']);
            } ).subscribe( result => {
                subscriber.next( result );
            });
        } );
    }
}



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
        let observers: Observable<any>[] = [];             // 子オブザーバ

        // console.log( dbdata ); OK
        // 全ての子要素
        for( let key in this.children ){
            finishedChildren[ key ] = false;
            remainingChildren = remainingChildren + 1;
            
            // 子要素を作成
            // ダブらないようにするのもあり
            observers.push( this.children[ key ].get( dbdata[ key ] ).map( child => {
                if( !finishedChildren[ key ] ) {
                    finishedChildren[ key ] = true; 
                    remainingChildren = remainingChildren　-　1;
                }
                retrievedChildren[ key ] = child;                
                return retrievedChildren;
            } ) );
        }

        // memo: mergeAllはObservableの結合をする。
        return Observable.from( observers ).mergeAll().map( ( unknown )=> {
            // console.log( retrievedChildren );   null
            return retrievedChildren;
        } );
    }
}



export class ParentDb2 extends AbstractCompositeMapper<ParentClass> {
    constructor( af: AngularFire, root: string, private childDb: ChildDb ) {
        super( af, root );
        this.has( 'eid', childDb );
        this.has( 'fid', childDb );
    }
    id( model: ParentClass ): string {
        return model.id;
    }
    
    store( model: ParentClass ): any {
        return { n: model.name, eid: model.childA.id, fid: model.childB.id };
    }
    
    retrieve( dbmodel: any ): Observable<ParentClass> {
        return this.createChildObserver( dbmodel ).map( children => {
            // console.log( children );   null
            return new ParentClass( '0','0', children['eid'], children['fid']);            
        } );
    }
}














