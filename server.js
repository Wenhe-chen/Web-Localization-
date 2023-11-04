const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const i18next = require('i18next');
const i18nextMiddleware = require('i18next-http-middleware');
const i18nextBackend = require('i18next-fs-backend');
const app = express()

const apiKey = '7d5e13110ff6d8d5350d22f2b1aeb52e';

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
  // Get the 'Accept-Language' header from the request
  const acceptLanguage = req.headers['accept-language'];
  
  // Get the preferred language, assumes the first language is preferred
  const preferredLanguage = acceptLanguage.split(',')[0].trim();
  
  // Attach the detected language to the request object for further handling
  req.preferredLanguage = preferredLanguage;
  
  next();
  });
  i18next.use(i18nextBackend).use(i18nextMiddleware.LanguageDetector).init({
    // The lng property determines the default language to use if no other language is detected
    lng: 'en',
    fallbackLng: 'en', // use en if detected lng is not available
   
    backend: {
      loadPath: './locales/{{lng}}/{{ns}}.json',
    },
  
    ns: ['translations'],
    defaultNS: 'translations',
    keySeparator: false, // we use content as keys
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
  });
  app.use(i18nextMiddleware.handle(i18next));
app.set('view engine', 'ejs')

app.get('/', function (req, res) {
  i18next.changeLanguage(req.preferredLanguage, (err, t) => {
    if (err) {
      // Handle the situation where the language file isn't available
      return res.status(500).send("Error changing language");
    }
  });
  res.render('index', {weather: null, error: null});
})

app.post('/', function (req, res) {
  let city = req.body.city;
  let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`
  let errorMessage = i18next.t('error-please-try-again');

  request(url, function (err, response, body) {
    if(err){
      res.render('index', {weather: null, error: errorMessage});
    } else {
      let weather = JSON.parse(body)
      if(weather.main == undefined){
        res.render('index', {weather: null, error: errorMessage});
      } else {
        //let weatherText = `It's ${weather.main.temp} degrees in ${weather.name}!`;
        let weatherTemp = weather.main.temp + '°F (' + ((weather.main.temp-32)/1.8).toFixed(2) + '°C)'
        let weatherText = i18next.t('display_weather', { temp: weatherTemp, city: weather.name });
        res.render('index', {weather: weatherText, error: null});
      }
    }
  });
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
