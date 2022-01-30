//  ebb3b5026d183a7affb567f28627ccce


let cityName = 'Denver' //For TESTING hardcoded value 
// API Fetch function
const fetchAPI = async(url) => {
    let resp = fetch(url).then(response => {
        if(response.ok) {
            console.log('IF logic hit')
            return response.json()
        } else {
            throw new Error('An error has occurred fetching the weather data...');
          }
    }).catch((error) => {
        console.error(error)
        return false
      })
      console.log("Hit this point")
    return resp
}

// Function to get cities weather 
/*
Better for getting daily not hourly forecast:
https://openweathermap.org/api/one-call-api
https://api.openweathermap.org/data/2.5/onecall?lat={lat}&lon={lon}&exclude={part}&appid={API key} 
*/
const weatherByCity = async (geoAPIResponse) => {
    const url = 'https://api.openweathermap.org/data/2.5/forecast?q=' + cityName + '&units=imperial&appid=ebb3b5026d183a7affb567f28627ccce'
    const forecastObj = await fetchAPI(url)
    console.log(geoAPIResponse)
    console.log(forecastObj)
}

// Function to Geocode City
const geoCode = async(cityName) => {
    const url = 'https://api.openweathermap.org/geo/1.0/direct?q=' + cityName + '&limit=5&appid=ebb3b5026d183a7affb567f28627ccce'
    const geoAPIResponse = await fetchAPI(url)
    if(geoAPIResponse) {
        return weatherByCity(geoAPIResponse)
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

// Testing
async function test () {
    let isValidName = await validateCityName(cityName)
    if(isValidName) {
        let weatherJSON = await geoCode(isValidName)
        if(weatherJSON) {
            console.log(weatherJSON)
        }
    }
}
test()
