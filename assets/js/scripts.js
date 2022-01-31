
// API Fetch function
const fetchAPI = async(url) => {
    let resp = await fetch(url).then(response => {
        if(response.ok) {
            return response.json()
        } else {
            throw new Error('An error has occurred fetching the weather data...');
          }
    }).catch((error) => {
        console.error(error)
        return false
      })
    return resp
}

// Function to get cities weather https://openweathermap.org/api/one-call-api
const weatherByCity = async (geoAPIResponse) => {
    const cityLat = geoAPIResponse[0].lat
    const cityLon = geoAPIResponse[0].lon
    const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${cityLat}&lon=${cityLon}&exclude=minutely,hourly&units=imperial&appid=ebb3b5026d183a7affb567f28627ccce`
    const forecastObj = await fetchAPI(url)
    return forecastObj
}
// https://javascript.tutorialink.com/how-to-get-data-info-from-openweathermap-api-dt/

// Function to Geocode City
const geoCode = async(cityName) => {
    const url = 'https://api.openweathermap.org/geo/1.0/direct?q=' + cityName + '&limit=5&appid=ebb3b5026d183a7affb567f28627ccce'
    const geoAPIResponse = await fetchAPI(url)
    if(geoAPIResponse) {
        const weatherObj = await weatherByCity(geoAPIResponse)
        return [weatherObj, geoAPIResponse]
    }
}

// Function to Validate City 
const validateCityName = async(cityName) => {
    const regex = new RegExp("^[a-zA-Z',.\s-]{1,25}$");
    if(regex.test(cityName)) {
        return cityName
    }
    else {
        console.warn(`Incorrect format provided ${cityName} is not valid`)
        return
    }
}

// Converts DT in API object to date format
const convertDTtoDate = async(dt) => {
    const day = new Date(dt*1000)
    return day.toDateString()
}

// Write Current weather func
const currentWeatherDOM = async(weatherAry) => {
    const currEl = document.getElementById('current-box')
    const currTitleEl = document.createElement('h3')
    const day = await convertDTtoDate(weatherAry[0].current.dt)

    let title = `${weatherAry[1][0].name}  ${day} `
    let temp = `Temp: ${weatherAry[0].current.temp }\xB0F`
    let wind = `Wind: ${weatherAry[0].current.wind_speed} MPH`
    let humidity = `Humidity: ${weatherAry[0].current.humidity} %`
    let uvi = `UVI Index: ${weatherAry[0].current.uvi}`
    weatherDetails = [temp, wind, humidity, uvi]

    currTitleEl.textContent = title
    currEl.appendChild(currTitleEl)
    // Write the details to card content 
    weatherDetails.forEach(element => {
        const newDiv = document.createElement('div')
        newDiv.textContent = element
        currEl.appendChild(newDiv)
    });
}

// Main func for write weather object to DOM
const writeWeatherDom = async(weatherAry) => {
    currentWeatherDOM(weatherAry)
}

// Search form handler
const searchForm = async(e) => {
    e.preventDefault()
    const cityName = document.getElementById('city-search').value
    const isValidName = await validateCityName(cityName)
    if(isValidName) {
        let weatherAry = await geoCode(isValidName) // Returns weather obj and geo code in array
        writeWeatherDom(weatherAry)
        return
    }
}

// Event listener 
document.getElementById('search-form').addEventListener('submit', searchForm)
