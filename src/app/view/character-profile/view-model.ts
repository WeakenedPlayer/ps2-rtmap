import { Census, Identification } from '../../service';
import { AngularFire, AngularFireAuth } from 'angularfire2';
import { Observable } from 'rxjs';

export class ViewModel {
    // Censusで検索する情報
    world: Observable<Census.World>;
    profile: Observable<Census.CharacterProfile>;
    onlineStatus: Observable<Census.CharacterOnlineStatus>;

    // 本人確認

    constructor( private census: Census.Service, private af: AngularFire, private cid: Observable<string> ){
        this.profile = this.cid.flatMap( cid => this.census.getCharacterProfiles( [ cid ] ) )
                                                    .filter( profiles => ( profiles ) ? true : false )
                                                    .map( profiles => profiles[0] ).publish().refCount();
        this.world = this.profile.flatMap( profile => this.census.getWorlds( [ profile.world.world_id ] ) )
                           .filter( worlds => ( worlds ) ? true : false )
                           .map( worlds => worlds[0] );
        this.onlineStatus = this.profile.flatMap( profile => this.census.getCharacterOnlineStatuses( [ profile.character_id ] ) )
                                        .filter( onlineStatuses => ( onlineStatuses ) ? true : false )
                                        .map( onlineStatuses => onlineStatuses[0] );
    }
}