// API Fetch handler
const fetchAPI = async (url) => {
    let resp = await fetch(url).then(response => {
        if (response.ok) {
            return response.json()
        } else {
            throw new Error(`An error has occurred fetching the weather data... Response ${response.status}`);
        }
    }).catch((error) => {
        console.error(error)
        alert(error)
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
    if (forecastObj) {
        const weatherArry = [forecastObj, geoAPIResponse]
        writeWeatherDom(weatherArry)
        return
    } else {
        alert('Unable to fetch weather data please ensure valid city name')
        return
    }

}

// Function to Geocode City
const geoCode = async (cityName) => {
    const url = 'https://api.openweathermap.org/geo/1.0/direct?q=' + cityName + '&limit=5&appid=ebb3b5026d183a7affb567f28627ccce'
    const geoAPIResponse = await fetchAPI(url)
    if (geoAPIResponse.length) {
        handleLS(cityName)
        weatherByCity(geoAPIResponse)
        return
    } else {
        return
    }
}

// Function to Validate City 
const validateCityName = async (cityName) => {
    const regex = new RegExp("^[a-zA-Z',.\s-]{1,25}$");
    let noSpaces = cityName.split(" ").join("")
    if (regex.test(noSpaces)) {
        geoCode(cityName)
        return
    }
    else {
        alert(`Incorrect format provided ${cityName} is not valid`)
        return
    }
}

// Converts DT in API object to date format
const convertDTtoDate = async (dt) => {
    const day = new Date(dt * 1000)
    return day.toDateString()
}

// Write Current weather func
const currentWeatherDOM = async (weatherAry) => {
    const currEl = document.getElementById('current-box')
    const currTitleEl = document.createElement('h3')
    const currIconEl = document.createElement('img')
    const day = await convertDTtoDate(weatherAry[0].current.dt)

    let title = `${weatherAry[1][0].name}  (${day}) `
    let icon = weatherAry[0].current.weather[0].icon
    let temp = `Temp: ${weatherAry[0].current.temp}\xB0F`
    let wind = `Wind: ${weatherAry[0].current.wind_speed} MPH`
    let humidity = `Humidity: ${weatherAry[0].current.humidity} %`
    let uvi = `UVI Index: ${weatherAry[0].current.uvi}`
    weatherDetails = [temp, wind, humidity, uvi]

    currIconEl.src = 'https://openweathermap.org/img/w/' + icon + '.png'
    currTitleEl.textContent = title
    currEl.appendChild(currTitleEl)
    currEl.appendChild(currIconEl)
    // Write the details to card content 
    weatherDetails.forEach(element => {
        const newDiv = document.createElement('div')
        newDiv.textContent = element
        if (element === uvi && weatherAry[0].current.uvi <= 2) {
            newDiv.classList.add('low-uvi')
        } else if (element === uvi && weatherAry[0].current.uvi > 2 && weatherAry[0].current.uvi <= 5) {
            newDiv.classList.add('mod-uvi')
        } else if (element === uvi && weatherAry[0].current.uvi > 5 && weatherAry[0].current.uvi <= 7) {
            newDiv.classList.add('high-uvi')
        } else if (element === uvi && weatherAry[0].current.uvi > 7) {
            newDiv.classList.add('ext-uvi')
        }

        currEl.appendChild(newDiv)
    });
}

// Function to write the 5 day forecast from the API JSON 
const writeDaily = async (weatherObj) => {
    let dayEls = document.querySelectorAll('.days')
    for (let index = 0; index < dayEls.length; index++) {
        const element = dayEls[index];
        const data = weatherObj.daily[index]
        let icon = data.weather[0].icon
        let date = await convertDTtoDate(data.dt)
        date = `(${date})`
        let temp = `Temp: ${data.temp.day}\xB0F`
        let wind = `Wind: ${data.wind_speed} MPH`
        let humidity = `Humidity: ${data.humidity} %`
        let dataAry = [date, icon, temp, wind, humidity]
        dataAry.forEach(e => {
            if (e === icon) {
                const iconEl = document.createElement('img')
                iconEl.src = 'https://openweathermap.org/img/w/' + icon + '.png'
                element.appendChild(iconEl)
            } else {
                const newDiv = document.createElement('div')
                newDiv.textContent = e
                element.appendChild(newDiv)
            }
        });
    }
}

// Main func for write weather object to DOM
const writeWeatherDom = async (weatherAry) => {
    clearOldWeatherData()
    currentWeatherDOM(weatherAry)
    writeDaily(weatherAry[0])
    document.getElementById('parent-weather-box').classList.remove('hide')
}

// LocalStorage Handler
const handleLS = async (cityName) => {
    // makes first letter of each caps
    let frmtCityName = cityName.split(' ').map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ')
    if (localStorage.history) {
        let old = JSON.parse(localStorage.history)
        if (old.includes(frmtCityName)) {
            old = old.filter(item => item !== frmtCityName);
            old.unshift(frmtCityName);
        } else {
            old.unshift(frmtCityName);
        }
        // Max length 6 to keep clean
        if (old.length > 6) {
            old.pop()
        }
        localStorage.setItem('history', JSON.stringify(old))
    } else {
        localStorage.setItem('history', JSON.stringify([frmtCityName]))
    }
    checkForHistory()
}
// Function to clear old content
const clearOldWeatherData = async () => {
    document.getElementById('current-box').innerHTML = ""
    const dayElems = document.querySelectorAll('.days')
    dayElems.forEach(element => {
        element.innerHTML = ""
    });
}

// Main call API and write
const mainWrite = async (cityName) => {
    validateCityName(cityName)
}

// Search form handler
const searchForm = async (e) => {
    e.preventDefault()
    const cityName = document.getElementById('city-search').value.toLowerCase()
    mainWrite(cityName)
}

// History button click handler
const historySelected = async (e) => {
    let cityName = e.target.innerText
    mainWrite(cityName)
}


// Checks if search history in LS
const checkForHistory = async () => {
    const searchListEl = document.getElementById('search-history-list')
    searchListEl.innerHTML = ""
    if (localStorage.history) {
        const historyAry = JSON.parse(localStorage.history)
        historyAry.forEach(element => {
            const newLiEl = document.createElement('li')
            const newBtnEl = document.createElement('button')
            newBtnEl.textContent = element
            newBtnEl.classList.add('search-btn')
            searchListEl.append(newLiEl, newBtnEl)
            newBtnEl.addEventListener('click', historySelected)
        });
    }
}

checkForHistory()

// Event listener search form 
document.getElementById('search-form').addEventListener('submit', searchForm)
