import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/toPromise';
import * as ServiceId from './census-service-id';

/* ############################################################################
 * 登録されたキャラクターの情報を一覧表示するためのクエリ(情報を一部省略する)
 * http://census.daybreakgames.com/<service_id>/get/ps2:v2/<query>
 *   character?character_id=<ID>
 *      Character collectionから条件に合致する情報を取得
 *   c:lang=en
 *      複数言語の表記がある場合、英語表記に限定する
 *   c:join=outfit_member_extended^inject_at:outfit
 *      キャラクターが所属するアウトフィットの詳細を「outfit」以下に付加する
 *   c:join=characters_online_status^inject_at:online
 * ######################################################################### */
class JoinQuery {
    typeOfCollectionToJoin: string;
    on?: string = null;
    to?: string = null;
    list?: boolean = null;
    show?: string[] = null;
    hide?: string[] = null;
    inject_at?: string = null;
    terms?: string;
    outer?: boolean = true;
    
    constructor( typeOfCollectionToJoin: string ){
        this.typeOfCollectionToJoin = typeOfCollectionToJoin;
    }
    toString(){
        let query = 'c:join=' + this.typeOfCollectionToJoin 
                  +            ( this.on        ? '^on:'        + this.on              : '' )
                  +            ( this.to        ? '^to:'        + this.to              : '' )
                  + '^list:' + ( this.list      ? '1'                                  : '0')
                  +            ( this.show      ? '^show:'      + this.show.join('\'') : '' )
                  +            ( this.hide      ? '^hide:'      + this.hide.join('\'') : '' )
                  +            ( this.inject_at ? '^inject_at:' + this.inject_at       : '' )
                  +            ( this.terms     ? '^terms:'     + this.terms           : '' )
                  + '^outer:' + ( this.outer     ? '1'                                  : '0');
        return query;
    }
}

const CENSUS_URL = 'http://census.daybreakgames.com/s:' + ServiceId.CENSUS_SERVICE_ID + '/get/ps2:v2/';
@Injectable()
export class CensusService {
    // プレイヤー情報、所属するアウトフィット情報の一部、オンライン状態を取得(一覧表示に使用)
    static getCharacterInfoQuery( characterIdList: string[] ){
        let outfitQuery = new JoinQuery( 'outfit_member_extended' );
            outfitQuery.show = [ 'alias', 'member_rank' ];
            outfitQuery.inject_at = 'outfit';
        let onlineQuery = new JoinQuery( 'characters_online_status' );
            onlineQuery.inject_at = 'online';
        
        return CENSUS_URL + 'character?character_id='+ characterIdList.join(',') + '&' + outfitQuery.toString() + '&' + onlineQuery.toString();
    }
    
    static getCharacterOnlineStatusQuery( characterIdList: string[] ){
        return CENSUS_URL + 'characters_online_status?character_id='+ characterIdList.join(',') ;
    }
    
    static searchCharacterNamesQuery( partialName: string ){
        return CENSUS_URL + 'character_name/?name.first_lower=^'+ partialName +'&c:limit=10';
    }
    
    
    http: Http;
    constructor( http: Http ) {
        this.http = http;
    }

    findCharacterName( partialName: string, callback: (any) => void ): Promise<any> {
        console.log( CensusService.searchCharacterNamesQuery( partialName ) ); 
        return this.http.get( CensusService.searchCharacterNamesQuery( partialName ) ).toPromise()
            .then( response => { callback( response.json() as any );  } )
            .catch( this.handleError );
    }

    
    getCharactersGeneralInfo( characterIdList: string[], callback: (any) => void ): Promise<any> {
        return this.http.get( CensusService.getCharacterOnlineStatusQuery( characterIdList ) )
            .toPromise()
            .then( response => { callback( response.json() as any );  } )
            .catch( this.handleError );
    }

    getCharactersOnlineStatus( characterIdList: string[], callback: (any) => void ): Promise<any> {
        return this.http.get( CensusService.getCharacterOnlineStatusQuery( characterIdList ) )
            .toPromise()
            .then( response => { callback( response.json() as any );  } )
            .catch( this.handleError );
    }

    private handleError( error: any ): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject( error.message || error );
    }
}

