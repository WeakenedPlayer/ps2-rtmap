/* ####################################################################################################################
 * Path: URLを作るための情報
 * あまり効率の良いコードではないが、頻度と規模が小さいので作りやすさ重視する。
 * ################################################################################################################# */

export class Path {
    private paramIndex: { [key:string]: number } = {};
    
    /* --------------------------------------------------------------------------------------------
     * url(文字列）からPathを作る
     * ----------------------------------------------------------------------------------------- */
    static fromUrl( url: string ) {
        return new Path( url.split( '/' ) );
    }
    /* --------------------------------------------------------------------------------------------
     * 判定
     * ----------------------------------------------------------------------------------------- */
    isAbsolute(): boolean {
        return this.keys[0] === '' ;
    }
    
    /* --------------------------------------------------------------------------------------------
     * 生成・変換
     * ----------------------------------------------------------------------------------------- */
    constructor( private keys: string[] ) {
        this.keys.forEach( ( key, index ) => {
            // パラメータの場合
            if( key[0] === '$' ) {
                let body = key.substring( 1, key.length );
                this.paramIndex[ body ] = index;
            }
        } );
    }

    // 複製
    clone(): Path {
        return new Path( this.keys );
    }

    // 連結
    move( path: Path ): Path {
        if( path.isAbsolute() ) {
            // absolute 
            return path.clone();
        } else {
            let tmp = this.keys.concat( [] );
            
            path.keys.forEach( (key,index) => {
                if( key === '..' ) {
                    tmp.pop();
                } else if( key !== '' ) {
                    tmp.push( key );
                }
            } );
            
            // relative
            return new Path( tmp );
        }
    }

    // 親ディレクトリ
    getParent(): Path {
        let tmp = this.clone();
        let last = tmp.keys.pop();
        
        if( last[0] === '$' ) {
            let body = last.substring( 1, last.length );
            delete tmp.paramIndex[ body ];
        }
        
        return tmp;
    }
    
    /* --------------------------------------------------------------------------------------------
     * url(文字列）に変換
     * ----------------------------------------------------------------------------------------- */
    toUrl( param?: any ): string {
        let result: string = '';
    
        // console.log( param );
        if( this.paramIndex && param ) {
            let tmp = this.keys.concat( [] );

            for( let key in this.paramIndex ) {
                if( param[ key ] ) {
                    tmp[ this.paramIndex[ key ] ] = param[ key ];
                }
            }
            result = tmp.join( '/' );
        } else {
            result = this.keys.join( '/' );
        }
        
        // console.log( result );
        return result;
    } 
    
    /* --------------------------------------------------------------------------------------------
     * イテレータ
     * ----------------------------------------------------------------------------------------- */
    // ディレクトリごと
    forEachDirectory( callback: ( key: string, index: number ) => void ): void {
        this.keys.forEach( ( k, i ) => {
            callback( k, i );
        } );
    }
    
    // パラメータごと
    forEachParam( callback: ( param: string ) => void ): void {
        for( let key of this.keys ) {
            if( key[0] ==='$' ) {
                let body = key.substring( 1, key.length );
                callback( body );
            }
        }
    }
}