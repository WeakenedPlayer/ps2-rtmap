import * as Common from './common';

// 見直し(Service Id 変更に対応すること)
export class UrlProvider implements Common.IBaseUrlProvider {
    private static readonly base = 'https://census.daybreakgames.com/s:';
    private static readonly api = '/ps2:v2/';

    private getUrl: string = '';
    private countUrl: string = '';
    
    constructor( serviceId: string ){
        this.getUrl = UrlProvider.base + serviceId + '/get' + UrlProvider.api;
        this.countUrl = UrlProvider.base + serviceId + '/count' + UrlProvider.api;
    }
    
    get(): string {
        return this.getUrl;
    }
    
    count(): string {
        return this.countUrl;
    }
}
