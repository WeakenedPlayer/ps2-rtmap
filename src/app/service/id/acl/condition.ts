import { Acl } from '../index';

/* ####################################################################################################################
 * 不正な条件コード
 * ################################################################################################################# */
export class InvalidConditionCode implements Error {
    name: string;
    message: string;
    constructor() {
        this.name = 'Invalid Condition Code.';
        this.message = 'Condition code is invalid.';
    }
}

/* ####################################################################################################################
 * 条件
 * 条件コードと評価式を引数に持つ。
 * test で、与えられた属性セットに対して評価した結果をbooleanで返す。
 * ################################################################################################################# */
export class Condition {
    constructor( public readonly code: string, private expr: ( attr: Acl.Attribute ) => boolean ) {
        if( !code ) {
            throw new InvalidConditionCode;
        }
    }
    test( attr: Acl.Attribute ): boolean {
        return this.expr( attr );
    }
}

/* ####################################################################################################################
 * 条件セット
 * ################################################################################################################# */
export abstract class ConditionSet extends Condition {
    private conditions: Condition[];
    constructor( public readonly code: string, conditions?: Condition[] ) {
        super( code, ( attr: Acl.Attribute ) => { return this.testAll( attr ) } );
        
        if( conditions ) {
            this.conditions = conditions;
        }
    }
    
    private testAll( attr: Acl.Attribute ): boolean {
        this.preCondition();
        for( let condition of this.conditions ) {
            let abort = this.intermediateDecision( condition.test( attr ) );
            if( abort ) {
                break;
            }
        }
        return this.finalDecision();
    }
    // 続行する場合は true を返す。途中で中断するなら false
    protected abstract preCondition(): void;
    
    // 続行する場合は true を返す。途中で中断するなら false
    protected abstract intermediateDecision( result: boolean ): boolean;
    
    // 最終判定
    protected abstract finalDecision(): boolean;
    
    add( cond: Condition ): void {
        this.conditions.push( cond );
    }

    removeAll(): void {
        this.conditions = [];
    }
}

/* ####################################################################################################################
 * AND条件セット
 * ################################################################################################################# */
export class AndConditionSet extends ConditionSet {
    private result: boolean = true;
    constructor( conditions?: Condition[] ) {
        super( 'and', conditions );
    }

    protected preCondition(): void {
        this.result = true;
    }
    
    protected intermediateDecision( result: boolean ): boolean {
        console.log( this.code + ': ' + result );
        this.result = this.result && result;
        return !this.result;        // 一度でも false になったら中断する
    }

    protected finalDecision(): boolean {
        return this.result;
    }
}

/* ####################################################################################################################
 * OR条件セット
 * ################################################################################################################# */
export class OrConditionSet extends ConditionSet {
    private result: boolean = false;
    constructor( conditions?: Condition[] ) {
        super( 'or', conditions );
    }

    protected preCondition(): void {
        this.result = false;
    }
    
    protected intermediateDecision( result: boolean ): boolean {
        // console.log( this.code + ': ' + result );
        this.result = this.result || result;
        return this.result;
    }

    protected finalDecision(): boolean {
        return this.result;
    }
}

/* ####################################################################################################################
 * 条件成立数・不成立数
 * ################################################################################################################# */
export class CountConditionSet extends ConditionSet {
    private trueCount: number = 0;
    private falseCount: number = 0;
    constructor( private decision: ( trueCount, falseCount ) => boolean, conditions?: Condition[] ) {
        super( 'count', conditions );
    }

    protected preCondition(): void {
        this.trueCount = 0;
        this.falseCount = 0;
    }
    
    protected intermediateDecision( result: boolean ): boolean {
        if( result ) {
            this.trueCount = this.trueCount + 1;
        } else {
            this.falseCount = this.falseCount + 1;
        }
        return false;
    }

    protected finalDecision(): boolean {
        return this.decision( this.trueCount, this.falseCount );
    }
}

