export class User {
    constructor(
            public readonly uid: string,
            public disabled: boolean,
            public ceatedAt: number ) {
    }

    isIdentical( uid: string ): boolean;
    isIdentical( user: User ): boolean;
    isIdentical( u: any ): boolean {
        let ret = false;
        if( typeof u === 'User' ) {
            ret = (this.uid === u.uid);
        } else if( typeof u === 'string' ) {
            ret = ( this.uid === u );
        }
        return ret;
    }
}
