import { ArtistInfo } from "./artistInfo";

export interface DetailResult {
  artists: string
  date: string
  name: string
  category: string
  venue: string
  id: string
  time : string
  priceRange: string
  ticketStatus:string
  buyTicketAt: string
  seatMap:string
  address:string
  city:string
  phoneNo:string
  openHours:string
  generalRule:string
  childRule:string  
  artistArray:ArtistInfo[]
  venueLat: number
  venueLong: number
  tooltipReq:string
  tooltipName:string
}

  
  /*
  Copyright Google LLC. All Rights Reserved.
  Use of this source code is governed by an MIT-style license that
  can be found in the LICENSE file at https://angular.io/license
  */