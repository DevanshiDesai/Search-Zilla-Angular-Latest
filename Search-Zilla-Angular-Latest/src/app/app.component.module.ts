import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { Form, FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppRoutingModule } from './app-routing.module';

import {ReactiveFormsModule} from '@angular/forms';
import {MatNativeDateModule} from '@angular/material/core';
import {DemoMaterialModule} from './material-module';

import { AgmCoreModule } from '@agm/core';
import { AppComponent } from './app.component';
import { DetailsComponent } from './events/details/details.component';
import { DisplayComponent } from './events/display/display.component';
import { FavoritesComponent } from './favorites/favorites.component';
import {RoundProgressModule} from 'angular-svg-round-progressbar';


@NgModule({
  declarations: [AppComponent,DetailsComponent, DisplayComponent, FavoritesComponent],
  imports: [BrowserModule, FormsModule,
    HttpClientModule,
    DemoMaterialModule,
    MatNativeDateModule,
    ReactiveFormsModule, NgbModule, AppRoutingModule,RoundProgressModule,   
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyDoKVuV-EB_ubRtGG3bKMJJ93Tt5A-g54s'
    })],
  exports: [AppComponent],
})
export class AppComponentModule {
}
