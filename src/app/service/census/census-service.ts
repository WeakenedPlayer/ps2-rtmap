import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';
import { Observable } from 'rxjs';

import * as ServiceId from './service-id';
import * as Census from './modules';

@Injectable()
export class Service {
    urlProvider: Census.UrlProvider;
    characterNameGetter: Census.CharacterNameGetter;
    characterProfileGetter: Census.CharacterProfileGetter;
    characterOnlineStatusGetter: Census.CharacterOnlineStatusGetter;
    worldGetter: Census.WorldGetter;
    
    // TODO: パラメータを入れる方法を調べること
    constructor( private http: Http ) {
        this.urlProvider = new Census.UrlProvider( ServiceId.CENSUS_SERVICE_ID );
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
