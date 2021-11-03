const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const path = __dirname + '/views/';
const axios = require('axios').default;
const SpotifyWebApi = require("spotify-web-api-node");

const app = express();

app.use(express.static(path));
var geohash = require('ngeohash');

var corsOptions = {
  origin: "http://localhost:4200"
};


app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/', function (req, res) {
  res.sendFile(path + "index.html");
});

app.get('/api/getDataForAutoComplete', async function (req, res, next) {
  keyword = req.query['keyword']
  var autocompleteList = []
  axios.get('https://app.ticketmaster.com/discovery/v2/suggest?apikey=90gXEdRlVnZgTqo4zfSfAh3JkIZ9IvKR&keyword=' + keyword)
    .then(response => {
      if (response.status == 200) {
        resp = response.data['_embedded']['attractions']
        for (var i = 0; i < resp.length; i++) {
          autocompleteList.push(resp[i]['name'])
        }
        res.json(autocompleteList)
      } else {
        console.log("API is not working")
        res.send("API is not working")
      }
    })
    .catch(error => {
      return res.status(400).send({
        message: 'API Error'
      });
    })
});


app.get('/api/getEnteredLoc', async function (req, res, next) {
  loc = req.query['location']
  axios.get("https://maps.googleapis.com/maps/api/geocode/json?address=" + loc + "&key=AIzaSyDxZLg_I5J7Q4r6GbVspr6pR2JdLliTxtQ")
    .then(response => {
      if (response.status == 200) {
        latlong = response.data['results'][0]['geometry']['location']
        res.json(latlong)
      } else {
        console.log("API is not working")
        res.send("API is not working")
      }
    })
    .catch(error => {
      return res.status(400).send({
        message: 'API Error'
      });
    })
});

app.get('/api/getDetails', async function (req, res, next) {
  id = req.query['id']
  axios.get("https://app.ticketmaster.com/discovery/v2/events/" + id + "?apikey=90gXEdRlVnZgTqo4zfSfAh3JkIZ9IvKR&").then(async response => {
    if (response.status == 200) {
      var event = response.data
      var eve = {}
      try {
        if (event["name"].trim().length > 35) {
          eve['name'] = event["name"].trim().substr(0, 35)
          eve['tooltipReq'] = "true"
        } else {
          eve['name'] = event["name"]
          eve['tooltipReq'] = "false"
        }
        eve['tooltipName'] = event["name"]
      } catch (err) { }
      var artistArrayInfo = [];
      var artistNames = [];
      try {
        var artistArray = event['_embedded']['attractions']
        var artists = ""
        for (var i = 0; i < artistArray.length; i++) {
          artistArrayInfo.push({
            data: await getArtistData(artistArray[i]['name']),
            keyword: artistArray[i]['name'],
          });
          if (i != 0) {
            artists = artists + " | "
          }
          artistNames.push(artistArray[i]['name'])
          artists = artists + artistArray[i]['name']
        }
        eve['artists'] = artists
      }
      catch (err) {
        console.log(err)
      }
      eve['artistArray'] = artistArrayInfo;
      try {
        eve['venue'] = event['_embedded']['venues'][0]['name']
      } catch (err) {
        console.log(err)
      }
      try {
        eve['time'] = event['dates']['start']['localDate']
      } catch (err) {
        console.log(err)
      }
      try {
        eve['category'] = []
        try {
          if (event['classifications'][0]['subGenre']['name'] !== "undefined" && event['classifications'][0]['subGenre']['name'] !== "Undefined")
            eve['category'].push(event['classifications'][0]['subGenre']['name'])
        } catch (err) { }
        try {
          if (event['classifications'][0]['genre']['name'] !== "undefined" && event['classifications'][0]['genre']['name'] !== "Undefined")
            eve['category'].push(event['classifications'][0]['genre']['name'])
        } catch (err) { }
        try {
          if (event['classifications'][0]['segment']['name'] !== "undefined" && event['classifications'][0]['segment']['name'] !== "Undefined")
            eve['category'].push(event['classifications'][0]['segment']['name'])
        } catch (err) { }
        try {
          if (event['classifications'][0]['subType']['name'] !== "undefined" && event['classifications'][0]['subType']['name'] !== "Undefined")
            eve['category'].push(event['classifications'][0]['subType']['name'])
        } catch (err) { }
        try {
          if (event['classifications'][0]['type']['name'] !== "undefined" && event['classifications'][0]['type']['name'] !== "Undefined")
            eve['category'].push(event['classifications'][0]['type']['name'])
        } catch (err) { }
        if (eve['category'].length > 0)
          eve['category'] = eve['category'].join(" | ")
      } catch (err) {
        console.log(err)
      }
      try {
        var priceMin = String(event['priceRanges'][0]['min'])
        var priceMax = String(event['priceRanges'][0]['max'])
        var currency = String(event['priceRanges'][0]['currency'])
        eve['priceRange'] = priceMin + " - " + priceMax + " " + currency
      } catch (err) {
        console.log(err)
      }
      try {
        eve['ticketStatus'] = event['dates']['status']['code']
      } catch (err) {
        console.log(err)
      }
      try {
        eve['buyTicketAt'] = event['url']
      } catch (err) {
        console.log(err)
      }
      try {
        eve['seatMap'] = event['seatmap']['staticUrl']
      } catch (err) {
        console.log(err)
      }
      try {
        eve['address'] = event['_embedded']['venues'][0]['address']['line1']
      } catch (err) {
        console.log(err)
      }
      try {
        eve['city'] = event['_embedded']['venues'][0]['city']['name']
      } catch (err) {
        console.log(err)
      }
      try {
        eve['phoneNo'] = event['_embedded']['venues'][0]['boxOfficeInfo']['phoneNumberDetail']
      } catch (err) {
        console.log(err)
      }
      try {
        eve['generalRule'] = event['_embedded']['venues'][0]['generalInfo']['generalRule']
      } catch (err) {
        console.log(err)
      }
      try {
        eve['childRule'] = event['_embedded']['venues'][0]['generalInfo']['childRule']
      } catch (err) {
        console.log(err)
      }
      try {
        eve['openHours'] = event['_embedded']['venues'][0]['boxOfficeInfo']['openHoursDetail']
      } catch (err) {
        console.log(err)
      }
      try {
        eve['venueLat'] = parseFloat(event['_embedded']['venues'][0]['location']['latitude'])
      } catch (err) {
        console.log(err)
      }
      try {
        eve['venueLong'] = parseFloat(event['_embedded']['venues'][0]['location']['longitude'])
      } catch (err) {
        console.log(err)
      }



      res.json(eve)
    } else {
      return res.status(400).send({
        message: 'API Error'
      });
    }
  }).catch(error => {
    return res.status(400).send({
      message: 'API Error'
    });
  })
})


app.get('/api/getResultsData', async function (req, res, next) {
  distance = req.query['distance']
  category = req.query['category']
  units = req.query['units']
  keyword = req.query['keyword']
  location = req.query['location']
  lat = req.query['lat']
  long = req.query['long']
  geohashVal = geohash.encode(lat, long);
  if (category != "default")
    url = "https://app.ticketmaster.com/discovery/v2/events.json?apikey=90gXEdRlVnZgTqo4zfSfAh3JkIZ9IvKR&keyword=" + keyword + "&segmentId=" + category + "&radius=" + distance + "&unit" + units + "geoPoint=" + geohashVal + "&sort=date,asc"
  else
    url = "https://app.ticketmaster.com/discovery/v2/events.json?apikey=90gXEdRlVnZgTqo4zfSfAh3JkIZ9IvKR&keyword=" + keyword + "&radius=" + distance + "&unit=" + units + "&geoPoint=" + geohashVal + "&sort=date,asc"
  axios(url).then(response => {
    if (response.status == 200) {
      var listOfEvents = []
      if (response.data.page.totalElements == 0) {
        return res.json(listOfEvents)
      }
      var events = response.data['_embedded']['events']
      for (var i = 0; i < events.length; i++) {
        var eve = {};
        eve['index'] = String(i + 1);
        try {
          eve['tooltipName'] = events[i]['name']
        } catch (err) {
          eve['tooltipName'] = "N/A"
        }
        try {
          if (events[i]['name'].trim().length > 35) {
            eve['name'] = events[i]['name'].trim().substr(0, 35)
            eve['tooltipReq'] = "true"
          } else {
            eve['name'] = events[i]['name']
            eve['tooltipReq'] = "false"
          }
        }
        catch (err) {
          eve['name'] = "N/A"
          eve['tooltipReq'] = "false"
        }
        try {
          eve['date'] = events[i]['dates']['start']['localDate']
        } catch (err) {
          eve['tooltipName'] = "N/A"
        }
        try {
          eve['category'] = []
          try {
            if (events[i]['classifications'][0]['subGenre']['name'] !== "undefined" && events[i]['classifications'][0]['subGenre']['name'] !== "Undefined")
              eve['category'].push(events[i]['classifications'][0]['subGenre']['name'])
          } catch (err) {
          }
          try {
            if (events[i]['classifications'][0]['genre']['name'] !== "undefined" && events[i]['classifications'][0]['genre']['name'] !== "Undefined")
              eve['category'].push(events[i]['classifications'][0]['genre']['name'])
          } catch (err) {

          } try {
            if (events[i]['classifications'][0]['segment']['name'] !== "undefined" && events[i]['classifications'][0]['segment']['name'] !== "Undefined")
              eve['category'].push(events[i]['classifications'][0]['segment']['name'])
          } catch (err) {

          }
          try {
            if (events[i]['classifications'][0]['subType']['name'] !== "undefined" && events[i]['classifications'][0]['subType']['name'] !== "Undefined")
              eve['category'].push(events[i]['classifications'][0]['subType']['name'])
          } catch (err) {

          }
          try {
            if (events[i]['classifications'][0]['type']['name'] !== "undefined" && events[i]['classifications'][0]['type']['name'] !== "Undefined")
              eve['category'].push(events[i]['classifications'][0]['type']['name'])
          } catch (err) {
          }
          if (category.length > 1)
            eve['category'] = eve['category'].join(" | ")
        } catch (err) {
          eve['category'] = "N/A"
        }
        try {
          eve['venue'] = events[i]['_embedded']['venues'][0]['name']
        } catch (err) {
          eve['venue'] = "N/A"
        }
        try {
          eve['id'] = String(events[i]['id'])
        } catch (err) { }
        listOfEvents.push(eve)
      }
      return res.json(listOfEvents)
    } else {
      return res.status(400).send({
        message: 'API Error'
      });
    }
  }).catch(error => {
    return res.status(400).send({
      message: 'API Error'
    });
  })
})

var spotifyApi = new SpotifyWebApi({
  clientId: "9bc18e61780b4580a3e313d24c11e042",
  clientSecret: "5815c10810334b2d8f9ea8e2e5802da5"
});

function getArtistData(keyword) {
  return spotifyApi.searchArtists(keyword).then(function (data) {
    return getData(data, keyword)
  })
    .catch(function (error) {
      if (error.statusCode == '401') {
        return spotifyApi.clientCredentialsGrant().then(function (data) {
          spotifyApi.setAccessToken(data.body["access_token"]);
          return spotifyApi.searchArtists(keyword).then(function (data) {
            return getData(data, keyword);
          }).
            catch(function (err) {
              return res.status(400).send({
                message: 'API Error'
              });
            })
        });
      }
    });

};

function getData(data, keyword) {
  if (data.statusCode == 200) {
    var artistInfo = {};
    var res = data.body.artists.items;
    for (var i = 0; i < res.length; i++) {
      try {
        if (res[i]['name'].toLowerCase() == keyword.toLowerCase()) {
          try {
            artistInfo['name'] = res[i]['name']
          } catch (err) {
            console.log(err)
          }
          try {
            artistInfo['popularity'] = parseInt(res[i]['popularity'])
          } catch (err) {
            console.log(err)
          }
          try {
            artistInfo['followers'] = res[i]['followers']['total'].toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")
          } catch (err) {
            console.log(err)
          }
          try {
            artistInfo['checkAt'] = res[i]['external_urls']['spotify']
          } catch (err) {
            console.log(err)
          }
          break;
        }
      } catch (err) { }
    }
    return artistInfo;
  }
}

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});