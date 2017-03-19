import { Observable } from 'rxjs';
import * as firebase from 'firebase';

export const TimeStamp = firebase.database.ServerValue.TIMESTAMP;
/* ####################################################################################################################
 * DBからのデータとそれ以外をまとめた、データの復元に必要な情報一式
 * ################################################################################################################# */
export class DbData {
    constructor( public readonly keys: any, public readonly values: any ) {
    }
}

/* ####################################################################################################################
 * DBからのデータとそれ以外をまとめた、データの復元に必要な情報一式
 * ################################################################################################################# */
export interface Mapper<T> {
    get( keys?: any ): Observable<T>;
    remove( keys?: any ): Promise<void>;
}

export interface GroupMapper<T> extends Mapper<T>{
    getAll( keys?: any ): Observable<T[]>;
    removeAll( keys?: any ): Promise<void>;
}
