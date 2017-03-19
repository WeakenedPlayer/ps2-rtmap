// angular
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Headers, Http } from '@angular/http';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import { FormGroup, FormControl } from '@angular/forms';

// angularfire
import { AngularFire, AngularFireAuth } from 'angularfire2';

// rx
import { Observable, Subscription } from 'rxjs';

// other imports
import { Census, Identification } from '../../service';
import * as VM from './view-model';

// TODO: ユーザの認証状態によって、この画面への遷移を禁止すること

@Component({
  selector: 'character-profile',
  templateUrl: './character-profile.component.html',
  styleUrls: ['./character-profile.component.scss']
})
export class CharacterProfileComponent implements OnInit, OnDestroy {
    vm: VM.ViewModel = null;
    profile: Census.CharacterProfile = null;
    world: Census.World = null;
    onlineStatus: Census.CharacterOnlineStatus = null;
    testInput = new FormControl();

    // state
    isLoggedIn: boolean = false;
    uid: string = '';
    cid: string = '';
    
    // subscription
    subscription = new Subscription();
    
    constructor(
            private af: AngularFire,
            private census: Census.Service,
            private idservice: Identification.Service,
            private route: ActivatedRoute,
            private router: Router,
            private location: Location ) {
    }

    ngOnInit() {
        // Observable作成
        let cidObservable = this.route.params.map( ( params: Params ) =>  params['id'] );
        this.vm = new VM.ViewModel( this.census, this.af, this.idservice, cidObservable );

        // 必要な情報を非同期で取得(一括破棄できるようまとめる)
        this.subscription.add( cidObservable.subscribe( cid => this.cid = cid ) );
        this.subscription.add( this.idservice.currentUserObservable.subscribe( user => this.uid = ( user ? user.id : null ) ) );
        this.subscription.add( this.vm.profileObservable.subscribe( profile => this.profile = profile ) );
        this.subscription.add( this.vm.worldObservable.subscribe( world => this.world = world ) );
        this.subscription.add( this.vm.onlineStatusObservable.subscribe( onlineStatus => this.onlineStatus = onlineStatus ) );
        this.subscription.add( this.idservice.authStateObservable.subscribe( authState => this.isLoggedIn = ( authState ? true : false ) ) ); 
    }
    
    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    requestForIdentification() {
        this.vm.createRequest( this.uid, this.cid );
    }
    
    goBack() {
        this.location.back();
    }
}
