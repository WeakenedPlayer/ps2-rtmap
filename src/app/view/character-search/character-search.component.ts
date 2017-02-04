import { Component, OnInit, Input, Directive } from '@angular/core';
import { CensusService } from '../../service/census/census.service';
import { Observable } from 'rxjs';
import { FormGroup, FormControl } from '@angular/forms';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';

class characterName {
    character_id: string;
    name: {
        first: string;
        first_lower: string;
    }
}

class responses {
    character_name_list: characterName[];
}

@Component({
  selector: 'character-search',
  templateUrl: './character-search.component.html',
  styleUrls: ['./character-search.component.scss']
})
export class CharacterSearchComponent implements OnInit {
    census: CensusService;
    candidates: characterName[];
    partialNameInput = new FormControl();
    testmap: Observable<any>;
    constructor( census: CensusService ) {
        this.census = census;

        this.partialNameInput.valueChanges
        .debounceTime(1000)
        .distinctUntilChanged()
        .subscribe( partialName => {
            if( partialName.length > 3 ){
                this.census.findCharacterName( partialName.toLowerCase() )
                .then( result => {
                    let tmp = ( result.json() as responses ).character_name_list;
                    if( tmp ) {
                        this.candidates = tmp;
                        console.log( this.candidates[0] );
                    }
                } );
            }
        });
    }

    ngOnInit() {
    }
}