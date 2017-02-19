/* ####################################################################################################################
 * 不正な属性キー
 * ################################################################################################################# */
export class InvalidAttributeKey implements Error {
    name: string;
    message: string;
    constructor() {
        this.name = 'Invalid Attribute Key.';
        this.message = 'Attribute Key is invalid.';
    }
}

/* ####################################################################################################################
 * 属性キー
 * ################################################################################################################# */
export class AttributeKey {
    constructor( public readonly key: string　) {
        if( !key ) {
            // 禁止文字列 / 等もチェックするよう改良する。string のサブセットなので
            throw new InvalidAttributeKey;
        }
    }
}

/* ####################################################################################################################
 * 属性
 * ################################################################################################################# */
export class Attribute {
    private attrKey;
    constructor( attrKey: AttributeKey | string ) {
        if( typeof attrKey === typeof AttributeKey ) {
            this.attrKey = attrKey;
        } else {
            this.attrKey = new AttributeKey( attrKey as string );
        }
    }
    values: { [ key: string ]: any } = {};
    // キーを追加する (値は未設定、構造だけの変更)
    addKey( attrKey: AttributeKey ) {
        this.values[ attrKey.key ] = undefined;
    }
    
    // キーを削除する
    removeKey( attrKey: AttributeKey ): void {
        this.values[ attrKey.key ] = null;
    }

    // 全てのキーを削除する
    removeAllKey(): void {
        this.values = {};
    }
    
    // 属性値を取得する( キーがなくても値は返す )
    get( attrKey: AttributeKey ): number | string | boolean {
        return this.values[ attrKey.key ];
    }

    // 属性値を取得する( キーがなかったら追加する )
    set( attrKey: AttributeKey, value: number | string | boolean ): void {
        this.values[ attrKey.key ] = value;
    }

    // 子属性を追加する
    addChild( attr: Attribute ): void {
        // 属性のまま参照を渡す(値渡しはしない)
        this.values[ attr.attrKey.key ] = attr;
    }
    
    // 子属性を削除する
    removeChild( attr: Attribute ): void {
        // 属性のまま参照を渡す(値渡しはしない)
        this.values[ attr.attrKey.key ] = null;
    }
    
    clone( newKey?: AttributeKey ): Attribute {
        let newAttr: Attribute;
        if( newKey ) {
            newAttr = new Attribute( newKey );
        } else {
            newAttr = new Attribute( this.attrKey );
        }
        
        for( let key in this.values ) {
            if( typeof this.values[ key ] === typeof Attribute ) {
                newAttr.values[ key ] = this.values[ key ].clone();
            } else {
                newAttr.values[ key ] = this.values[ key ];
            }
        }
        
        return newAttr;
    }
}
