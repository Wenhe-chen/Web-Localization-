import { locale, updateLocale } from '../app.js';

var stringsJSON = {};

const i18n = {
    // Load resource json based on locale
    loadStringsJSON: async (newLocale) => {
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };
        try {
            const response = await fetch(`./content/${newLocale}/strings.json`, options);
            stringsJSON = await response.json();
        } catch (err) {
            console.log('Error getting strings', err);
            if (newLocale != "en-US") {
                updateLocale("en-US");
            }
        }
    },

    // Load resource json based on locale
    getString: (view, key) => {
        return stringsJSON[view][key];
    },

    // Determine the proper currency format based on locale and return html string
    formatCurrency: (price) => {
        let converted = convertCurrency(price);
        let formatted = new Intl.NumberFormat(locale, { style: 'currency', currency: currencyMap[locale] }).format(converted);
        return `<h4>${formatted}</h4>`;
    },

    // Return the locale-based link to the HTML file within the 'static' folder
    getHTML: () => {
        return `${locale}/terms.html`; //$NON-NLS-L$
    },

    // Format the date string manually according to locale
    formatDate: (dateString) => {
        return convertDate(dateString);
    }
};

// Used to determine the correct currency symbol
var currencyMap = {
    'en-US': 'USD',
    'zh-CN': 'CNY',
};

// Function to perform rough conversion from galactic credits to real currencies
var convertCurrency = (price) => {
    switch (locale) {
        case 'en-US':
            return price * 1;
        case 'zh-CN':
            return price * 7;
        default:
            return price;
    }
};

// Function to convert the date string manually based on the locale
var convertDate = (dateString) => {
    // Split the input date string into components
    const [month, day, year] = dateString.split('/');

    switch (locale) {
        case 'zh-CN':
            return `${year}年${month}月${day}日`; // Year-Month-Day for zh-CN
        default:
            return `${day}-${month}-${year}`; // Default format (Day-Month-Year)
    }
};

export default i18n;
