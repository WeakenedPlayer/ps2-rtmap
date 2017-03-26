

export class HandshakeSnapshot<RECEPTION,CLIENT> {
    constructor( public readonly reception?: Message<RECEPTION>, 
                 public readonly client?: Message<CLIENT> ) {
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