import { Component, OnInit } from '@angular/core';
import * as Census from './service/census';
import { Headers, Http } from '@angular/http';

import { FormControl } from '@angular/forms';

import { User, Repository, Acl } from './service/id';
import { AngularFire , FirebaseObjectObservable, FirebaseListObservable, AngularFireAuth, FirebaseRef } from 'angularfire2';

import 'rxjs/add/operator/toPromise';

import { AclSample } from './service/id/sample';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})


export class AppComponent implements OnInit {
    selectedId: string;
//    userRepos: Repository.UserRepository;
//    reqRepos: Repository.RequestRepository;
    constructor( private af: AngularFire, private http: Http ) { 
//        this.userRepos = new Repository.UserRepository( this.af, '/test' );
//        this.reqRepos = new Repository.RequestRepository( this.af, this.userRepos, '/test' );
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
        //this.testAttribute();
        //this.testExpAttribute();
        let test = new AclSample.Test();
        try {
            test.test();
        } catch( err ) {
            console.log( err );
        }
    }
    
    ngOnInit() {
    }
    characterSelected( id: string ){
        console.log( id );
        this.selectedId = id;
    }
//    
//    testAttribute() {
//        let adminAttr = new Acl.AttributeKey( 'admin' );
//        let mapAccessAttr = new Acl.AttributeKey( 'mapAccess' );
//        
//        let hasAdminCondition = new Acl.Condition( 'admin', ( attr ) => { return ( attr.get( adminAttr ) === true ) } );
//        let hasMapAccessCondition = new Acl.Condition( 'mapAccess', ( attr ) => { return ( attr.get( mapAccessAttr ) === true ) } );
//        
//        let attr = new Acl.Attribute( 'attrs' );
//        attr.set( adminAttr, true );
//        attr.set( mapAccessAttr, false );
//
//        let andCond = new Acl.AndConditionSet( [ hasAdminCondition, hasMapAccessCondition ] );
//        console.log( andCond.test( attr ) );
//        
//
//        let orCond = new Acl.OrConditionSet( [ hasAdminCondition, hasMapAccessCondition ] );
//        console.log( orCond.test( attr ) );
//        console.log(  attr  );
//    }
////    
//    testExpAttribute() {
//        let prototype = new ExpAttr.Attribute( new ExpAttr.AttributeKey( 'root' ) );
//        prototype.addKey( new ExpAttr.AttributeKey( 'hungly' ) );
//        prototype.addKey( new ExpAttr.AttributeKey( 'sleepy' ) );
//        prototype.addKey( new ExpAttr.AttributeKey( 'tired' ) );
//
//        let sub = new ExpAttr.Attribute( new ExpAttr.AttributeKey( 'sub' ) );
//        sub.addKey( new ExpAttr.AttributeKey( 'active' ) );
//        sub.addKey( new ExpAttr.AttributeKey( 'updatedAt' ) );
//        
//        prototype.addChild( sub );
//        
//        console.log( prototype.clone( new ExpAttr.AttributeKey( 'cloned root' ) ));
//
//        prototype.removeAllKey();
//        console.log( prototype );
//    }
}
