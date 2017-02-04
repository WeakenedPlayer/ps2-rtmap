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
    candidates: responses;
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
                    this.candidates = result.json() as responses;
                    console.log( this.candidates.character_name_list[0] );
                } );
            }
        });
    }

    ngOnInit() {
    }
}