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
    getDb( keys?: any ): Observable<T>;
}

export interface GroupMapper<T> extends Mapper<T>{
    getAllDb( keys?: any ): Observable<T[]>;
}
