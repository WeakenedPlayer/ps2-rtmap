import { Component, OnInit } from '@angular/core';
import * as Census from './service/census';
import { Headers, Http } from '@angular/http';

import { FormControl } from '@angular/forms';

import { Repository } from './service/id';
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
        /*
        this.userRepos.getUserById( 'testuser' ).then( user => {
            let req = new Model.IdentificationRequest( user, new Model.Character( 'test', 'im', 1,2,3) );
            this.reqRepos.addIdentificationRequest( req );
        } );
        
        let subsc = this.reqRepos.getIdentificationRequestObservable( 'testuser' ).take(3).subscribe( val => {
            console.log( val );
        }, err => {}, () => { console.log( 'done'); subsc.unsubscribe(); } );
        let subsc = this.reqRepos.getIdentificationRequestObservable( 'testuser' ).toPromise().then( val => console.log( val) );*/
        
        // let subsc = this.userRepos.getUserById( 'testuser' ).then( user => console.log( user ) );
     // let character = new Census.CharacterNameGetter( http, new Census.UrlProvider() );
     // let subscriber = character.get( 'PartyOf' ).toPromise().then( result => console.log( result ) );
//
//       let pa = new Model.Permission( 'a' );
//        let pb = new Model.Permission( 'b' ); 
//        let pc = new Model.Permission( 'c' );
//        let pd = new Model.Permission( 'd' );
//        let exe = new Model.Executer();
//        let op = new Model.Operation();
//        let requirement = new Model.PermissionRequirement();
//        
//        requirement.add( pa );
//        exe.grant( pa );
//        exe.grant( pb );
//        exe.grant( pc );
//        op.requires( requirement );
//        try
//        {
//            op.execute( exe );
//        } catch( err ) {
//            console.log( err.message );
//        }
    }
    
    ngOnInit() {
    }
    characterSelected( id: string ){
        console.log( id );
        this.selectedId = id;
    }
}
