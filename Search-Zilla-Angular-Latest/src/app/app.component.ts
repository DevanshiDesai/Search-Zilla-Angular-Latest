import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { startWith, mergeMap, throttleTime } from 'rxjs/operators';
import { AppServiceService } from './app-service.service';
import { FormBuilder } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import {RouterOutlet} from '@angular/router';
import {slideInAnimation} from './animation'


interface IpInfoResponse {
  loc: string
}


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
  selector: 'app-component',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.css'],
  animations: [
    slideInAnimation
  ]
})
export class AppComponent implements OnInit {
  public resultSets: ResultSet[] = [];
  constructor(public service: AppServiceService, private formBuilder: FormBuilder,private http: HttpClient) {
  }

  keyword = new FormControl('', [Validators.required, this.validateIfSpaceExists]);
  category = new FormControl("default");
  distance = new FormControl(null);
  units = new FormControl("miles");
  from = new FormControl("current");
  checkLoc: boolean = false;
  lat: number = 0;
  long: number =0;
  textBoxDisabled: boolean=true;
  enteredLoc = new FormControl("", [Validators.required,this.validateIfSpaceExists]);

  searchForm =this.formBuilder.group({
    keyword: this.keyword,
    category: this.category,
    distance: this.distance,
    units: this.units,
    from: this.from,
    enteredLoc: this.enteredLoc,
  });


  public clickEvent(id:string,result:ResultSet) {
      if(this.service.isFav(id)!=true){
        localStorage.setItem(id, JSON.stringify(result));
      }else{
        localStorage.removeItem(id)
      }


  }


  filteredStreets: Observable<string[]> | undefined;


  getCurrentLocation(){
    this.http.get<IpInfoResponse>("https://ipinfo.io/json?token=6ca76ab3be0d5e").subscribe(response => {
      var latLong = response['loc'].split(",");
      this.lat = parseFloat(latLong[0])
      this.long = parseFloat(latLong[1])
      this.checkLoc = true;

    });
  }

  ngOnInit() {
    this.getCurrentLocation();
    this.filteredStreets = this.keyword.valueChanges.pipe(
      startWith(''),
      throttleTime(400),
      mergeMap(value => {
        return this.service.getDataForAutoComplete(value);
      })
    );
  }

  validateIfSpaceExists(control: FormControl) {
    const isSpace = (control.value || "").trim().length === 0;
    const isValid = !isSpace;
    return isValid ? null : { whitespace: true };
  }

  getResultsData(){
    this.service.getResultsData({
      ...this.searchForm.value,
      lat: this.lat,
      long: this.long
    })
  }
  onSubmit() {
    if(this.from.value !== "current"){
      this.service.getEnteredLocation(this.searchForm.value.enteredLoc).subscribe(response=>{
        this.lat=parseFloat(response['lat']);
        this.long=parseFloat(response['lng'])
        this.getResultsData()
      })
    }else{
        this.getResultsData()
    }
  }
  onClear(){
    this.textBoxDisabled=true;
    this.service.onClear()
  }
  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData.animation;
  }
  toggle(value: string){
    this.textBoxDisabled = value === "current";
    this.from.setValue(value);
  }

}

