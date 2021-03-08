$(document).ready(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var elems = document.querySelectorAll(".autocomplete");
    var instances = M.Autocomplete.init(elems, options);
  });

  function getHistory() {
    var history = localStorage.getItem("cityHistory");
    
    if (history === null || history == undefined) {
    history = [];

    } else {

    history = JSON.parse(history);
    }
    // history.reverse();
    return history;
    
  }

  function addToHistory(cityObj) {
    history.push(cityObj);
    history.reverse();
    drawHistory();
    localStorage.setItem("cityHistory", JSON.stringify(history));
  }

  function drawHistory() {
    var cityHistory = $("#cityHistory");
    cityHistory.empty();
    if (history.length > 7) history.length = 7;
    history.forEach(historyObj=>{

    cityHistory.append(`<div> ${historyObj.name}</div>`)
    })
    
    
  }

  var citiesURL = "https://cities-json.s3.us-east-2.amazonaws.com/cities.js";
  var forecast = $("#forecast");

  var cityMap = {};
  var cityCard = $("#cityCard");
  var history = getHistory();
  drawHistory();

  $.ajax({
    url: citiesURL,
    type: "GET",
    dataType: "json",
    success: function (data) {
      var autoCompleteMap = {};
      data.forEach((city) => {
        autoCompleteMap[city.name] = null;
        cityMap[city.name] = city;
      });

      $("input.autocomplete").autocomplete({
        data: autoCompleteMap,
        onAutocomplete: function (cityName) {
          // debugger;
          var cityObj = cityMap[cityName];

          addToHistory(cityObj);
          forecast.empty();
          cityCard.empty();

          $.ajax({
            url: `https://api.openweathermap.org/data/2.5/weather?id=${cityObj.id}&appid=7791b89a7f56becd4a9c807073393938&units=imperial`,
            type: "GET",
            dataType: "json",
            success: function (currentCondition) {
              cityCard.append(`
                     
                    <div class="card-panel blue darken-1 ">
                    <h2><p class="white-text text-sizing">Current Conditions: </p></h2>
                    <h3><p class="red-text text-darken-4 text-sizing">${currentCondition.name}<p></h3><sep>
                    <span class="white-text text-sizing">
                    Temperature: ${currentCondition.main.temp}&deg;
                    
                    </span><br>
                    <span class="white-text text-sizing">
                    Humidity: ${currentCondition.main.humidity}%
                    </span><br>
                    
                    <span class="white-text text-sizing">
                    Temperature Index: ${currentCondition.main.feels_like}&deg;
                    </span><br>
                    </div>               
                        `);

              $.ajax({
                url: `https://api.openweathermap.org/data/2.5/onecall?lat=${currentCondition.coord.lat}&lon=${currentCondition.coord.lon}&dt=${currentCondition.dt}&exclude=current,hourly,minutely,alerts&hourly.weather.main&appid=7791b89a7f56becd4a9c807073393938&units=imperial`,
                type: "GET",
                dataType: "json",
                success: function (forecastData) {
                  console.log(currentCondition);

                  forecastData.daily.forEach((dailyData) => {
                    var myDate = new Date(dailyData.dt * 1000);

                    console.log(dailyData);
                    forecast.append(`
                    <div class="card-panel blue lighten-2 text-sizing">
                    <span class="white-text">
                    Date: ${myDate.toLocaleString("en", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}<br>
                    Day: ${dailyData.temp.day}&deg;<br>
                    Night: ${dailyData.temp.night}&deg;<br>
                    Humidity: ${dailyData.humidity}%<br>
                    Conditions: ${dailyData.weather[0].main}<br>
                    UV Index: ${dailyData.uvi}
                    <span>

                    </div>
                    `);
                    
                  });
                  
                },
                
              });

              console.log("current", currentCondition.main);
              console.log("weather data", currentCondition);
              console.log(currentCondition.coord.lat);
            },

            error: function (error) {
              console.log(error);
            },
          });
        },
      });
    },
  });
});
