import { Component, OnInit } from '@angular/core';
import * as Census from './service/census';
import { Headers, Http } from '@angular/http';

import { FormControl } from '@angular/forms';

import { User, Repository, Acl } from './service/id';
import { AngularFire , FirebaseObjectObservable, FirebaseListObservable, AngularFireAuth, FirebaseRef } from 'angularfire2';

import 'rxjs/add/operator/toPromise';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})


export class AppComponent implements OnInit {
    selectedId: string;
    userRepos: Repository.UserRepository;
    reqRepos: Repository.RequestRepository;
    constructor( private af: AngularFire, private http: Http ) { 
        this.userRepos = new Repository.UserRepository( this.af, '/test' );
        this.reqRepos = new Repository.RequestRepository( this.af, this.userRepos, '/test' );

        let required = new Acl.PermissionSet();
        required.add( new Acl.Permission( 'x' ) );
        required.add( new Acl.Permission( 'y' ) );
        let test = new Acl.PermissionSet();
        test.add( new Acl.Permission( 'test1' ) );
        test.add( new Acl.Permission( 'test2' ) );
        test.add( new Acl.Permission( 'test3' ) );
        test.add( new Acl.Permission( 'test4' ) );


        console.log( 'pre' );
        console.log( required );

        required.append( test );
        
        console.log( 'append' );
        console.log( required );
    }
    
    ngOnInit() {
    }
    characterSelected( id: string ){
        console.log( id );
        this.selectedId = id;
    }
}
