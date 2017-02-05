import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { Headers, Http } from '@angular/http';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import 'rxjs/add/operator/switchMap';

import * as Census from '../../service/census';

// TODO: ユーザの認証状態によって、この画面への遷移を禁止すること
// TODO: データの取得部分が大きいので、再利用できそうなら分けて作り直す。

@Component({
  selector: 'character-profile',
  templateUrl: './character-profile.component.html',
  styleUrls: ['./character-profile.component.scss']
})
export class CharacterProfileComponent implements OnInit {
    _selectedCharacterId: string;
    profile: Census.CharacterProfile;
    world: Census.World;
    onlineStatus: Census.CharacterOnlineStatus; // 後で見直し
    
    // 検索用
    baseUrlProvider = new Census.UrlProvider();
    profileGetter: Census.CharacterProfileGetter;
    onlineStatusGetter: Census.CharacterOnlineStatusGetter;
    worldGetter: Census.WorldGetter;

    constructor(
            private http: Http,
            private route: ActivatedRoute,
            private router: Router,
            private location: Location ) {
        this.profileGetter = new Census.CharacterProfileGetter( http, this.baseUrlProvider );
        this.onlineStatusGetter = new Census.CharacterOnlineStatusGetter( http, this.baseUrlProvider );
        this.worldGetter = new Census.WorldGetter( http, this.baseUrlProvider );
    }

    ngOnInit() {
        this.route.params
        .switchMap( ( params: Params ) => {
            // param が変わるたびに呼ばれるので、その度に CensusAPIに問い合わせる
            return this.profileGetter.query( params['id'] );
        })
        .subscribe( profile => {
            // CensusAPIの問い合わせ結果を格納する
            // console.log( profile );
            this.profile = profile;
            
            if( profile ) {
                // サーバ名とオンライン状態は別途取得
                this.worldGetter.query( [ this.profile.world.world_id ] )
                .then( world => { 
                    this.world = world[0];
                }, err => {
                    this.world = undefined;
                } );
    
                this.onlineStatusGetter.query( [ this.profile.character_id ] )
                .then( onlineStatus => { 
                    this.onlineStatus = onlineStatus[0];
                }, err => {
                    this.onlineStatus = undefined;
                } );
            }
        });
    }
    
    goBack() {
        this.location.back();
    }
}
