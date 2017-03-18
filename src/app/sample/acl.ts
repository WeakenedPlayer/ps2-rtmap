import { Acl, Identification } from '../service/index';

class UserRequirement extends Acl.Requirement {
    constructor( private user1: Identification.User, private user2: Identification.User ) {
        super();
    }
    param( user1: Identification.User, user2: Identification.User ) {
        this.user1 = user1;
        this.user2 = user2;
    }
    isFulfilled(): boolean {
        return ( this.user1.disabled === false ) && ( this.user2.disabled === false );
    }
}

export class Test {
    
    constructor(){
        
    }
    
    test(){
        let userA = new Identification.User( 'uid1', true, 1 );
        let userB = new Identification.User( 'uid2', false, 2 );
        let req = new UserRequirement( userA, userB );
        let someOperation = new Acl.AnonymousOperation( () => {
            console.log( 'operation' );
        } );

        someOperation.requires( req );
        someOperation.execute();
    }
}