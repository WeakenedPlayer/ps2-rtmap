/* ####################################################################################################################
 * 要求
 * ################################################################################################################# */
export abstract class Requirement {
    abstract isFulfilled( logger?: FulfillmentLogger ): boolean;
}

// TBD
export class FulfillmentLogger {
}

/* ####################################################################################################################
 * 条件セット
 * ################################################################################################################# */
export abstract class RequirementSet implements Requirement {
    private requirements: Requirement[];
    constructor( requirements?: Requirement[] ) {
        if( requirements ) {
            this.requirements = requirements;
        }
    }
    isFulfilled(): boolean {
        return this.testAll();
    }
    
    private testAll(): boolean {
        this.preCondition();
        for( let requirement of this.requirements ) {
            let abort = this.intermediateDecision( requirement.isFulfilled() );
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
    
    add( requirement: Requirement ): void {
        this.requirements.push( requirement );
    }

    removeAll(): void {
        this.requirements = [];
    }
}

/* ####################################################################################################################
 * AND条件セット
 * ################################################################################################################# */
export class AndRequirementSet extends RequirementSet {
    private result: boolean = true;
    constructor( requirements?: Requirement[] ) {
        super( requirements );
    }

    protected preCondition(): void {
        this.result = true;
    }
    
    protected intermediateDecision( result: boolean ): boolean {
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
export class OrRequirementSet extends RequirementSet {
    private result: boolean = false;
    constructor( requirements?: Requirement[] ) {
        super( requirements );
    }

    protected preCondition(): void {
        this.result = false;
    }
    
    protected intermediateDecision( result: boolean ): boolean {
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
export class CountRequirementSet extends RequirementSet {
    private trueCount: number = 0;
    private falseCount: number = 0;
    constructor( private decision: ( trueCount, falseCount ) => boolean, requirements?: Requirement[] ) {
        super( requirements );
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
