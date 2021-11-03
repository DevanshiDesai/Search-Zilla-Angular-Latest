import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { AppServiceService } from '../../app-service.service';
@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsComponent implements OnInit {
  detail_id: string=""
  resultsAvailable:boolean=false;
  constructor(private route: ActivatedRoute,
    private router: Router,
    public service: AppServiceService) {
      this.route.params.subscribe(params=>{
        this.detail_id=params['id']
      })
   }

  ngOnInit(): void {
    if(this.detail_id && this.detail_id!="")
      this.service.getEventDetail(this.detail_id);
    
  }

}
