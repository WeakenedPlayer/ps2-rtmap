import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Headers, Http } from '@angular/http';
import * as Common from './common';

class WorldList {
    world_list: World[];
}

/* CensusAPI が返してくる応答の一部 */
export class World {
    world_id: string;
    state: string;
    name: {
        en: string;
    };
}

export class WorldGetter extends Common.QueryBase<string[],WorldList,World[]>{
    joinQuery: string;
    constructor( http: Http, baseProvider: Common.IBaseUrlProvider ) {
        super( http, baseProvider );
    }
    
    queryUrl( characterIds: string[] ): string {
        return 'world?world_id='+ characterIds.join(',') + this.joinQuery;
    }
    extract( response: WorldList ): World[] {
        return response.world_list;
    }
}
