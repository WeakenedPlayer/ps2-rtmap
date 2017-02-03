import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CharacterSearchComponent } from './character-search/character-search.component';

@NgModule({
  declarations: [CharacterSearchComponent],
  imports: [ BrowserModule ],
  exports: [CharacterSearchComponent],
  providers: []
})
export class ViewModule { }
