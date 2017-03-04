import { Acl, Identification, User, Repository } from '../index';
import { Census } from '../../census';
import { Observable, Subscriber } from 'rxjs';
import { Headers, Http } from '@angular/http';
import * as ServiceId from './service-id';
import 'rxjs/add/operator/toPromise';

//firebase
import { AngularFire , FirebaseObjectObservable, FirebaseListObservable, AngularFireAuth, FirebaseRef } from 'angularfire2';
import * as firebase from 'firebase';       // required for timestamp

export class AppModelTest {
    constructor( af: AngularFire ) {
        let dom = new Repository.Domain( 'test' );
        let ent = new Repository.Entity( 'aaa' );
        let val = new Repository.Value( 'bbb' );

        dom.add( ent );
        dom.add( val );
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

