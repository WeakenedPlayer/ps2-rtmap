import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CharacterSearchComponent } from './character-search/character-search.component';
import { CharacterProfileComponent } from './character-profile/character-profile.component';

// このモジュールは、Routerで各ビューをつなぐ役割をになう
// より複雑になってきたら、forRootを外部に持ち、ここではforChildだけつくることにする。
// Refactor routes to a routing module: https://angular.io/docs/ts/latest/tutorial/toh-pt5.html

const routes: Routes = [
                        { path: '', redirectTo: 'character/search', pathMatch: 'full' },
                        { path: 'character/search',  component: CharacterSearchComponent },
                        { path: 'character/show/:id', component: CharacterProfileComponent }
                      ];
@NgModule({
  declarations: [ CharacterSearchComponent, CharacterProfileComponent ],
  imports: [ BrowserModule,
             ReactiveFormsModule,
             RouterModule.forRoot(routes)],
  exports: [ RouterModule, CharacterSearchComponent, CharacterProfileComponent ],
  providers: []
})
export class ViewModule { }
