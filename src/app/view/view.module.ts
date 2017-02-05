import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CharacterSearchComponent } from './character-search/character-search.component';
import { CharacterProfileComponent } from './character-profile/character-profile.component';

@NgModule({
  declarations: [ CharacterSearchComponent, CharacterProfileComponent ],
  imports: [ BrowserModule,
             ReactiveFormsModule ],
  exports: [ CharacterSearchComponent, CharacterProfileComponent ],
  providers: []
})
export class ViewModule { }
