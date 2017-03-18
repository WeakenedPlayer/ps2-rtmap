import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { Headers, Http } from '@angular/http';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import 'rxjs/add/operator/publishReplay';
import { Census } from '../../service/census';
import * as VM from './view-model';
import { AngularFire, AngularFireAuth } from 'angularfire2';
// TODO: ユーザの認証状態によって、この画面への遷移を禁止すること
// TODO: データの取得部分が大きいので、再利用できそうなら分けて作り直す。

@Component({
  selector: 'character-profile',
  templateUrl: './character-profile.component.html',
  styleUrls: ['./character-profile.component.scss']
})
export class CharacterProfileComponent implements OnInit {
    cid: Observable<string>;
    _selectedCharacterId: string;
    profile: Census.CharacterProfile = null;
    world: Census.World;
    onlineStatus: Census.CharacterOnlineStatus; // 後で見直し

    vm: VM.ViewModel = null;
    constructor(
            private af: AngularFire,
            private census: Census.Service,
            private route: ActivatedRoute,
            private router: Router,
            private location: Location ) {
    }

    ngOnInit() {
        this.cid = this.route.params.map( ( params: Params ) =>  params['id'] );
        this.vm = new VM.ViewModel( this.census, this.af, this.cid );
        this.vm.profile.subscribe( test => this.profile = test );
        this.vm.world.subscribe( test => this.world = test );
        this.vm.onlineStatus.subscribe( test => this.onlineStatus = test );
/*        this.cid.flatMap( cid => this.census.getCharacterProfiles( [ cid ] ) )
                .filter( profiles => ( profiles ) ? true : false )
                .map( profiles => profiles[0] )
                .subscribe( profile => this.profile = profile );*?
        /*
        .subscribe( profiles => {
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
        */
    }
    
    goBack() {
        this.location.back();
    }
}
