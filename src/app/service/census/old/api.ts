import { Observable } from 'rxjs';
import { Headers, Http } from '@angular/http';
import * as Census from './modules';

// 分けて作ったものを統合(無名関数で作った方が良かったかも)
export class Api {
    urlProvider: Census.UrlProvider;
    characterNameGetter: Census.CharacterNameGetter;
    characterProfileGetter: Census.CharacterProfileGetter;
    characterOnlineStatusGetter: Census.CharacterOnlineStatusGetter;
    worldGetter: Census.WorldGetter;

    constructor( private http: Http, serviceId: string ) {
        this.urlProvider = new Census.UrlProvider( serviceId );
        this.characterNameGetter = new Census.CharacterNameGetter( http, this.urlProvider );
        this.characterProfileGetter = new Census.CharacterProfileGetter( http, this.urlProvider );
        this.characterOnlineStatusGetter = new Census.CharacterOnlineStatusGetter( http, this.urlProvider );
        this.worldGetter = new Census.WorldGetter( http, this.urlProvider );
    } 
    
    getCharacterNames( partialName: string ): Observable<Census.CharacterName[]>{
        return this.characterNameGetter.get( partialName );
    }

    getCharacterProfiles( cids: string[] ): Observable<Census.CharacterProfile[]> {
        return this.characterProfileGetter.get( cids );
    }

    getCharacterOnlineStatuses( cids: string[] ): Observable<Census.CharacterOnlineStatus[]> {
        return this.characterOnlineStatusGetter.get( cids );
    }

    getWorlds( worldIds: string[] ): Observable<Census.World[]> {
        return this.worldGetter.get( worldIds );
    }
}
