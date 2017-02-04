import { Component, OnInit, Output } from '@angular/core';
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
  templateUrl: './character-search.component.html'
})
export class CharacterSearchComponent implements OnInit {
    @Output() selectedCharacterId: string = '';
    selectedCharacter: Census.CharacterName = null;
    candidates: Census.CharacterName[];
    characterFinder: Census.CharacterNameFinder;
    baseUrlProvider = new Census.UrlProvider();
    
    partialNameInput = new FormControl();
    testmap: Observable<any>;
    constructor( http: Http ) {
        this.characterFinder = new Census.CharacterNameFinder( http, this.baseUrlProvider );
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
    }
    selectCharacter( characterName: Census.CharacterName ) {
        this.selectedCharacter = characterName;
        console.log( characterName );
    }
    
    clear() {
        this.partialNameInput.setValue('');
        this.selectedCharacter = null;
        this.selectedCharacterId = '';
    }
    
    characterFixed( id: string ) {
        this.selectedCharacterId = id; 
        console.log( id );
    }

    ngOnInit() {
    }
}