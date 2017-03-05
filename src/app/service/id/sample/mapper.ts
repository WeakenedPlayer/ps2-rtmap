// rxjs
import { Observable, Subscriber, Subscription } from 'rxjs';
import 'rxjs/add/operator/mergeAll';
import 'rxjs/add/operator/toPromise';

// firebase
import { AngularFire , FirebaseObjectObservable, FirebaseListObservable, AngularFireAuth, FirebaseRef } from 'angularfire2';
import * as firebase from 'firebase';       // required for timestamp


import { AbstractJoinMapper, AbstractClassMapper, AbstractMapper, Timestamp, AbstractRawMapper } from '../repos';

export class ChildClass {
    constructor( public readonly id: string,
                 public readonly name: string,
                 public readonly createdAt?: string ){}
}

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
     static createServerData( isNew: boolean, name: string, eid: string, fid: string, gid: string ) {
         let tmp = {
                 n: name,
                 eid: eid,
                 fid: fid,
                 gid: gid,
                 if( isNew ){ return { t: Timestamp } }
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
        return super.setRaw( model.id, ParentDb.createServerData( true,
                                                                  model.name,
                                                                  model.childA.id,
                                                                  model.childB.id,
                                                                  model.childB.id ) );
    }
    decomposeUpdatedModel( model: ParentClass ): any {
        return super.setRaw( model.id, ParentDb.createServerData( false,
                                                                  model.name,
                                                                  model.childA.id,
                                                                  model.childB.id,
                                                                  model.childB.id ) );
    }

    setByRaw( id: string, name: string, eid: string, fid: string, gid: string ): Promise<void> {
        return super.setRaw( id, ParentDb.createServerData( true, name, eid, fid, gid ) );
    }
    
    updateByRaw( id: string, name: string, eid: string, fid: string, gid: string ): Promise<void> {
        return super.updateRaw( id, ParentDb.createServerData( true, name, eid, fid, gid ) );
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

export class Sample {
    childDb: ChildDb;
    parentDb: ParentDb;
    rawDb: RawDb;
    public createdChildren: string[] = [];
    constructor( private af: AngularFire ) {
        this.childDb = new ChildDb( af, '/mapper/test/children/' );
        this.rawDb = new RawDb( af, '/mapper/test/raw/' );
        this.parentDb = new ParentDb( af, '/mapper/test/parent/', this.childDb );
        
        
    }
    test1() {
        this.createChildren();
    }
    test2(){
        this.createParent( 'abcd' );
    }
    test3(){
        console.time( 'class' );
        this.childDb.get( this.createdChildren[0] ).subscribe( result => {
            console.timeEnd( 'class' );
        } );
    }
    createChildren(){
        this.childDb.set( new ChildClass( 'abc', 'hello abc' ) );
        this.childDb.set( new ChildClass( 'def', 'hello def' ) );
        this.childDb.set( new ChildClass( 'ghi', 'hello ghi' ) );
    }

    createParent( id: string ) {
        console.time( 'class' );
        this.parentDb.createByRaw( 'parentTest', 'hi', 'abc', 'ghi', 'def' ).then(
                result => console.log( result ));
    }

    updateParent( id: string ) {
        console.time( 'class' );
        this.parentDb.updateByRaw( 'parentTest', 'hi', 'abc', 'ghi', 'def' ).then(
                result => console.log( result ));
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
}













