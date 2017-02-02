import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { CharacterSearchComponent } from './character-search/character-search.component';

@NgModule({
  declarations: [
  CharacterSearchComponent],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [],
  bootstrap: []
})
export class ViewModle { }
