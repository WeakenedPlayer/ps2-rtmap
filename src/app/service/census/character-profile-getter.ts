import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Headers, Http } from '@angular/http';
import * as Common from './common';

class CharacterProfileList {
    character_list: CharacterProfile[];
}

/* CensusAPI が返してくる応答の一部 */
export class CharacterProfile {
    character_id: string;
    name: {
        first: string;
        first_lower: string;
    };
    battle_rank: {
        percent_to_next: number;
        value: number;
    };
    outfit: {
        member_rank: string;
        name: string;
        alias: string;
    };
    faction: {
        faction_id: number;
        name: {
          en: string;
        };
        image_path: string;
        code_tag: string;
    };
    world: {
        world_id: string;
    }
}

export class CharacterProfileGetter extends Common.QueryBase<string[],CharacterProfileList,CharacterProfile[]>{
    joinQuery: string;
    constructor( http: Http, baseProvider: Common.IBaseUrlProvider ) {
        super( http, baseProvider );
        let outfitQuery = new Common.JoinQuery( 'outfit_member_extended' );
            outfitQuery.show = [ 'name', 'alias', 'member_rank' ];
            outfitQuery.inject_at = 'outfit';
        let onlineQuery = new Common.JoinQuery( 'faction' );
            onlineQuery.inject_at = 'faction';
        let worldQuery = new Common.JoinQuery( 'characters_world' );
            worldQuery.inject_at = 'world';
        this.joinQuery = '&' + outfitQuery.toString() + '&' + onlineQuery.toString() + '&' + worldQuery.toString();
    }
    
    queryUrl( characterIds: string[] ): string {
        return 'character?character_id='+ characterIds.join(',') + this.joinQuery;
    }
    extract( response: CharacterProfileList ): CharacterProfile[] {
        return response.character_list;
    }
}
