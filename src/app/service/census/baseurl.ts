import * as ServiceId from './service-id';
import * as Common from './common';

export class UrlProvider implements Common.IBaseUrlProvider {
    private static readonly base = 'https://census.daybreakgames.com/s:' + ServiceId.CENSUS_SERVICE_ID;
    private static readonly api = '/ps2:v2/';
    private static readonly urlGet = UrlProvider.base + '/get' + UrlProvider.api;
    private static readonly urlCount = UrlProvider.base + '/count' + UrlProvider.api;
        
    get(): string {
        return UrlProvider.urlGet;
    }
    
    count(): string {
        return UrlProvider.urlCount;
    }
}
