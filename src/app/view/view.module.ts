import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CharacterSearchComponent } from './character-search/character-search.component';

@NgModule({
  declarations: [ CharacterSearchComponent ],
  imports: [ BrowserModule,
             ReactiveFormsModule ],
  exports: [CharacterSearchComponent],
  providers: []
})
export class ViewModule { }
