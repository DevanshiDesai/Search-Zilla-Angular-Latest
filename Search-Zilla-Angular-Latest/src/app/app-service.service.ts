import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http'
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ResultSet } from './interfaces/resultset';
import { DetailResult } from './interfaces/detailresult';
import { Router} from '@angular/router';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';

// import { ResultSet } from './resultset';
//  import { HttpErrorHandler, HandleError } from './http-error-handler.service';

interface IpInfoResponseF {
  lat: string
  lng: string
}


@Injectable({
  providedIn: 'root'
})

export class AppServiceService {
  public isLoading=false;
  public resultSets: ResultSet[] = [];
  // public artistInfoList?: ArtistInfo[] = [];
  public searchTriggered: boolean = false;
  public detailResult?: DetailResult=undefined;
  public url:string="";
  public favorites:ResultSet[]=[];
  public retainID:string="";
  public error: any;

  constructor(
    private http: HttpClient,private router: Router) {
  }


  getEventDetail(id: string) {
    this.error=""
    this.retainID=id;
    let params = new HttpParams();
    params = params.set("id", id)
    return this.http.get<DetailResult>("/api/getDetails", { params: params }).pipe(
      catchError(this.handleError)
    ).toPromise().then(response=>{
      this.detailResult=response;
      this.url="https://twitter.com/intent/tweet?text="+"Check%20out%20"+this.detailResult.name+"%20located%20at%20"+this.detailResult.venue+'.'+"&hashtags=CSCI571EventSearch"

    });
  }

  getResultsData(inputVal?: any) {
    this.activeTab='display';
    this.router.navigate(['display']);
    this.error=""
    this.isLoading=true;
    this.searchTriggered = true;
    let params = new HttpParams();
    if (inputVal !== undefined) {
      if (inputVal['distance'] == "" || inputVal['distance'] === null)
        params = params.set("distance", "10")
      else {
        params = params.set("distance", inputVal['distance'])
      }
      params = params.set("category", inputVal['category'])
      params = params.set("units", inputVal['units'])
      params = params.set("keyword", inputVal['keyword'])
      params = params.set("location", inputVal['location'])
      params = params.set("lat", inputVal['lat'])
      params = params.set("long", inputVal['long'])

    }
    return this.http.get<ResultSet[]>('/api/getResultsData', { params: params }).pipe(
      catchError(this.handleError)
    ).subscribe(response => {
          this.resultSets = response;
          this.isLoading=false;
    });
  }


  getDataForAutoComplete(keyword?: string) {
    this.error=""
    let params = new HttpParams();
    if (keyword !== undefined) {
      params = params.set("keyword", keyword)
    }
    return this.http.get<string[]>('/api/getDataForAutoComplete', { params: params }).pipe(
      catchError(this.handleError))
    ;
  }

  getEnteredLocation(location?: string) {
    this.error=""
    let params = new HttpParams();
    if (location !== undefined) {
      params = params.set("location", location)
    }
    return this.http.get<IpInfoResponseF>('/api/getEnteredLoc', { params: params }).pipe(
      catchError(this.handleError))
  }

  getFavoritesDataFromLocal() {
    this.error=""
    this.favorites=[]
    for (var i = 0; i < localStorage.length; i++) {
      this.favorites.push(JSON.parse(localStorage.getItem(localStorage.key(i) || '{}') || '{}') || null)
    }
  }
  removeFromFav(id: string) {
    this.error=""
    localStorage.removeItem(id);
    this.favorites = [];
    this.getFavoritesDataFromLocal();
  }
  
  isFav(id:string){
    this.error=""
    return Object.keys(JSON.parse(localStorage.getItem(id.toString()) || '{}')).length !==0 
  }

  public clickEvent(id:string,result:ResultSet) {
    this.error=""
    if(this.isFav(id)!=true){
      localStorage.setItem(id, JSON.stringify(result));
    }else{
      localStorage.removeItem(id)
    }
  }

  public favClickFromDetail(id:string,result:DetailResult) {
    this.error=""
    var col={
      "index": 0,
      "date": result.time,
      "name": result.name,
      "category": result.category,
      "venue": result.venue,
      "id": id,
      "tooltipName": result.tooltipName,
      "tooltipReq": result.tooltipReq
    }
    if(this.isFav(id)!=true){
      localStorage.setItem(id, JSON.stringify(col));
    }else{
      localStorage.removeItem(id)
    }
  }
  activeTab = 'display';
  public onClear(){
    this.resultSets=[];
    this.detailResult=undefined;
    this.searchTriggered=false;
    this.activeTab='display';
    this.router.navigate(['display']);
    this.retainID=""
  }
  

  display(activeTab:string){
    this.error=""
    this.activeTab = activeTab;
  }

  fav(activeTab:string){
    this.error=""
    this.activeTab = activeTab;
  }

  private handleError = (error: HttpErrorResponse) => {
    if(error.status==201){
      console.error('An error occurred:', error.error);
    }
    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error);
      this.error='An error occurred:'+ error.error;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
      this.error='Failed to get search results.';
    }
    // this.searchTriggered=false;
    this.retainID="";
    this.isLoading=false;
    // Return an observable with a user-facing error message.
    return throwError(
      'Something bad happened; please try again later.');
  }
}