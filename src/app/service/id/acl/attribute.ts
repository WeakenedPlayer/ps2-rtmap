/* ####################################################################################################################
 * 不正な属性コード
 * ################################################################################################################# */
export class InvalidAttributeCode implements Error {
    name: string;
    message: string;
    constructor() {
        this.name = 'Invalid Attribute Code.';
        this.message = 'Attribute code is invalid.';
    }
}

/* ####################################################################################################################
 * 属性(attribute)
 * ユーザに与えられる情報。管理者権限があるとか、禁止されたユーザであるとか、何らかの値を持つもの。
 * インスタンスが一つの属性を意味する。
 * ################################################################################################################# */
export class Attribute {
    constructor( public readonly code: string　) {
        if( !code ) {
            // 禁止文字列 / 等もチェックするよう改良する
            throw new InvalidAttributeCode;
        }
    }
}

/* ####################################################################################################################
 * 属性セット
 * 同じ属性を複数持つのは禁止するので、連想配列そのものになる。
 * ################################################################################################################# */
export class AttributeSet {
    attributes: { [ key: string ]: any } = {};
    
    // 属性値を取得する
    get( attr: Attribute ): any {
        return this.attributes[ attr.code ];
    }

    // 属性値を設定する
    set( attr: Attribute, value: any ): void {
        this.attributes[ attr.code ] = value;
    }

    // 属性値をなくす
    remove( attr: Attribute ): void {
        this.attributes[ attr.code ] = null;
    }
    
    removeAll(): void {
        this.attributes = {};
    }
}
