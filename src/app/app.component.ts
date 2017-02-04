import { Component, OnInit } from '@angular/core';
import { CensusService } from './service/census/census.service';

import { FormControl } from '@angular/forms';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
    constructor() {
    }
    
    ngOnInit() {
    }
    characterSelected( event: any ){
        console.log( event );
    }
}
