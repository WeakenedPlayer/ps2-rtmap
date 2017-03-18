import { Observable } from 'rxjs';
import { Headers, Http } from '@angular/http';
import * as Common from './common';


class CharacterNameList {
    character_name_list: CharacterName[];
}

export class CharacterName {
    character_id: string;
    name: {
        first: string;
        first_lower: string;
    }
}

export class CharacterNameGetter extends Common.QueryBase<string,CharacterNameList,CharacterName[]>{
    maxCount: string;
    constructor( http: Http, baseProvider: Common.IBaseUrlProvider, maxCount = 5 ) {
        super( http, baseProvider );
        this.setMaxCount( maxCount );
    }
    
    private setMaxCount( maxCount: number ){
        let tmp = Math.floor( maxCount );
        if( tmp > 0 ) {
            this.maxCount = tmp.toString();
        }
    }
    
    queryUrl( partialName: string ): string {
        return 'character_name/?name.first_lower=^'+ partialName.toLowerCase() +'&c:limit=' + this.maxCount;
    }
    
    extract( response: CharacterNameList ): CharacterName[] {
        return response.character_name_list;
    }
}