import * as Model from './index';

export abstract class Permission {
    protected abstract requiredPermissions(): Permission[];
    public abstract isGranted(): boolean;
    public abstract grant(): void;
}
