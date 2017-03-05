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
    
    getBaseUrl(): string {
        return this.root;
    }
    
    getId( model: ChildClass ): string {
        return model.id;
    }

    decomposeNewModel( model: ChildClass ): any {
        return { n: model.name, t: Timestamp };
    }
    
    decomposeUpdatedModel( model: ChildClass ): any {
        return { n: model.name };
    }
    
    composeModel( dbmodel: any ): ChildClass {
        return new ChildClass( dbmodel.$key, dbmodel.n, dbmodel.t );
    }
}

/*
export class ParentDb extends AbstractJoinMapper<ParentClass> {
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
        return { n: model.name, eid: model.childA.id, fid: model.childB.id, gid: model.childB.id };
    }
    decomposeUpdatedModel( model: ParentClass ): any {
        return { n: model.name, eid: model.childA.id, fid: model.childB.id, gid: model.childB.id };
    }
    
    composeModel( dbmodel: any ): Observable<ParentClass> {
        return this.getChildren( dbmodel ).map( children => {
            return new ParentClass( dbmodel.$key, dbmodel.n, children['eid'], children['fid'], children['gid']);            
        } );
    }
}*/

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
//    parentDb: ParentDb;
    rawDb: RawDb;
    public createdChildren: string[] = [];
    constructor( private af: AngularFire ) {
        this.childDb = new ChildDb( af, '/mapper/test/children' );
        this.rawDb = new RawDb( af, '/mapper/test/raw' );
       //this.parentDb = new ParentDb( af, '/mapper/test/parent', this.childDb );
        
        
    }
    test1() {
        this.childDb.push( new ChildClass( 'a', 'hello' ) ).then( key => {
            this.createdChildren.push( key );
        } );
    }
    test2(){
        console.time( 'raw' );
        this.rawDb.push( { a: '1', b: '2' } ).then( key => {
            console.timeEnd( 'raw' );
            this.rawDb.getAll().take(1).subscribe( result => console.log( result ) );
        } );
    }
    test3(){
        console.time( 'class' );
        this.childDb.get( this.createdChildren[0] ).subscribe( result => {
            console.timeEnd( 'class' );
        } );
    }
}













