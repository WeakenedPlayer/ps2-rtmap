// angular
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Headers, Http } from '@angular/http';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import { FormGroup, FormControl } from '@angular/forms';

// angularfire
import { AngularFire, AngularFireAuth } from 'angularfire2';

// rx
import { Observable, Subscription } from 'rxjs';

// other imports
import { Census, Identification } from '../../service';
import * as VM from './view-model';

@Component({
  selector: 'app-test-handshake',
  templateUrl: './test-handshake.component.html',
  styleUrls: ['./test-handshake.component.scss']
})
export class TestHandshakeComponent implements OnInit, OnDestroy {
    vm: VM.ViewModel;

    // binding
    page: number = 0;
    requestList: Identification.Request[] = [];
    profileList: { [key:string]: Census.CharacterProfile } = {};

    // subscription
    subscription = new Subscription();

    constructor(
            private af: AngularFire,
            private census: Census.Service,
            private ids: Identification.Service,
            private route: ActivatedRoute,
            private router: Router,
            private location: Location ) {
    }

    ngOnInit() {
    }
    
    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
