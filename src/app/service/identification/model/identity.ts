import { Identification } from '../../index';

export class UserIdentity {
    constructor(
        private readonly subject: Identification.User,
        private readonly character: Identification.Character,
        private readonly identifiedBy: Identification.User,
        private readonly identifiedAt?: number ) {}
}
