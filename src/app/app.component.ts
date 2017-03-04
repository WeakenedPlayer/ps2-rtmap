import { Component, OnInit } from '@angular/core';
import * as Census from './service/census';
import { Headers, Http } from '@angular/http';

import { FormControl } from '@angular/forms';

import { User, Repository, Acl } from './service/id';
import { AngularFire , FirebaseObjectObservable, FirebaseListObservable, AngularFireAuth, FirebaseRef } from 'angularfire2';

import 'rxjs/add/operator/toPromise';

import { AclSample,  Mapper } from './service/id/sample';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})


export class AppComponent implements OnInit {
    selectedId: string;
    childDb: Mapper.ChildDb;
parentDb2: Mapper.ParentDb2;
    constructor( private af: AngularFire, private http: Http ) { 
        this.childDb = new Mapper.ChildDb( af, '/test/mapper' );
         this.parentDb2 = new Mapper.ParentDb2( af, '/test/multi', this.childDb );
        /*
        let test = new AclSample.Test();
        try {
            test.test();
        } catch( err ) {
            console.log( err );
        }
        
        let appTest = new LogicSample.AppModelTest(af);
        this.childDb.set( new Mapper.ChildClass( 'test', 'combined' ) );
        this.childDb.set( new Mapper.ChildClass( 'fun', 'time' ) );
        this.parentDb.set( new Mapper.ParentClass( 'mxyz', 'xyz multi', 
                new Mapper.ChildClass( 'test', 'combined' ),
                new Mapper.ChildClass( 'fun', 'time') ) ); 
        */   
    }
    
    ngOnInit() {
    }
    characterSelected( id: string ){
        console.log( id );
        this.selectedId = id;
    }

    test(){
        console.time('xyz');
        let subscription = this.childDb.get( 'abc' ).subscribe( result => {
          console.timeEnd('xyz');
          console.log( result );
        });
    }
    test2(){
        console.time('aaaaa');
        let subscription = this.parentDb2.get('mxyz').subscribe( result => {
            console.timeEnd('aaaaa');
            console.log( result );
        });
    }
    test3(){
        console.time('aaaaa');
        let subscription = this.parentDb2.getAll().subscribe( result => {
            console.timeEnd('aaaaa');
            console.log( result );
        });
    }
}
