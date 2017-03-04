import { Component, OnInit } from '@angular/core';
import * as Census from './service/census';
import { Headers, Http } from '@angular/http';

import { FormControl } from '@angular/forms';

import { User, Repository, Acl } from './service/id';
import { AngularFire , FirebaseObjectObservable, FirebaseListObservable, AngularFireAuth, FirebaseRef } from 'angularfire2';

import 'rxjs/add/operator/toPromise';

import { AclSample, Mapper } from './service/id/sample';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})


export class AppComponent implements OnInit {
    selectedId: string;
    mapperTest: Mapper.Sample;
    constructor( private af: AngularFire, private http: Http ) { 
        this.mapperTest = new Mapper.Sample( af );
    }
    
    ngOnInit() {
    }
    characterSelected( id: string ){
        console.log( id );
        this.selectedId = id;
    }

    test(){
        this.mapperTest.test1();
    }
    test2(){
        this.mapperTest.test2();
    }
    test3(){
        this.mapperTest.test3();
    }
}
