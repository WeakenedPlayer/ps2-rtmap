import * as firebase from 'firebase';

/* ####################################################################################################################
 * タイムスタンプ
 * この値をFirebaseに格納すると、自動でUniqueなタイムスタンプが作られる。
 * ################################################################################################################# */
export const Timestamp = firebase.database.ServerValue.TIMESTAMP;

/* ####################################################################################################################
 * エラー
 * ################################################################################################################# */
export class NoIdError implements Error {
    name: string;
    message: string;
    constructor() {
        this.name = 'No ID error';
        this.message = 'ID is not specified.';
    }
}



export class UidEmptyError implements Error {
    name: string;
    message: string;
    constructor() {
        this.name = 'Empty UID Error';
        this.message = 'provided uid is null';
    }
}

export class UnknownError implements Error {
    name: string;
    message: string;
    constructor() {
        this.name = 'UserRepository unknown error';
        this.message = 'something is wrong';
    }
}

export class NotFoundError implements Error {
    name: string;
    message: string;
    constructor() {
        this.name = 'Data not found';
        this.message = 'Data not found';
    }
}
