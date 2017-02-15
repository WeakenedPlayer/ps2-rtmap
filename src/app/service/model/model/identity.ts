import * as Model from './index';

export class UserIdentity {
    constructor(
        private readonly subject: Model.User,
        private readonly character: Model.Character,
        private readonly identifiedBy: Model.User,
        private readonly identifiedAt?: number ) {}
}
