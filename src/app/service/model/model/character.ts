import * as Model from './index';

// Value object
export class Character {
    constructor(
        public readonly cid: string,
        public readonly name: string,
        public readonly worldId: number,
        public readonly factionId: number,
        public readonly updatedAt: number){}   // census api time

    isIdentical( cid: string ): boolean;
    isIdentical( character: Character ): boolean;
    isIdentical( c: any ): boolean {
        let ret = false;
        if( typeof c === 'Character' ) {
            ret = (this.cid === c.cid);
        } else if( typeof c === 'string' ) {
            ret = ( this.cid === c );
        }
        return ret;
    }
}
