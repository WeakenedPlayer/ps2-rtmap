import { Component, OnInit, Input } from '@angular/core';
import { CensusService } from '../../service/census/census.service';

@Component({
  selector: 'character-search',
  templateUrl: './character-search.component.html',
  styleUrls: ['./character-search.component.scss']
})
export class CharacterSearchComponent implements OnInit {
    @Input() characterName: string;
    candidates: string[] = [];
    census: CensusService;
    answer: any[] = [];
    constructor( census: CensusService ) {
        this.census = census;
    }

    ngOnInit() {
  }
    search( name: string ) {
        console.log( name );
        if( name.length > 4 ){
            this.census.findCharacterName( name.toLowerCase(), ( result ) => { this.answer = result; console.log( result ); }  );
        }
    }
}
