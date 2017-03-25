
 export class OldState {
    constructor( public readonly result: boolean = false,
                 public readonly blocked: boolean = false,
                 public readonly finalized: boolean = false) {}
}


export class HandshakeSnapshot<RECEPTION,CLIENT> {
    constructor( public readonly reception?: Message<RECEPTION>, 
                 public readonly client?: Message<CLIENT> ) {
    }
}


export class HandShakeData<TX,RX> {
    constructor( public readonly tx?: Message<TX>, 
                 public readonly rx?: Message<RX>) {
    }
}

export class Message<T> {
    constructor( public readonly timestamp: number,
                 public readonly message: T ) {}    
}


export function wait( timeout: number ) {
    return new Promise<void>( (resolve) => {
        setTimeout( ()=>{ resolve() }, timeout );
    } ); 
}