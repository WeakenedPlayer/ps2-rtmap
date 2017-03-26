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
  selector: 'app-request-list',
  templateUrl: './request-list.component.html',
  styleUrls: ['./request-list.component.scss']
})
export class RequestListComponent implements OnInit, OnDestroy {
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
        let pageObservable = this.route.params.map( ( params: Params ) =>  params['page'] );
        this.vm = new VM.ViewModel( this.af, this.census, this.ids, pageObservable );
        this.subscription.add( this.vm.requestList.subscribe( requests => {
            this.requestList = requests;
            console.log( requests);
        } ) );
    }
    
    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
    
    requestToUid( req: Identification.Request ) {
        return req.uid;
    }
}
