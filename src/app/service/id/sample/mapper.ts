// rxjs
import { Observable, Subscriber, Subscription } from 'rxjs';
import 'rxjs/add/operator/mergeAll';
import 'rxjs/add/operator/toPromise';

// firebase
import { AngularFire , FirebaseObjectObservable, FirebaseListObservable, AngularFireAuth, FirebaseRef } from 'angularfire2';
import * as firebase from 'firebase';       // required for timestamp

import {  AbstractClassMapper, Timestamp, AbstractKeyValue } from '../repos';


export class ChildClass {
    constructor( public readonly id: string,
                 public readonly name: string,
                 public readonly createdAt?: string ){}
}


class ChildKeyValue extends AbstractKeyValue<ChildClass> {
    protected object2Key( model: ChildClass ): any {
        return [ model.id ];
    }

    protected object2DbValue( model: ChildClass, isNewObj: boolean, opt?: any ): any {
        if( isNewObj ){
            return { n: model.name, t: Timestamp };            
        } else {
            return { n: model.name };
        }
    }
    
    protected dbKeyValue2Object( keys: string[], value: any ): ChildClass {
        return new ChildClass( keys[0], value.n, value.t );
    }
    
    setKeyById( id: string ) {
        if( id ) {      
            this.setKeys( [ id ] );
        } else {
            console.log( 'err' );
        }        
    }
}

export class ChildDb extends AbstractClassMapper<ChildClass> {
    constructor( af: AngularFire, root: string ) { super( af, root ); }
    
    getById( id: string ) {
        let keyValue = new ChildKeyValue();
        keyValue.setKeyById( id );
        return this.get( keyValue );
    }

    setChild( child: ChildClass ) {
        let keyValue = new ChildKeyValue( child, true );
        super.set( keyValue );
    }
    updateChild( child: ChildClass ) {
        let keyValue = new ChildKeyValue( child, false );
        super.update( keyValue );
    }
}



export class Sample {
    childDb: ChildDb;
    public createdChildren: string[] = [];
    constructor( private af: AngularFire ) {
        this.childDb = new ChildDb( af, '/mapper/test/children/' );
    }
    test1(){
        console.time('child');
        this.childDb.getById( 'abc' ).subscribe( result => {
            console.timeEnd( 'child' );
            console.log( result );
        } );
    }
    test2(){
        this.childDb.setChild( new ChildClass( 'xxx', 'hi' ) );
    }
    test3(){
        this.childDb.updateChild( new ChildClass( 'xxx', 'hi' ) );
        }
}
/*
import { AbstractJoinMapper, AbstractClassMapper, AbstractMapper, Timestamp, AbstractRawMapper } from '../repos';


export class ParentClass {
    constructor( public readonly id: string,
                 public readonly name: string,
                 public childA: ChildClass,
                 public childB: ChildClass,
                 public childC: ChildClass ){}    
}

export class InfoClass {
    constructor( public readonly id: string, public info: string ){}
}

export class ChildDb extends AbstractClassMapper<ChildClass> {
    constructor( af: AngularFire, private root: string ) {
        super( af );
    }
    
    protected getBaseUrl(): string {
        return this.root;
    }
    
    protected getId( model: ChildClass ): string {
        return model.id;
    }

    protected decomposeNewModel( model: ChildClass ): any {
        return { n: model.name, t: Timestamp };
    }
    
    protected decomposeUpdatedModel( model: ChildClass ): any {
        return { n: model.name };
    }
    
    protected composeModel( dbmodel: any ): ChildClass {
        return new ChildClass( dbmodel.$key, dbmodel.n, dbmodel.t );
    }
}

export class ParentDb extends AbstractJoinMapper<ParentClass> {
    static createServerData( name: string, eid: string, fid: string, gid: string ) {
        let tmp = {
                n: name,
                eid: eid,
                fid: fid,
                gid: gid,
                t: Timestamp
            };
        return tmp
   }
    static updateServerData( name: string, eid: string, fid: string, gid: string ) {
        let tmp = {
                n: name,
                eid: eid,
                fid: fid,
                gid: gid
            };
        return tmp
   }

    constructor( af: AngularFire, private root: string, private childDb: ChildDb ) {
        super( af );        
        this.has( 'eid', childDb );
        this.has( 'fid', childDb );
        this.has( 'gid', childDb );
    }

    getBaseUrl(): string {
        return this.root;
    }
    
    getId( model: ParentClass ): string {
        return model.id;
    }

    decomposeNewModel( model: ParentClass ): any {
        return super.setRaw( model.id, ParentDb.createServerData( model.name,
                                                                  model.childA.id,
                                                                  model.childB.id,
                                                                  model.childB.id ) );
    }
    decomposeUpdatedModel( model: ParentClass ): any {
        return super.updateRaw( model.id, ParentDb.updateServerData( model.name,
                                                                     model.childA.id,
                                                                     model.childB.id,
                                                                     model.childB.id ) );
    }

    setByRaw( id: string, name: string, eid: string, fid: string, gid: string ): Promise<void> {
        return super.setRaw( id, ParentDb.createServerData( name, eid, fid, gid ) );
    }
    
    updateByRaw( id: string, name: string, eid: string, fid: string, gid: string ): Promise<void> {
        return super.updateRaw( id, ParentDb.updateServerData( name, eid, fid, gid ) );
    }
    
    composeModel( datum: any ): ParentClass{
        return new ParentClass( datum.raw.$key,
                                datum.raw.n,
                                datum.children['eid'],
                                datum.children['fid'],
                                datum.children['gid']);            
    }
}

export class RawDb extends AbstractRawMapper {
    constructor( af: AngularFire, private root: string ) {
        super( af );
    }
    
    getBaseUrl(): string {
        return this.root;
    }
    
    getId( model: ChildClass ): string {
        return model.id;
    }
}

export class PathValue<T> {
    constructor( public readonly path: string[], public readonly value: T ){}
}



export class Sample {
    childDb: ChildDb;
    parentDb: ParentDb;
    rawDb: RawDb;
    rawDb2: RawDb2;
    public createdChildren: string[] = [];
    constructor( private af: AngularFire ) {
        this.childDb = new ChildDb( af, '/mapper/test/children/' );
        this.rawDb = new RawDb( af, '/mapper/test/children/' );
        this.parentDb = new ParentDb( af, '/mapper/test/parent/', this.childDb );
        this.rawDb2 = new RawDb2( af );
        
        
    }
    
    test1() {
        let a = { a: 10, b: 20, c: 30 };
        let b = a;
        b.a = 200;

        console.log( a );
        console.log( b );
        /*
        let path = new ObjPath( '/abc/cde' );
        let obj = { id: 'objId', aaa: 'hello', bbb: 'world' };
        this.rawDb2.pushRaw( path, obj );
    }
    
    test2(){
        let a = { a:'1', b:'2', c:'x'};
        let x = ( { a: '1' } as typeof a );
        x.b = 's';
        console.log( x );
    }
    test3(){
        this.getRaw();
    }
    createChildren(){
        this.childDb.set( new ChildClass( 'abc', 'hello abc' ) );
        this.childDb.set( new ChildClass( 'def', 'hello def' ) );
        this.childDb.set( new ChildClass( 'ghi', 'hello ghi' ) );
    }

    createParent( id: string ) {
        console.time( 'class' );
        this.parentDb.setByRaw( 'parentTest', 'hi', 'abc', 'ghi', 'def' );
    }

    updateParent( id: string ) {
        console.time( 'class' );
        this.parentDb.updateByRaw( 'parentTest', 'hi', 'abc', 'ghi', 'def' );
    }
    
    getParent( id: string ) {
        this.parentDb.get( id ).subscribe( result => {
            console.timeEnd( 'class' );
            console.log( result );
        } );
    }
    createRaw() {
        console.time( 'raw' );
        this.rawDb.pushRaw( { a: '1', b: '2' } ).then( key => {
            console.timeEnd( 'raw' );
            this.rawDb.getAllRaw().take(1).subscribe( result => console.log( result ) );
        } );
    }
    getRaw() {
        this.rawDb.getRaw( 'abc' ).subscribe( result => console.log( result) );
    }
}*/

