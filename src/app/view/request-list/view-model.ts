import { Census, Identification, Comm, DB } from '../../service';
import { AngularFire, AngularFireAuth } from 'angularfire2';
import { Observable, Subscription } from 'rxjs';

/* ####################################################################################################################
 * 受付 出題する
 * 要求 ゲームを通して回答する
 * 連絡: 一致していたら登録確認、不一致ならリトライ確認
 * ################################################################################################################# */
const reqPerPage = 2;

export class ViewModel {
    // Censusで検索する情報
    requestList: Observable<Identification.Request[]>;
    profileMapObservable: Observable<{ [key:string]: Census.CharacterProfile }>;
    worldMapObservable: Observable<{ [key:string]: Census.World }>;

    // 保持する値
    profileMap: { [key:string]: Census.CharacterProfile } = {};
    worldMap: { [key:string]: Census.World } = {};
    uniqueCidMap: { [key:string]: boolean } = {};
    uniqueWids: { [key:string]: boolean } = {};

    visibleRequestsObservable: Observable<Identification.Request[]>;
    private uniqueProfileObseervable: Observable<Census.CharacterProfile[]>
    private uniqueCidObservable: Observable<string[]>;
    private widObservable: Observable<string[]>;
    
    constructor( private af: AngularFire,
                 private census: Census.Service,
                 private ids: Identification.Service,
                 private pageObservable: Observable<number> ){
        this.requestList = this.ids.reqRepos.getAll().publishReplay(1).refCount();

        /* --------------------------------------------------------------------------------------------
         * 現在のリクエスト一覧と、表示範囲内のCIDのObservable
         * ----------------------------------------------------------------------------------------- */
        this.visibleRequestsObservable = Observable.combineLatest( this.requestList, this.pageObservable, ( requests, p ) => {
            let page = (+p);            // 事故防止(勝手に文字列になる)
            let length: number = requests.length;
            let startIndex: number =　Math.min( length, page * reqPerPage );
            let endIndex: number = Math.min( ( length, page + 1 ) * reqPerPage );
            let visibleRequests = requests.slice( startIndex, endIndex );
            
            return visibleRequests;
        } ).publishReplay(1).refCount();
        
        /* --------------------------------------------------------------------------------------------
         * 新規に読み込むCID
         * ----------------------------------------------------------------------------------------- */
        this.uniqueCidObservable = this.visibleRequestsObservable.map( profiles => {
            let uniqueCids: string[] = [];

            for( let profile of profiles ) {
                let cid = profile.cid;
                if( !this.uniqueCidMap[ cid ] ) {
                    this.uniqueCidMap[ cid ] = true;
                    uniqueCids.push( cid );
                }
            }
            
            return uniqueCids;
        } ).publishReplay(1).refCount();

        /* --------------------------------------------------------------------------------------------
         * 新規に読み込むCIDに対応するProfile
         * ----------------------------------------------------------------------------------------- */
        this.uniqueProfileObseervable = this.uniqueCidObservable.flatMap( cids => {
            if( cids ) {
                return this.census.getCharacterProfiles( cids )
            } else {
                return Observable.never();
            }
        } ).publishReplay(1).refCount();

        /* --------------------------------------------------------------------------------------------
         * ProfileMapの更新用Observable
         * ----------------------------------------------------------------------------------------- */
        this.profileMapObservable = this.uniqueProfileObseervable.map( profiles => {
            if( profiles ) {
                for( let profile of profiles ) {
                    this.profileMap[ profile.character_id ] = profile;
                }
                console.log( this.profileMap );
                return this.profileMap;
            }
        } ).publishReplay(1).refCount();

        /* --------------------------------------------------------------------------------------------
         * 新規に読み出したProfileに対応するWorldIdのObservable
         * ----------------------------------------------------------------------------------------- */
        this.widObservable = this.uniqueProfileObseervable.map( profiles => {
            // CIDのうち、新規のものだけ抽出
            let wids: string[] = [];
            if( profiles ) {
                for( let profile of profiles ) {
                    let wid = profile.world.world_id;
                    if( !this.uniqueWids[ wid ] ) {
                        this.uniqueWids[ wid ] = true;
                        wids.push( wid );
                    }
                }
            }
            return wids;
        } ).publishReplay(1).refCount();

        /* --------------------------------------------------------------------------------------------
         * WorldMapの更新用Observable
         * ----------------------------------------------------------------------------------------- */
        this.worldMapObservable = this.widObservable.flatMap( wids => {
            if( wids ) {
                return this.census.getWorlds( wids ).map( worlds => {
                    if( worlds ) {
                        for( let world of worlds ) {
                            this.worldMap[ world.world_id ] = world;
                        }
                        // console.log( this.worldMap);
                        return this.worldMap;
                    }
                } );
            } else {
                return Observable.never();
            }
        } ).publishReplay(1).refCount();
    }
}