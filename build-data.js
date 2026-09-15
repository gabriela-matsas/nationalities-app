// One-off script used to build the embedded dataset in scriptnacionalidades.js.
// Not needed to run the app — only re-run this if the data needs refreshing.
//
// Before running, download the 3 source files into this folder:
//   curl -sL "https://unpkg.com/world-countries@5/countries.json" -o world_countries.json
//   curl -sL "https://raw.githubusercontent.com/samayo/country-json/master/src/country-by-population.json" -o pop.json
//   curl -sL "https://raw.githubusercontent.com/samayo/country-json/master/src/country-by-continent.json" -o continent.json
//   curl -sL "https://raw.githubusercontent.com/samayo/country-json/master/src/country-by-driving-side.json" -o driveside.json
// Then: node build-data.js
// It writes countries-data.json; paste that array into scriptnacionalidades.js
// as the COUNTRIES_DATA constant (see the top of that file).
const fs = require('fs');
const path = require('path');

const dir = __dirname;
const countries = require(path.join(dir, 'world_countries.json'));
const popList = require(path.join(dir, 'pop.json'));
const contList = require(path.join(dir, 'continent.json'));
const driveList = require(path.join(dir, 'driveside.json'));

function toLookup(list, valueKey) {
    const map = {};
    list.forEach(item => { map[item.country.toLowerCase()] = item[valueKey]; });
    return map;
}
const popMap = toLookup(popList, 'population');
const contMap = toLookup(contList, 'continent');
const driveMap = toLookup(driveList, 'side');

// Manual aliases for name mismatches between the datasets
const aliases = {
    'united states': ['united states of america'],
    'czechia': ['czech republic'],
    'ivory coast': ["cote d'ivoire", 'côte d’ivoire', "côte d'ivoire"],
    'dr congo': ['democratic republic of the congo', 'congo (kinshasa)'],
    'republic of the congo': ['congo', 'congo (brazzaville)'],
    'myanmar': ['burma'],
    'eswatini': ['swaziland'],
    'north korea': ["democratic people's republic of korea", 'korea, north'],
    'south korea': ['republic of korea', 'korea, south'],
    'laos': ["lao people's democratic republic"],
    'russia': ['russian federation'],
    'iran': ['iran, islamic republic of'],
    'syria': ['syrian arab republic'],
    'vatican city': ['holy see'],
    'cape verde': ['cabo verde'],
    'east timor': ['timor-leste'],
    'brunei': ['brunei darussalam'],
    'bolivia': ['bolivia (plurinational state of)'],
    'venezuela': ['venezuela (bolivarian republic of)'],
    'tanzania': ['united republic of tanzania'],
    'moldova': ['republic of moldova'],
    'micronesia': ['micronesia (federated states of)'],
    'united kingdom': ['uk'],
    'macedonia': ['north macedonia'],
    'cabo verde': ['cape verde'],
    'fiji': ['fiji islands'],
    'turkey': ['türkiye'],
    'türkiye': ['turkey'],
    'vatican city': ['holy see (vatican city state)', 'holy see'],
    'dr congo': ['the democratic republic of congo', 'democratic republic of the congo'],
    'micronesia': ['micronesia, federated states of'],
};

// Hardcoded fallbacks for countries/territories missing from the source lists entirely
const manualOverrides = {
    taiwan: { population: 23570000, drivingSide: 'right' },
    kosovo: { population: 1795000, drivingSide: 'right' },
    macau: { population: 700000, drivingSide: 'left' },
};

function lookup(map, name) {
    const key = name.toLowerCase();
    if (map[key] !== undefined) return map[key];
    for (const [canon, alts] of Object.entries(aliases)) {
        if (key === canon || alts.includes(key)) {
            if (map[canon] !== undefined) return map[canon];
            for (const a of alts) if (map[a] !== undefined) return map[a];
        }
    }
    return undefined;
}

const misses = { population: [], continent: [], drivingSide: [] };
const result = [];

countries.forEach(c => {
    const en = c.name.common;
    const pt = (c.translations && c.translations.por && c.translations.por.common) || en;
    const capital = (c.capital && c.capital[0]) || null;
    const langValues = c.languages ? Object.values(c.languages) : [];
    const language = langValues[0] || null;
    const currencyEntries = c.currencies ? Object.values(c.currencies) : [];
    const currency = currencyEntries[0] ? currencyEntries[0].name : null;
    const currencySymbol = currencyEntries[0] ? currencyEntries[0].symbol : null;

    const override = manualOverrides[en.toLowerCase()] || {};

    let population = lookup(popMap, en);
    if (population === undefined) population = override.population;
    if (population === undefined) { misses.population.push(en); population = null; }

    let continent = lookup(contMap, en);
    if (continent === undefined) {
        // fall back to region/subregion from the main dataset
        continent = /america/i.test(c.subregion || '') ? c.subregion : c.region;
        if (!continent) misses.continent.push(en);
    }

    let drivingSide = lookup(driveMap, en);
    if (drivingSide === undefined) drivingSide = override.drivingSide;
    if (drivingSide === undefined) { misses.drivingSide.push(en); drivingSide = null; }

    result.push({
        en,
        pt,
        cca2: c.cca2,
        capital,
        language,
        currency,
        currencySymbol,
        population,
        continent,
        drivingSide,
        flagEmoji: c.flag,
    });
});

fs.writeFileSync(path.join(dir, 'countries-data.json'), JSON.stringify(result));

console.log('Built', result.length, 'countries.');
console.log('Missing population (' + misses.population.length + '):', misses.population.join(', '));
console.log('Missing continent (' + misses.continent.length + '):', misses.continent.join(', '));
console.log('Missing drivingSide (' + misses.drivingSide.length + '):', misses.drivingSide.join(', '));
