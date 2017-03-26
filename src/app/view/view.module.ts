import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { CharacterSearchComponent } from './character-search/character-search.component';
import { CharacterProfileComponent } from './character-profile/character-profile.component';
import { LandingComponent } from './landing/landing.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { RequestListComponent } from './request-list/request-list.component';
import { TestHandshakeComponent } from './test-handshake/test-handshake.component';

// このモジュールは、Routerで各ビューをつなぐ役割をになう
// より複雑になってきたら、forRootを外部に持ち、ここではforChildだけつくることにする。
// Refactor routes to a routing module: https://angular.io/docs/ts/latest/tutorial/toh-pt5.html

// 画面再読み込みで404エラーが起こるのを防ぐ
// http://stackoverflow.com/questions/35284988/angular-2-404-error-occur-when-i-refresh-through-browser

const routes: Routes = [
                        { path: 'landing',  component: LandingComponent },
                        { path: 'request/list/:page',  component: RequestListComponent },
                        { path: 'handhsake',  component: TestHandshakeComponent },
                        { path: 'character/search',  component: CharacterSearchComponent },
                        { path: 'character/show/:id', component: CharacterProfileComponent },
                        { path: '',   redirectTo: '/landing', pathMatch: 'full' },
                        { path: '**', component: NotFoundComponent }
                      ];
@NgModule({
  declarations: [ CharacterSearchComponent, 
                  CharacterProfileComponent, 
                  LandingComponent, 
                  NotFoundComponent, 
                  RequestListComponent,
                  TestHandshakeComponent ],
  imports: [ BrowserModule,
             ReactiveFormsModule,
             RouterModule.forRoot(routes)],
  exports: [ RouterModule, 
             CharacterSearchComponent, 
             CharacterProfileComponent, 
             LandingComponent, 
             NotFoundComponent, 
             RequestListComponent,
             TestHandshakeComponent ],
  providers: [ {provide: LocationStrategy, useClass: HashLocationStrategy} ]
})
export class ViewModule { }
