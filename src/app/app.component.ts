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
        /*
        let execRepos = new Repository.ExecuterRepository( af, '/test' );

        let required = new Acl.PermissionSet();
        required.add( new Acl.Permission( 'x' ) );
        required.add( new Acl.Permission( 'y' ) );
        let test = new Acl.PermissionSet();
        test.add( new Acl.Permission( 'test1' ) );
        test.add( new Acl.Permission( 'test2' ) );
        
        let user = new User( '8PGAlqf37mU1jwzQ7t9UNllm73t1',false,1 );
        let exe: Acl.Executer;
        
        execRepos.getByUser( user ).subscribe( x => { console.log( 'test'); console.log(x); } );
        */
        
        this.testAttribute();
    }
    
    ngOnInit() {
    }
    characterSelected( id: string ){
        console.log( id );
        this.selectedId = id;
    }
    
    testAttribute() {
        let adminAttr = new Acl.Attribute( 'admin' );
        let mapAccessAttr = new Acl.Attribute( 'mapAccess' );
        
        let hasAdminCondition = new Acl.Condition( 'admin', ( attr ) => { return attr.get(adminAttr) } );
        let hasMapAccessCondition = new Acl.Condition( 'mapAccess', ( attr ) => { return attr.get(mapAccessAttr) } );
        
        let attr = new Acl.AttributeSet();
        attr.set( adminAttr, true );
        attr.set( mapAccessAttr, false );

        let andCond = new Acl.AndConditionSet( [ hasAdminCondition, hasMapAccessCondition ] );
        console.log( andCond.test( attr ) );
        

        let orCond = new Acl.OrConditionSet( [ hasAdminCondition, hasMapAccessCondition ] );
        console.log( orCond.test( attr ) );
    }
}
