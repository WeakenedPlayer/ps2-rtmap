import { Census, Identification, Comm, DB } from '../../service';
import { AngularFire, AngularFireAuth } from 'angularfire2';
import { Observable, Subscription } from 'rxjs';

/* ####################################################################################################################
 * 
 * ################################################################################################################# */
const maxBuffer = 3;
const reqPerPage = 2;

class MyHandShake extends Comm.Handshake<string,string> {
    constructor( af: AngularFire, rid: string, cid: string ) {
        super( af, new DB.Path( [ 'refactor', 'handshake', rid, cid, 'stage1' ] ) );
    }
    
    protected decide( snapshot: Comm.HandshakeSnapshot<string,string> ): boolean {
        // 送信と受信が同じならOK
        console.log( snapshot );
        return snapshot.reception.message === snapshot.client.message;
    }
}

export class ViewModel {
    // Censusで検索する情報
    requestList: Observable<Identification.Request[]>;
    profileMapObservable: Observable<{ [key:string]: Census.CharacterProfile }>;
    worldList: Observable<Census.World[]>;

    constructor( private af: AngularFire,
                 private census: Census.Service,
                 private ids: Identification.Service,
                 private pageObservable: Observable<number> ){
        
        let comm: MyHandShake;
        this.ids.authStateObservable.take(1).toPromise().then( authState => {
            comm = new MyHandShake( this.af, authState.uid, 'sPOD5jUfXfO7k4DdwNFLoq0MpKu2' );
            console.log( 'initiate' );
            return comm.initiate( 'hi', true );
        } )
            .then( () => {
            return comm.respond( 'aaa' );
        } )
        .then( () => {
            return comm.terminate();
        } )
        .then( (result) => {
            console.log( result );
            return comm.respond( 'hi' );
        } ).then( () => {
            return comm.terminate();
        } )
        .then( (result) => {
            console.log( result );
            console.log( 'retry' );
            return comm.undoTerminate();
        } )
        .then( () => {
            return comm.respond( 'hi' );
        } )
        .then( () => {
            return comm.terminate();
        } )
        .then( (result) => {
            console.log( result );
        } )
        .catch( ()=>{ console.log('failed') });
        
        /*
        .then( a => {
            return comm.respond( '8PGAlqf37mU1jwzQ7t9UNllm73t1' );
        } )
        .then( () => {
            if( sub === null ) {
                sub.unsubscribe();
            }
            return comm.getResponse().then( resp => sub = resp.subscribe( a => console.log(a)));
        } ).then( result => {
            console.log( result );
        } );
        .then( a => {
            return comm.respond( '8PGAlqf37mU1jwzQ7t9UNllm73t1' );
        } )
        .then( () => {
            if( sub === null ) {
                sub.unsubscribe();
            }
            return comm.getResponse().then( resp => sub = resp.subscribe( a => console.log(a)));
        } ).then( result => {
            console.log( result );
        } );
        this.requestList = this.ids.reqRepos.getAll().publishReplay(1).refCount();
        
        this.profileMapObservable = this.requestList.flatMap( requests => {
            let profileMap: { [key:string]: Census.CharacterProfile } = {};
            let loadedPage: { [key:number]: boolean } = {};
            let uniqueCids: { [key:string]: boolean } = {};
            // 増える問題がある
            return this.pageObservable.filter( ( page: number ) => !loadedPage[ page ] ).flatMap( page => {
                loadedPage[ page ] = true;
                return this.requestList.map( requests => {
                    let offset = Math.floor( ( page * reqPerPage ) / maxBuffer ) * maxBuffer;
                    let count = Math.min( maxBuffer, requests.length - offset );
                    let cids: string[] = [];
                    for( let i = 0; i < count; i++ ) {
                        let tmp: string = requests[ i + offset ].cid;
                        if( !uniqueCids[ tmp ] ) {
                            cids.push( tmp );
                            uniqueCids[ tmp ] = true;
                        } else {
                            console.log( tmp + ' is already loaded' );
                        }
                    }
                    return cids;
                } );
            } )
            .filter( cids => cids.length > 0 )
            .flatMap( cids => this.census.getCharacterProfiles( cids ) )
            .filter( profiles => !!profiles )
            .map( profiles => {
                for( let profile of profiles ) {
                    profileMap[ profile.character_id ] = profile;
                }
                return profileMap;
            } );
        } );
        */
    }
}