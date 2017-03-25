
export class State {
    constructor( public readonly result: boolean = false,
                 public readonly blocked: boolean = false,
                 public readonly finalized: boolean = false) {}
}


export class HandShakeData<TX,RX> {
    constructor( public readonly tx?: Message<TX>, 
                 public readonly rx?: Message<RX>,
                 public readonly state?: State ) {
        console.log( tx ) ;
    }
}

export class Message<T> {
    constructor( public readonly id: string,
                 public readonly t: number,
                 public readonly msg: T ) {}    
}

export class Path {
    path: string[];
    constructor( path: string ) {
        let tmp = path.split( '/' );
        for( let key in tmp ) {
            if( key ) {
                this.path.push( key );
            }
        }
    }
}