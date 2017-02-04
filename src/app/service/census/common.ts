import { Observable } from 'rxjs';
import { Headers, Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';

// Census APIとのやり取りの共通部分を担う基底クラス
export abstract class QueryBase<ParameterT,ResponseT,ResultT> {
    http: Http;
    baseProvider: IBaseUrlProvider;
    protected abstract queryUrl( param: ParameterT ): string;
    protected abstract extract( response: ResponseT ): ResultT;
    
    constructor( http: Http, baseProvider: IBaseUrlProvider ) {
        this.http = http;
        this.baseProvider = baseProvider;
    }

    query( param: ParameterT ): Promise<ResultT> {
        return this.http.get( this.baseProvider.base() + this.queryUrl( param ) )
            .toPromise()
            .then( jsonResponse => {
                // JSON -> Object -> ResponseTにCast
                let objectResponse = jsonResponse.json();
                let response = ( objectResponse as ResponseT );

                // console.log( response );
                return new Promise<ResultT>( ( resolve, reject ) => {
                    // 何らかの理由でエラーなら result === undefined になっている
                    if( response ){
                        // 正常応答時の処理
                        let result = this.extract( response );
                        resolve( result );
                    } else {
                        // 異常応答時の処理
                        reject( objectResponse );
                    }
                } );
        });
    }
}

export interface IBaseUrlProvider {
    base(): string;
}

export class JoinQuery {
    typeOfCollectionToJoin: string;
    on?: string = null;
    to?: string = null;
    list?: boolean = null;
    show?: string[] = null;
    hide?: string[] = null;
    inject_at?: string = null;
    terms?: string;
    outer?: boolean = true;
    
    constructor( typeOfCollectionToJoin: string ){
        this.typeOfCollectionToJoin = typeOfCollectionToJoin;
    }
    toString(){
        let query = 'c:join=' + this.typeOfCollectionToJoin 
                  +            ( this.on        ? '^on:'        + this.on              : '' )
                  +            ( this.to        ? '^to:'        + this.to              : '' )
                  + '^list:' + ( this.list      ? '1'                                  : '0')
                  +            ( this.show      ? '^show:'      + this.show.join('\'') : '' )
                  +            ( this.hide      ? '^hide:'      + this.hide.join('\'') : '' )
                  +            ( this.inject_at ? '^inject_at:' + this.inject_at       : '' )
                  +            ( this.terms     ? '^terms:'     + this.terms           : '' )
                  + '^outer:' + ( this.outer     ? '1'                                  : '0');
        return query;
    }
}