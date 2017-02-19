import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { Headers, Http } from '@angular/http';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import 'rxjs/add/operator/switchMap';
import { Census } from '../../service/census';

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

    constructor(
            private census: Census.Service,
            private route: ActivatedRoute,
            private router: Router,
            private location: Location ) {
        // nothing to do
    }

    ngOnInit() {
        let subscriber = this.route.params
        .switchMap( ( params: Params ) => {
            // param が変わるたびに呼ばれるので、その度に CensusAPIに問い合わせる
            let characterId: string = params['id'];
            return this.census.getCharacterProfiles( [ characterId ] );
        } )
        .subscribe( profiles => {
            subscriber.unsubscribe();
            // CensusAPIの問い合わせ結果を格納する
            // 結果が取得できていれば以降の処理を継続
            if( profiles ) {
                this.profile = profiles[0];
                let worldObservable = this.census.getWorlds( [ this.profile.world.world_id ] );
                let onlineObservable = this.census.getCharacterOnlineStatuses( [ this.profile.world.world_id ] );

                worldObservable.toPromise().then( worlds => {
                    if( worlds ) {
                        this.world = worlds[0];                
                    } else {
                        this.world = undefined;
                    }
                } );

                onlineObservable.toPromise().then( onlineStatuses => {
                    if( onlineStatuses ) {
                        this.onlineStatus = onlineStatuses[0];                
                    } else {
                        this.onlineStatus = undefined;
                    }
                } );
            }
        } );
    }
    
    goBack() {
        this.location.back();
    }
}
