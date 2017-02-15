import { Component, OnInit } from '@angular/core';
import { CensusService } from './service/census/census.service';

import { FormControl } from '@angular/forms';

import * as Repos from './service/model/repos';
import * as Model from './service/model/model';
import { AngularFire , FirebaseObjectObservable, FirebaseListObservable, AngularFireAuth, FirebaseRef } from 'angularfire2';

import 'rxjs/add/operator/toPromise';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})


export class AppComponent implements OnInit {
    selectedId: string;
    userRepos: Repos.UserRepository;
    reqRepos: Repos.IdentificationRequestRepository;
    constructor( private af: AngularFire ) {        
        this.userRepos = new Repos.UserRepository( this.af, '/test' );
        this.reqRepos = new Repos.IdentificationRequestRepository( this.af, this.userRepos, '/test' );
        /*
        this.userRepos.getUserById( 'testuser' ).then( user => {
            let req = new Model.IdentificationRequest( user, new Model.Character( 'test', 'im', 1,2,3) );
            this.reqRepos.addIdentificationRequest( req );
        } );*/
        
        let subsc = this.reqRepos.getIdentificationRequestObservable( 'testuser' ).subscribe( val => {
            console.log( val );
        } );
    }
    
    ngOnInit() {
    }
    characterSelected( id: string ){
        console.log( id );
        this.selectedId = id;
    }
}
