export class PermissionDeniedError implements Error {
    name: string;
    message: string;
    constructor() {
        this.name = 'Cannot execute operation.';
        this.message = 'Permission denied.';
    }
}
