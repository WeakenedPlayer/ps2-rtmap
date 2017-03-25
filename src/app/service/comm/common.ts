
 export class State {
    constructor( public readonly result: boolean = false,
                 public readonly blocked: boolean = false,
                 public readonly finalized: boolean = false) {}
}


export class HandshakeSnapeshot<RECEPTION,CLIENT> {
    constructor( public readonly rm?: Message<RECEPTION>, 
                 public readonly cm?: Message<CLIENT> ) {
    }
}


export class HandShakeData<TX,RX> {
    constructor( public readonly tx?: Message<TX>, 
                 public readonly rx?: Message<RX>,
                 public readonly state?: State ) {
    }
}

export class Message<T> {
    constructor( public readonly t: number,
                 public readonly msg: T ) {}    
}
