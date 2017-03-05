// rxjs
import { Observable } from 'rxjs';

// firebase
import { AngularFire , FirebaseObjectObservable, FirebaseListObservable, AngularFireAuth, FirebaseRef } from 'angularfire2';
import * as firebase from 'firebase';

import * as Mapper from './index';

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
 * 
 * 簡単なRaw/Classは良いが、難しいものがある。
 * 外部キーのままでは意味のないデータの場合、復元が必要だが、すべての外部キーが必要とは限らない。
 * だから、ダミーのままにしておくのは一つの手だが…
 * ################################################################################################################# */
export abstract class AbstractJoinMapper<T> extends Mapper.AbstractClassMapper<T> {
    private children: { key: string, mapper: Mapper.AbstractClassMapper<any> }[] = [];
    constructor( af: AngularFire ) { super( af ); }
    
    // IDを指定して、該当するオブジェクトを取得する
    get( id: string ): Observable<T> {
        if( id ) {
            return this.getRaw( id ).flatMap( dbData => {
                return this.getChildren( dbData )
                           .map( children => this.composeModel( { raw: dbData, children: children } ) );
            });
        } else {
            throw new Mapper.NoIdError;
        }
    }
    
    protected has( key: string, mapper: Mapper.AbstractClassMapper<any> ) {
        this.children.push( { key: key, mapper: mapper } );
    }

    // DBから取得したデータをもとに、オブザーバを作る
    protected getChildren( dbdata: any ): Observable<any> {
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
