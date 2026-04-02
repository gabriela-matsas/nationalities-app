let lang = "en"; // idioma padrão

const countryMap = {
    "Brasil": "Brazil",
    "Brazil": "Brazil",
    "Estados Unidos": "United States",
    "United States": "United States",
    "USA": "United States",
    "Angola": "Angola",
    "Moçambique": "Mozambique",
    "Mozambique": "Mozambique",
    "França": "France",
    "France": "France",
    "México": "Mexico",
    "Mexico": "Mexico",
    "Canadá": "Canada",
    "Canada": "Canada"
};

const countryMapPT = {
    "Brazil": "Brasil",
    "United States": "Estados Unidos",
    "Angola": "Angola",
    "Mozambique": "Moçambique",
    "France": "França",
    "Mexico": "México",
    "Canada": "Canadá"
};

const texts = {
    en: {
        title: "Nationalities",
        question: "In which country were you born?",
        button: "Verify",
        error: "We are having problems finding your flag 😢",
        from: "Your country",
        capital: "The capital of your country is",
        language: "The official language is",
        currency: "The official currency is",
        population: "The population is around",
        continent: "The continent of your country is",
        timezone: "Time zone",
        drive: "In your country you drive"
    },
    pt: {
        title: "Nacionalidades",
        question: "Em qual país você nasceu?",
        button: "Verificar",
        error: "Estamos com problemas para encontrar seu país 😢",
        from: "Seu país",
        capital: "A capital do seu país é",
        language: "O idioma oficial é",
        currency: "A moeda oficial é",
        population: "A população é cerca de",
        continent: "O continente do seu país é",
        timezone: "Fuso horário",
        drive: "No seu país dirige-se"
    }
};

// Mapas apenas para PT
const languageMapPT = {
    "English": "Inglês",
    "Portuguese": "Português",
    "Spanish": "Espanhol",
    "French": "Francês"
};

const currencyMapPT = {
    "Brazilian real": "Real brasileiro",
    "United States dollar": "Dólar americano",
    "Euro": "Euro",
    "Mexican peso": "Peso mexicano",
    "Canadian dollar": "Dólar canadense"
};

const continentMapPT = {
    "South America": "América do Sul",
    "North America": "América do Norte",
    "Europe": "Europa",
    "Africa": "África",
    "Asia": "Ásia",
    "Oceania": "Oceania"
};

function setLang(newLang) {
    lang = newLang;
    document.getElementById("title").innerText = texts[lang].title;
    document.getElementById("question").innerText = texts[lang].question;
    document.getElementById("btn").value = texts[lang].button;
}

async function verify() {
    let txtv = document.getElementById('txtname');
    let res = document.getElementById('ver');
    let txt = txtv.value.trim();

    // Corrigir primeira letra maiúscula automaticamente
    txt = txt.replace(/\s+/g, ' ')
             .split(' ')
             .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
             .join(' ');

    const apiName = countryMap[txt] || txt;
    let url = `https://restcountries.com/v3.1/name/${encodeURIComponent(apiName)}?fullText=true`;

    try {
        let resposta = await fetch(url);
        let dados = await resposta.json();
        let pais = dados[0];

        // Nome do país traduzido apenas se PT
        let nome = pais.name.common;
        if (lang === "pt") nome = countryMapPT[nome] || nome;

        let bandeira = pais.flags.png;
        let capital = pais.capital ? pais.capital[0] : "N/A";

        // Idioma, moeda e continente traduzidos apenas se PT
        let idioma = pais.languages 
            ? (lang === "pt" ? languageMapPT[Object.values(pais.languages)[0]] || Object.values(pais.languages)[0] 
                             : Object.values(pais.languages)[0]) 
            : "N/A";

        let moeda = pais.currencies 
            ? (lang === "pt" ? currencyMapPT[Object.values(pais.currencies)[0].name] || Object.values(pais.currencies)[0].name 
                             : Object.values(pais.currencies)[0].name) 
            : "N/A";

        let populacaoFormatada = pais.population.toLocaleString();
        let continente = lang === "pt" ? continentMapPT[pais.continents[0]] || pais.continents[0] : pais.continents[0];

        let emoji = pais.flag;
        let timezone = pais.timezones[0];

        // Direção simplificada
        let direcao = pais.car.side === "left" ? (lang === "pt" ? "à esquerda" : "left") : (lang === "pt" ? "à direita" : "right");

        res.innerHTML = `
            <p>${texts[lang].from}: ${nome}</p>
            <p style="font-size: 30px;">${emoji}</p>
            <img src="${bandeira}" width="150">
            <p>${texts[lang].capital} ${capital}</p>
            <p>${texts[lang].language} ${idioma}</p>
            <p>${texts[lang].currency} ${moeda}</p>
            <p>${texts[lang].population} ${populacaoFormatada}</p>
            <p>${texts[lang].continent} ${continente}</p>
            <p>${texts[lang].timezone}: ${timezone}</p>
            <p>${texts[lang].drive} ${direcao}</p>
        `;

        // Mostrar a div somente depois de pesquisar
        res.classList.add('show');
    } catch (erro) {
        res.innerHTML = texts[lang].error;
    }
}