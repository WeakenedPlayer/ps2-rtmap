import { Component, OnInit } from '@angular/core';
import * as Census from './service/census';
import { Headers, Http } from '@angular/http';

import { FormControl } from '@angular/forms';

import { DB, Acl, Identification } from './service';
import { AngularFire , FirebaseObjectObservable, FirebaseListObservable, AngularFireAuth, FirebaseRef } from 'angularfire2';

import 'rxjs/add/operator/toPromise';

import { ReposSample } from './sample';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})

export class AppComponent implements OnInit {
    selectedId: string= "";
    createdChildren: string[] = []; 
    reposSample: ReposSample.Test;
    constructor( private af: AngularFire, private http: Http ) { 
        this.reposSample = new ReposSample.Test( af );
    }
    
    ngOnInit() {
    }
    characterSelected( id: string ){
        console.log( id );
        this.selectedId = id;
    }

    test(){
        console.log('test1');
        this.reposSample.addUser( new Identification.User( 'aaaaaa', false ) );
    }
    test2(){
        console.log('test2');
        this.reposSample.getUser( 'aaaaaa' );
    }
    test3(){
    }
}
