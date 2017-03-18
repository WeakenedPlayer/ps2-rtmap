import { Acl, User } from '../service/index';

class UserRequirement extends Acl.Requirement {
    constructor( private user1: User, private user2: User ) {
        super();
    }
    param( user1: User, user2: User ) {
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
        let userA = new User( 'uid1', true, 1 );
        let userB = new User( 'uid2', false, 2 );
        let req = new UserRequirement( userA, userB );
        let someOperation = new Acl.AnonymousOperation( () => {
            console.log( 'operation' );
        } );

        someOperation.requires( req );
        someOperation.execute();
    }
}