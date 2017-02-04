import { Component, OnInit, Input, Directive } from '@angular/core';
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
            // Census
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
    selectCharacter( id: string ) {
        console.log( id );
    }
    
    clear() {
        this.partialNameInput.setValue('');
    }

    ngOnInit() {
    }
}