// angular
import { Component, OnInit, Input } from '@angular/core';
import { Headers, Http } from '@angular/http';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import { FormGroup, FormControl } from '@angular/forms';

// angularfire
import { AngularFire, AngularFireAuth } from 'angularfire2';

// rx
import { Observable } from 'rxjs';

// other imports
import { Census, Identification } from '../../service';
import * as VM from './view-model';

// TODO: ユーザの認証状態によって、この画面への遷移を禁止すること

@Component({
  selector: 'character-profile',
  templateUrl: './character-profile.component.html',
  styleUrls: ['./character-profile.component.scss']
})
export class CharacterProfileComponent implements OnInit {
    vm: VM.ViewModel = null;
    profile: Census.CharacterProfile = null;
    world: Census.World = null;
    onlineStatus: Census.CharacterOnlineStatus = null;
    testInput = new FormControl();

    // state
    isLoggedIn: boolean = false;
    isUserEnabled: boolean = false;
    
    constructor(
            private af: AngularFire,
            private census: Census.Service,
            private idservice: Identification.Service,
            private route: ActivatedRoute,
            private router: Router,
            private location: Location ) {
    }

    ngOnInit() {
        // view model 作成
        this.vm = new VM.ViewModel( this.census, this.af, this.route.params.map( ( params: Params ) =>  params['id'] ) );
        
        // subscribe
        this.vm.profile.subscribe( profile => this.profile = profile );
        this.vm.world.subscribe( world => this.world = world );
        this.vm.onlineStatus.subscribe( onlineStatus => this.onlineStatus = onlineStatus );
        
        // idservice test
        this.idservice.authStateObservable.subscribe( authState => {
            if( authState ) {
                this.isLoggedIn = true;
            } else { 
                this.isLoggedIn = false;
            }
            console.log( this.isLoggedIn );
        } );
        
        this.idservice.currentUserObservable.subscribe( user => {
            console.log( user );
            if( user ) {
                this.isUserEnabled = true;
            } else {
                this.isUserEnabled = false;
            }
            console.log( this.isUserEnabled );
        } );
}

    goBack() {
        this.location.back();
    }
}
