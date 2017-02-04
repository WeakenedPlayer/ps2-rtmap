import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { Headers, Http } from '@angular/http';
import { FormGroup, FormControl } from '@angular/forms';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';

import * as Census from '../../service/census';
// https://blog.thoughtram.io/angular/2016/01/06/taking-advantage-of-observables-in-angular2.html

const CENSUS_API_LOWER_LIMIT = 3;

@Component({
  selector: 'character-search',
  templateUrl: './character-search.component.html',
  styleUrls: ['./character-search.component.scss']
})
export class CharacterSearchComponent implements OnInit {
    @Output() onCharacterSelected = new EventEmitter<string>();
    // 候補
    candidates: Census.CharacterName[];
    characterFinder: Census.CharacterNameGetter;
    
    // 選択結果
    selectedCharacterId: string = '';
    selectedCharacter: Census.CharacterName = null;
    
    // 検索用
    baseUrlProvider = new Census.UrlProvider();    
    partialNameInput = new FormControl();

    profile: Census.CharacterProfileGetter;
    constructor( http: Http ) {
        this.characterFinder = new Census.CharacterNameGetter( http, this.baseUrlProvider );
        this.partialNameInput.valueChanges
        .debounceTime(500)
        .distinctUntilChanged()
        .subscribe( partialName => {
            // 500msは間隔をあけて、内容が変わっていたら入力された文字列でCensus APIに問い合わせる
            if( partialName.length >= CENSUS_API_LOWER_LIMIT ){
                this.characterFinder.query( partialName.toLowerCase() )
                .then( result => {
                    this.candidates = result;
                })
                .catch( reason => { console.log( reason ); } );
            } else {
                // 表示を削除
                this.candidates = [];
            }
        });
        
        this.profile = new Census.CharacterProfileGetter( http, this.baseUrlProvider );
    }
    selectCharacter( characterName: Census.CharacterName ) {
        this.selectedCharacter = characterName;
        //console.log( characterName );
    }
    
    clear() {
        this.partialNameInput.setValue('');
        this.selectedCharacter = null;
        this.selectedCharacterId = '';
    }
    
    characterFixed( id: string ) {
        this.selectedCharacterId = id;
        this.onCharacterSelected.emit( this.selectedCharacterId );
        // console.log( id );
        console.log( this.profile.queryUrl( id ) );
    }

    ngOnInit() {
    }
}