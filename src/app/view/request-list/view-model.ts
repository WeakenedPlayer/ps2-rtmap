import { Census, Identification, Comm, DB } from '../../service';
import { AngularFire, AngularFireAuth } from 'angularfire2';
import { Observable, Subscription } from 'rxjs';

/* ####################################################################################################################
 * 受付 出題する
 * 要求 ゲームを通して回答する
 * 連絡: 一致していたら登録確認、不一致ならリトライ確認
 * ################################################################################################################# */
export class ViewModel {
    // Censusで検索する情報
    requestList: Observable<Identification.Request[]>;
    profileMapObservable: Observable<{ [key:string]: Census.CharacterProfile }>;
    worldList: Observable<Census.World[]>;

    constructor( private af: AngularFire,
                 private census: Census.Service,
                 private ids: Identification.Service,
                 private pageObservable: Observable<number> ){
        this.requestList = this.ids.reqRepos.getAll().publishReplay(1).refCount();
        /*
        this.profileMapObservable = this.requestList.flatMap( requests => {
            let profileMap: { [key:string]: Census.CharacterProfile } = {};
            let loadedPage: { [key:number]: boolean } = {};
            let uniqueCids: { [key:string]: boolean } = {};
            // 増える問題がある
            return this.pageObservable.filter( ( page: number ) => !loadedPage[ page ] ).flatMap( page => {
                loadedPage[ page ] = true;
                return this.requestList.map( requests => {
                    let offset = Math.floor( ( page * reqPerPage ) / maxBuffer ) * maxBuffer;
                    let count = Math.min( maxBuffer, requests.length - offset );
                    let cids: string[] = [];
                    for( let i = 0; i < count; i++ ) {
                        let tmp: string = requests[ i + offset ].cid;
                        if( !uniqueCids[ tmp ] ) {
                            cids.push( tmp );
                            uniqueCids[ tmp ] = true;
                        } else {
                            console.log( tmp + ' is already loaded' );
                        }
                    }
                    return cids;
                } );
            } )
            .filter( cids => cids.length > 0 )
            .flatMap( cids => this.census.getCharacterProfiles( cids ) )
            .filter( profiles => !!profiles )
            .map( profiles => {
                for( let profile of profiles ) {
                    profileMap[ profile.character_id ] = profile;
                }
                return profileMap;
            } );
        } );*/
    }
}