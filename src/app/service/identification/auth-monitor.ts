import { AngularFire , FirebaseObjectObservable, FirebaseListObservable, AngularFireAuth, FirebaseRef } from 'angularfire2';
import * as firebase from 'firebase';       // required for timestamp
import { Subscription, Observable, Subject,  } from 'rxjs';
import * as UserIdentification from './common'; 
import * as Session from './session'; 
import { Injectable, OnDestroy } from '@angular/core';


// auth の状態を監視し、最新値を保持する
// auth の状態変化をモニタ可能にする Observable
@Injectable()
export class AuthMonitor implements OnDestroy {
    subject: Subject<any>;
    private authSubscription: Subscription;

    constructor( private af: AngularFire ) {
        this.subject = new Subject<any>();
        this.authSubscription = this.af.auth.subscribe( this.subject );
    }
    
    
    
    ngOnDestroy() {
        this.authSubscription.unsubscribe();
    }
}