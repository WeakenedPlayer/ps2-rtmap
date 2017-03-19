import { Census, Identification } from '../../service';
import { AngularFire, AngularFireAuth } from 'angularfire2';
import { Observable } from 'rxjs';

/* ####################################################################################################################
 * 
 * ################################################################################################################# */

export class ViewModel {
    // Censusで検索する情報
    requestList: Observable<Identification.Request[]>;
    constructor( private af: AngularFire,
                 private census: Census.Service,
                 private ids: Identification.Service,
                 private pageObservable: Observable<number> ){
        this.requestList = this.ids.reqRepos.getAll();
        /*
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
        .refCount();*/
    }
}
