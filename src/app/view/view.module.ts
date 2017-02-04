import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { JsonpModule } from '@angular/http';
import { ReactiveFormsModule } from '@angular/forms';
import { CharacterSearchComponent } from './character-search/character-search.component';

@NgModule({
  declarations: [ CharacterSearchComponent ],
  imports: [ BrowserModule,
             JsonpModule,
             ReactiveFormsModule ],
  exports: [CharacterSearchComponent],
  providers: []
})
export class ViewModule { }
