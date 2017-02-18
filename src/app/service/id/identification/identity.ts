import { User, Identification } from '../index';

export class UserIdentity {
    constructor(
        private readonly subject: User,
        private readonly character: Identification.Character,
        private readonly identifiedBy: User,
        private readonly identifiedAt?: number ) {}
}
