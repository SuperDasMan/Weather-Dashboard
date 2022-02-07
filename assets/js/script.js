var openWeatherApiKey = 'af8f73e69f0fb4e543298fba59d9d000';
var openWeatherCoordinatesUrl = 'https://api.openweathermap.org/data/2.5/weather?q=';
var oneCallUrl = 'https://api.openweathermap.org/data/2.5/onecall?lat=';
var userFormEL = $('#city-search');
var col2El = $('.col2');
var cityInputEl = $('#city');
var forecastEl = $('#forecast');
var searchHistoryEl = $('#search-history');
var currentDay = moment().format('M/DD/YYYY');
const weatherIconUrl = 'http://openweathermap.org/img/wn/';
var searchHistoryArray = loadSearchHistory();

// capitalize the first letter of city name
function titleCase(str) {
  var splitStr = str.toLowerCase().split(' ');
  for (var i = 0; i < splitStr.length; i++) {
    splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
  }
  return splitStr.join(' ');
}

// save searches
function saveSearchHistory() {
  localStorage.setItem('search history', JSON.stringify(searchHistoryArray));
};

// create history buttons
function searchHistory(city) {
var searchHistoryBtn = $('<button>')
  .addClass('btn')
  .text(city)
  .on('click', function () {
    $('#current-weather').remove();
    $('#forecast').empty();
    $('#forecast-header').remove();
    getWeather(city);
  })
  .attr({
    type: 'button'
  });

  // append btn to search history div
  searchHistoryEl.append(searchHistoryBtn);
}

// load saved searches
function loadSearchHistory() {
  var searchHistoryArray = JSON.parse(localStorage.getItem('search history'));
    if (!searchHistoryArray) {
      searchHistoryArray = {
        searchedCity: [],
      };
    } else {

    // add search history buttons to page
    for (var i = 0; i < searchHistoryArray.searchedCity.length; i++) {
      searchHistory(searchHistoryArray.searchedCity[i]);
    }
  }
  return searchHistoryArray;
}

// get weather data from apiUrl
function getWeather(city) {

  // apiUrl for coordinates
  var apiCoordinatesUrl = openWeatherCoordinatesUrl + city + '&appid=' + openWeatherApiKey;
    
  // fetch the coordinates for city
  fetch(apiCoordinatesUrl)
    .then(function (coordinateResponse) {
      if (coordinateResponse.ok) {
        coordinateResponse.json().then(function (data) {
          var cityLatitude = data.coord.lat;
          var cityLongitude = data.coord.lon;

          // fetch weather info
          var apiOneCallUrl = oneCallUrl + cityLatitude + '&lon=' + cityLongitude + '&appid=' + openWeatherApiKey + '&units=imperial';
          fetch(apiOneCallUrl)
            .then(function (weatherResponse) {
              if (weatherResponse.ok) {
                weatherResponse.json().then(function (weatherData) {

                // ** START CURRENT DAY DISPLAY ** //

                //add div to hold current day
                var currentWeatherEl = $('<div>')
                  .attr({
                    id: 'current-weather'
                  })

                // get the weather icon
                var weatherIcon = weatherData.current.weather[0].icon;
                var cityCurrentWeatherIcon = weatherIconUrl + weatherIcon + '.png';

                // display city + current day + current weather icon
                var currentWeatherHeadingEl = $('<h2>')
                  .text(city + ' (' + currentDay + ')');

                // create img element to display icon
                var iconImgEl = $('<img>')
                  .attr({
                    id: 'current-weather-icon',
                    src: cityCurrentWeatherIcon,
                    alt: 'Weather Icon'
                  })

                // create list of current weather
                var currWeatherListEl = $('<ul>')
                var currWeatherDetails = ['Temp: ' + weatherData.current.temp + ' °F', 'Wind: ' + weatherData.current.wind_speed + ' MPH', 'Humidity: ' + weatherData.current.humidity + '%', 'UV Index: ' + weatherData.current.uvi]
                for (var i = 0; i < currWeatherDetails.length; i++) {
                                
                // UV index + color rating
                if (currWeatherDetails[i] === 'UV Index: ' + weatherData.current.uvi) {
                
                // create list item and append to list
                var currWeatherListItem = $('<li>')
                  .text('UV Index: ')                
                currWeatherListEl.append(currWeatherListItem);
                var uviItem = $('<span>')
                  .text(weatherData.current.uvi);
                if (uviItem.text() <= 2) {
                  uviItem.addClass('favorable');
                } else if (uviItem.text() > 2 && uviItem.text() <= 7) {
                  uviItem.addClass('moderate');
                } else {
                  uviItem.addClass('severe');
                }
                currWeatherListItem.append(uviItem);

                // create all other conditions list items
                } else {
                  var currWeatherListItem = $('<li>')
                    .text(currWeatherDetails[i])

                  // append to list
                  currWeatherListEl.append(currWeatherListItem);
                }
              }

              // append current weather to page
              $('#forecast').before(currentWeatherEl);
              currentWeatherEl.append(currentWeatherHeadingEl);             
              currentWeatherHeadingEl.append(iconImgEl);                
              currentWeatherEl.append(currWeatherListEl);

              // ** END CURRENT DAY DISPLAY ** //

              // ** START 5-DAY FORECAST DISPLAY ** //

              // header for 5-day forecast
              var forecastHeaderEl = $('<h2>')
                .text('5-Day Forecast:')
                .attr({
                  id: 'forecast-header'
                })
              $('#current-weather').after(forecastHeaderEl)

              // create 5-day forecast array
              var forecastArray = [];
              for (var i = 0; i < 5; i++) {
                let forecastDate = moment().add(i + 1, 'days').format('M/DD/YYYY');
                forecastArray.push(forecastDate);
              }

              // create 5-day cards
              for (var i = 0; i < forecastArray.length; i++) {
              var cardDivEl = $('<div>')
                .addClass('col3');
              var cardBodyDivEl = $('<div>')
                .addClass('card-body');
              var cardTitleEl = $('<h3>')
                .addClass('card-title')
                .text(forecastArray[i]);

              // create current day icon
              var forecastIcon = weatherData.daily[i].weather[0].icon;
              var forecastIconEl = $('<img>')
                .attr({
                  src: weatherIconUrl + forecastIcon + '.png',
                  alt: 'Weather Icon'
                });

              // display weather details
              var currWeatherDetails = ['Temp: ' + weatherData.current.temp + ' °F', 'Wind: ' + weatherData.current.wind_speed + ' MPH', 'Humidity: ' + weatherData.current.humidity + '%', 'UV Index: ' + weatherData.current.uvi]
              var tempEL = $('<p>')
                .addClass('card-text')
                .text('Temp: ' + weatherData.daily[i].temp.max)  
              var windEL = $('<p>')
                .addClass('card-text')
                .text('Wind: ' + weatherData.daily[i].wind_speed + ' MPH')           
              var humidityEL = $('<p>')
                .addClass('card-text')
                .text('Humidity: ' + weatherData.daily[i].humidity + '%')

              // append weather conditions to forecast container
              forecastEl.append(cardDivEl);
              cardDivEl.append(cardBodyDivEl);
              cardBodyDivEl.append(cardTitleEl);
              cardBodyDivEl.append(forecastIconEl);
              cardBodyDivEl.append(tempEL);
              cardBodyDivEl.append(windEL);
              cardBodyDivEl.append(humidityEL);
            }

            // ** END 5-DAY FORECAST DISPLAY ** //
          })
        }
      })
    });

    // if fetch goes through but can't find detail city
    } else {
      alert('Error: Open Weather could not find city')
    }
  })

  // if fetch fails
  .catch(function (error) {
    console.log('rejected', error)
    alert('Unable to connect to Open Weather');
  });
}

// search button
function submitCitySearch(event) {
  event.preventDefault();
  var city = titleCase(cityInputEl.val().trim());

  // prevent searching for saved cities
  if (searchHistoryArray.searchedCity.includes(city)) {
    alert(city + ' is included in history below. Click the ' + city + ' button to get weather.');
      cityInputEl.val('');
  } else if (city) {
    getWeather(city);
    searchHistory(city);
    searchHistoryArray.searchedCity.push(city);
    saveSearchHistory();

    // empty the form text area
    cityInputEl.val('');
        
  // if user doesn't enter a city name
  } else {
    alert('Please enter a city');
  }
}

// search for city and fetch api data
userFormEL.on('submit', submitCitySearch);

// on click - empty the current weather and 5-day forecast info
$('#search-btn').on('click', function () {
  $('#current-weather').remove();
  $('#forecast').empty();
  $('#forecast-header').remove();
})