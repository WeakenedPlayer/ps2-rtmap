import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { Headers, Http } from '@angular/http';
import { FormGroup, FormControl } from '@angular/forms';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';

import * as Census from '../../service/census';

@Component({
  selector: 'character-profile',
  templateUrl: './character-profile.component.html',
  styleUrls: ['./character-profile.component.scss']
})
export class CharacterProfileComponent implements OnInit {
    _selectedCharacterId: string;
    profile: Census.CharacterProfile;
    
    // 検索用
    baseUrlProvider = new Census.UrlProvider();
    profileGetter: Census.CharacterProfileGetter;

    @Input()
    set selectedCharacterId( newId: string ) {
        this._selectedCharacterId = newId;
        console.log( this.profileGetter.queryUrl( this._selectedCharacterId ) );
        this.profileGetter.query( this._selectedCharacterId )
        .then( result => {
            this.profile = result;
            console.log( result );
        } );
    }
    
    constructor( http: Http ) {
        this.profileGetter = new Census.CharacterProfileGetter( http, this.baseUrlProvider );
    }

    ngOnInit() {
    }
}