import * as Acl from './index';

/* ####################################################################################################################
 * 操作(operation)の実行に必要な権限や条件をまとめた要求(requirement)のインターフェース
 * 実行者(executor)に依存し、実行者が要求を満足するかを確認する isFulfilledBy を提供する
 * ################################################################################################################# */
export abstract class Requirement {
    abstract isFulfilledBy( executer: Acl.Executer ): boolean;
}
