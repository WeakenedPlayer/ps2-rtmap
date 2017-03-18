import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { Headers, Http } from '@angular/http';
import { FormGroup, FormControl } from '@angular/forms';
import { Location } from '@angular/common';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/toPromise';
// https://blog.thoughtram.io/angular/2016/01/06/taking-advantage-of-observables-in-angular2.html

import { Census } from '../../service/census';

const CENSUS_API_LOWER_LIMIT = 3;

@Component({
  selector: 'character-search',
  templateUrl: './character-search.component.html',
  styleUrls: ['./character-search.component.scss']
})
export class CharacterSearchComponent implements OnInit {
    // 候補
    candidates: Census.CharacterName[];
    
    // 選択結果
    selectedCharacter: Census.CharacterName = null;
    
    // 検索用
    partialNameInput = new FormControl();

    // Regexp
    inputCheck: RegExp;

    constructor( private census: Census.Service, private location: Location ) {
        this.inputCheck = new RegExp( /^([a-z0-9])+$/ );
        this.partialNameInput.valueChanges
        .debounceTime(500)
        .map( str => str.trim().toLowerCase() )
        .distinctUntilChanged()
        .filter( str => this.inputCheck.test( str ) )
        .subscribe( ( partialName: string ) => {
            // 500msは間隔をあけて、内容が変わっていたら入力された文字列でCensus APIに問い合わせる
            if( partialName.length >= CENSUS_API_LOWER_LIMIT ){
                this.census.getCharacterNames( partialName )
                .toPromise()
                .then( result => {
                    console.log( result );
                    this.candidates = result;
                })
                .catch( reason => {
                    // 暫定
                    console.log( reason ); } );
            } else {
                // 表示を削除
                this.candidates = [];
            }
        });
    }
    selectCharacter( characterName: Census.CharacterName ) {
        this.selectedCharacter = characterName;
    }
    
    clear() {
        this.partialNameInput.setValue('');
        this.selectedCharacter = null;
    }

    ngOnInit() {
    }
    
    goBack() {
        this.location.back();
    }
}