import { Acl, Identification, User, Db } from '../service';
import { Census } from '../service';
import { Observable, Subscriber } from 'rxjs';
import { Headers, Http } from '@angular/http';
import * as ServiceId from './service-id';
import 'rxjs/add/operator/toPromise';

//firebase
import { AngularFire , FirebaseObjectObservable, FirebaseListObservable, AngularFireAuth, FirebaseRef } from 'angularfire2';
import * as firebase from 'firebase';       // required for timestamp

export class AppModelTest {
    constructor( af: AngularFire ) {
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

    constructor( private user: User, private census: Census.Service ) {
        
    }

    getCharacterNameList( partialName: string ): Observable<Census.CharacterName[]>{
        return this.census.getCharacterNames( partialName );
    }

    selectCharacter( cid: string ): void {
        this.census.getCharacterProfiles( [ cid ] ).toPromise().then( profile => {
            if( profile ) {
                this.selectedProfile = profile[0];
            }
        } );
    }
    
    registerRequest(): void {
        
    }
}

