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

export class State {
    constructor( public readonly result: boolean,
                 public readonly blocked: boolean,
                 public readonly finalized: boolean ) {}
}
