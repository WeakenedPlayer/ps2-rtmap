import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Headers, Http } from '@angular/http';
import * as Common from './common';


class CharacterProfileList {
    character_name_list: CharacterProfile[];
}

export class CharacterProfile {
    character_id: string;
    name: {
        first: string;
        first_lower: string;
    }
}

export class CharacterProfileGetter extends Common.QueryBase<string,CharacterProfileList,CharacterProfile[]>{
    joinQuery: string;
    constructor( http: Http, baseProvider: Common.IBaseUrlProvider ) {
        super( http, baseProvider );
        let outfitQuery = new Common.JoinQuery( 'outfit_member_extended' );
            outfitQuery.show = [ 'alias', 'member_rank' ];
            outfitQuery.inject_at = 'outfit';
        let onlineQuery = new Common.JoinQuery( 'characters_online_status' );
            onlineQuery.inject_at = 'online';
        this.joinQuery = '&' + outfitQuery.toString() + '&' + onlineQuery.toString();
    }
    
    queryUrl( characterId: string ): string {
        console.log( 'character?character_id='+ characterId + this.joinQuery );
        return 'character?character_id='+ characterId + this.joinQuery;
    }
    extract( response: CharacterProfileList ): CharacterProfile[] {
        return response.character_name_list;
    }
}
