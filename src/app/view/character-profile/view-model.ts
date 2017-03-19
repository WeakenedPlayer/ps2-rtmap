import { Census, Identification } from '../../service';
import { AngularFire, AngularFireAuth } from 'angularfire2';
import { Observable } from 'rxjs';

/* ####################################################################################################################
 * View Model?
 * 必要な情報のObservableを用意する
 * 実際の値は View側でSubscribeして取り出してもらう
 * ################################################################################################################# */

export class ViewModel {
    // Censusで検索する情報
    worldObservable: Observable<Census.World>;
    profileObservable: Observable<Census.CharacterProfile>;
    onlineStatusObservable: Observable<Census.CharacterOnlineStatus>;

    // ユーザ
    uidObservable

    constructor( private census: Census.Service,
                 private af: AngularFire,
                 private ids: Identification.Service,
                 private cidObservable: Observable<string> ){        
        // Profile の　Observable
        this.profileObservable = this.cidObservable.flatMap( cid => this.census.getCharacterProfiles( [ cid ] ) )
        .filter( profiles => ( profiles ) ? true : false )
        .map( profiles => profiles[0] )
        .publish()
        .refCount(); 
        
        // World の Observable
        this.worldObservable = this.profileObservable.flatMap( profile => this.census.getWorlds( [ profile.world.world_id ] ) )
        .filter( worlds => ( worlds ) ? true : false )
        .map( worlds => worlds[0] )
        .publish()
        .refCount(); 
        
        // OnlineStatus の Observable
        this.onlineStatusObservable = this.profileObservable.flatMap( profile => this.census.getCharacterOnlineStatuses( [ profile.character_id ] ) )
        .filter( onlineStatuses => ( onlineStatuses ) ? true : false )
        .map( onlineStatuses => onlineStatuses[0] )
        .publish()
        .refCount();
    }
    
    createRequest( uid: string, cid: string ) {
        this.ids.reqRepos.register( uid, cid );
    }
}
