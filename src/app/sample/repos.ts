import { Identification, DB } from '../service';
import { AngularFire  } from 'angularfire2';

export class Test {
    userRepo: Identification.UserRepos;
    constructor( af: AngularFire ) {
        this.userRepo = new Identification.UserRepos( af, '/id/' );
    }
    
    addUser( user: Identification.User ) {
        this.userRepo.set( user );
    }
    
    getUser( id: string ) {
        this.userRepo.get( { id: id } ).subscribe( user => console.log( user ) );
    }
}