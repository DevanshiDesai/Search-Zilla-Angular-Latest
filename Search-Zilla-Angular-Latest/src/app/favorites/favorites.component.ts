import { Component, OnInit } from '@angular/core';
import { AppServiceService } from '../app-service.service';

interface ResultSet {
  index: string
  date: string
  name: string
  category: string
  venue: string
  id: string
  tooltipName: string
  tooltipReq: string
}

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css']
})
export class FavoritesComponent implements OnInit {

  constructor(public service:AppServiceService) { }
  public resultSets: ResultSet[] = [];
  ngOnInit(): void {
    this.service.getFavoritesDataFromLocal();
  }

}
