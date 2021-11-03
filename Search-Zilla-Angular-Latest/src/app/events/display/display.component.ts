import { Component, OnInit } from '@angular/core';
import { AppServiceService } from '../../app-service.service';


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
  selector: 'app-display',
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.css']
})



export class DisplayComponent implements OnInit {

  constructor(public service: AppServiceService) {
  }

  ngOnInit(): void {
  }



}
