import * as ServiceId from './service-id';
import * as Common from './common';

export class UrlProvider implements Common.IBaseUrlProvider {
    static readonly Base = 'https://census.daybreakgames.com/s:' + ServiceId.CENSUS_SERVICE_ID + '/get/ps2:v2/';

    base(): string {
        return UrlProvider.Base;
    }
}
