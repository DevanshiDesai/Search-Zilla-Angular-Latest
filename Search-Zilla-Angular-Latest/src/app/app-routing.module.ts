import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DetailsComponent } from './events/details/details.component';
import { DisplayComponent } from './events/display/display.component';
import { FavoritesComponent } from './favorites/favorites.component';

const routes: Routes = [
  { path: '', redirectTo: 'display', pathMatch: "full" },
  { path: 'details/:id', component: DetailsComponent , data: {animation: 'DetailsPage'} },
  { path: 'display', component: DisplayComponent , data: {animation: 'DisplayPage'} },
  { path: 'favorites', component: FavoritesComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }