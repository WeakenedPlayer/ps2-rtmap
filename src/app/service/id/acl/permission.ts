import * as Acl from './index';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/count';

//許可(定数みたいなもの)
export class Permission {
 constructor( 
     public readonly code: string
 ) {}
 
 equals( permission: Permission ): boolean {
     return ( this.code === permission.code );
 }
}

