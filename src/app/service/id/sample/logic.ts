import { Acl, Identification, User } from '../index';
import { Census } from '../../census';
import { Observable, Subscriber } from 'rxjs';
import { Headers, Http } from '@angular/http';
import * as ServiceId from './service-id';
import 'rxjs/add/operator/toPromise';

export class AppModelTest {
    census: Census.Api;
    constructor( private user: User, private http: Http ){
        this.census = new Census.Api( http, ServiceId.CENSUS_SERVICE_ID );
    }
       
    test(){
    }
}

export class IdentificationModel {
    user: User;
    identity: Identification.UserIdentity;
}

// キャラクターを選択して、キャラクターを登録するまで
export class RequestViewModel {
    selectedProfile: Census.CharacterProfile = null;


    constructor( private user: User, private census: Census.Api ) {
    }

    getCharacterNameList( partialName: string ): Observable<Census.CharacterName[]>{
        return this.census.getCharacterNames( partialName );
    }

    selectCharacter( cid: string ): void {
        this.census.getCharacterProfiles( [ cid ] ).toPromise().then( profile => {
            this.selectedProfile = profile[0];
        } );
    }
    
}

