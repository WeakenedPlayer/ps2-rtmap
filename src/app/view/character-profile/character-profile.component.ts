import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { Headers, Http } from '@angular/http';
import { Router, ActivatedRoute, Params } from '@angular/router';
import 'rxjs/add/operator/switchMap';

import * as Census from '../../service/census';

// TODO: ユーザの認証状態によって、この画面への遷移を禁止すること

@Component({
  selector: 'character-profile',
  templateUrl: './character-profile.component.html',
  styleUrls: ['./character-profile.component.scss']
})
export class CharacterProfileComponent implements OnInit {
    _selectedCharacterId: string;
    profile: Census.CharacterProfile;
    onlineStatus: Census.CharacterOnlineStatus;
    world: Census.World;
    
    // 検索用
    baseUrlProvider = new Census.UrlProvider();
    profileGetter: Census.CharacterProfileGetter;
    onlineStatusGetter: Census.CharacterOnlineStatusGetter;
    worldGetter: Census.WorldGetter;

    @Input()
    set selectedCharacterId( newId: string ) {
        this._selectedCharacterId = newId;
        console.log( this.profileGetter.queryUrl( this._selectedCharacterId ) );
        this.profileGetter.query( this._selectedCharacterId )
        .then( result => {
            this.profile = result;
            // console.log( result );
        } );
    }
    
    constructor(
            private http: Http,
            private route: ActivatedRoute,
            private router: Router ) {
        this.profileGetter = new Census.CharacterProfileGetter( http, this.baseUrlProvider );
        this.onlineStatusGetter = new Census.CharacterOnlineStatusGetter( http, this.baseUrlProvider );
    }

    ngOnInit() {
        this.route.params
        .switchMap( ( params: Params ) => {
            // param が変わるたびに呼ばれるので、その度に CensusAPIに問い合わせる
            return this.profileGetter.query( params['id'] );
        })
        .subscribe( profile => {
            // CensusAPIの問い合わせ結果を格納する
            this.profile = profile;
            console.log( profile );
            
            // サーバ名とオンライン状態は別途取得
            /*
            this.worldGetter.query( [ this.profile.world.world_id ] );
            this.onlineStatusGetter.query( [ this.profile.character_id ] ); 
            */
        });
    }
}
