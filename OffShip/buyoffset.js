var weightInKg = 0;
var carbonObj = {};

function onWindowLoad() {

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('productId');

    chrome.storage.local.get(null, function (data) {

        if (Object.keys(data).length === 0) {
            message.innerHTML += "Nothing in local storage";
        }

        var count = 0;
        var str = "";
        var totalWeight = 0;

        for (var k in data) {
            str += "<p>Found [" + k + "," + data[k] + "]</p>";
            try {

                if (!data[k].startsWith("{"))
                    continue;

                var product = JSON.parse(data[k]);

                if (typeof product !== 'undefined' && typeof product.id !== 'undefined') {
                    count++;

                    var normalizedWeight = normalizeWeight(product.weight);
                    totalWeight += normalizedWeight;
                }
            }
            catch (err) {
                console.error("Error in loading products: " + err);
            }
        }

        weightInKg = (totalWeight / 1000);

        document.getElementById("numberItemsSpan").innerText = count;
        document.getElementById("totalWeightSpan").innerText = weightInKg + " kg";
        //document.getElementById("numberItemsSpan").innerHTML = str;

        findDistance();
    });

    chrome.storage.local.get("location", function (data) {
        document.getElementById("addressSpan").innerText = data["location"];
    });
}

var rad = function (x) {
    return x * Math.PI / 180;
};

var getDistanceBetweenPoints = function (p1, p2) {
    var R = 6378137; // Earth’s mean radius in meter
    var dLat = rad(p2.lat - p1.lat);
    var dLong = rad(p2.lon - p1.lon);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(rad(p1.lat)) * Math.cos(rad(p2.lat)) *
        Math.sin(dLong / 2) * Math.sin(dLong / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d; // returns the distance in meter
};

function findDistance() {
    
    var locationapikey = "<place your key here>";
    var url = `http://api.ipstack.com/check?access_key=${locationapikey}`;

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onerror = function () { // only triggers if the request couldn't be made at all
        console.error("Location service response Error");
    };
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            // JSON.parse does not evaluate the attacker's scripts.
            var geoObj = JSON.parse(xhr.responseText);

            //Shenzhen : 22.5431° N, 114.0579° E
            var p1 = JSON.parse(`{"lat": ${geoObj.latitude}, "lon": ${geoObj.longitude}}`);
            var p2 = JSON.parse(`{"lat": 22.5431, "lon": 114.0579}`);
            
            var distance = getDistanceBetweenPoints(p1, p2) / 1000;
            distance = Math.round((distance + Number.EPSILON) * 100) / 100;
            document.getElementById("travelDistanceSpan").innerText = distance.toLocaleString();

            findCarbonOffset(weightInKg, distance);

            return distance;
        }
    }

    xhr.send();
    return;
}

//Can use these static values for testing
//function findDistance() {
    
//    //var p1 = JSON.parse(`{lat: ${geoObj.latitude}, lon: ${geoObj.longitude}}`);    
//    var p1 = JSON.parse(`{"lat": 45.46500015258789, "lon": -73.5707015991211}`);
//    var p2 = JSON.parse(`{"lat": 22.5431, "lon": 114.0579}`);

//    var distance = getDistanceBetweenPoints(p1, p2) / 1000;
//    distance = Math.round((distance + Number.EPSILON) * 100) / 100;
//    document.getElementById("travelDistanceSpan").innerText = distance.toLocaleString();

//    findCarbonOffset(weightInKg, distance);
        
//    return distance;
//}

function getCreditOptions(amount, units, numberOfOptions) {
    //var url = `http://127.0.0.1:5000/v1/project/project_with_cost?units=${units}&amount=${amount}&n=${numberOfOptions}`;
    var url = `http://carboncredits-smart-parrot-fs.mybluemix.net/v1/project/project_with_cost?units=${units}&amount=${amount}&n=${numberOfOptions}`;

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onerror = function () { // only triggers if the request couldn't be made at all
        console.error("Carbon Resp Error");
    };
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            // JSON.parse does not evaluate the attacker's scripts.
            //[{ "id": 4, "name": "For Peat's Sake", "description": "The Katingan Project reduced over 7.5 mm tonnes of CO2 each year by protecting and restoring 157000 hectares of the peat swamp ecosystem: one of the largest remaining of its kind.", "location": "Indonesia", "cost": 6.6, "total_cost": "19.8", "url": "https://www.cooleffect.org/content/project/for-peats-sake" }, { "id": 5, "name": "Tri-City Forest Project", "description": " Three towns that realize the impact of climate change coming together to protect their combined 6500-acre watershed lands.", "location": " Massachusets", "cost": 9.34, "total_cost": "28.02", "url": "https://www.cooleffect.org/content/project/tri-city-forest-project" }, { "id": 1, "name": "Brazilian Amazon Rosewood Conservation Project", "description": " Preventing deforestation & giving degraded forests an opportunity to regenerate and improving the livelihoods of local Riverine families.", "location": "Brazil", "cost": 3.57, "total_cost": "10.71", "url": "https://www.cooleffect.org/content/project/brazilian-amazon-rosewood-conservation-project" }]
            var offsetList = JSON.parse(xhr.responseText);
            //document.getElementById("offsetOptionsDiv").innerHTML += ("Carbon choices: " + xhr.responseText);

            var table = document.getElementById("offsetOptionsTbl");

            for (var k in offsetList) {
                //str += "<p>Found [" + k + "," + offsetList[k] + "]</p>";
                try {
                    var cost = offsetList[k].cost.toFixed(2).toLocaleString();
                    var strRow = `<td><a href="${offsetList[k].url}" alt="${offsetList[k].name}">${offsetList[k].name}</a></td><td class="w3-centered w3-cell-top">$${cost}</td><td class="w3-cell-top">${offsetList[k].description}</td>`;
                    
                    row = table.insertRow(table.rows.length);
                    row.innerHTML = strRow;
                }
                catch (err) {
                    console.error("Error in loading products: " + err);
                }
            }

            //document.getElementById("offsetOptionsDiv").innerHTML += "Carbon choices: " + offsetObj;
        }
    }

    xhr.send();
    return;
}

function findCarbonOffset(weightKg, distanceKm) {
    //Montreal - Shenzhen 12,402 km
    weightKg = weightKg / 1000; //Need it in tons
    var url = `https://carbon-footprint-app.mybluemix.net/v1/emission/air-shipping?unitSystem=METRIC&weightInTons=${weightKg}&distance=${distanceKm}`;

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onerror = function () { // only triggers if the request couldn't be made at all
        console.error("Carbon Resp Error");
    };
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            // JSON.parse does not evaluate the attacker's scripts.
            //{ "unit": "kilograms/ton-km", "emissionFactor": 0.0079 }
            carbonObj = JSON.parse(xhr.responseText);
            document.getElementById("emissionTotalSpan").innerText = `${carbonObj.emissionFactor} in ${carbonObj.unit}`;

            getCreditOptions(carbonObj.emissionFactor, "tonne", 3);
        }
    }

    xhr.send();
    return;
}

///Will return weight in grams (g)
function normalizeWeight(weightStr) {

    if (weightStr == 0)
        return 0;

    var weight = 0;
    var weightStr = weightStr.trim().toLowerCase();

    //Metric
    var index = weightStr.indexOf("kg");

    if (index > -1) {
        weightStr = weightStr.substr(0, index).trim();
        weight = parseFloat(weightStr) * 1000;
        return weight;
    }

    index = weightStr.indexOf("g");

    if (index > -1) {
        weightStr = weightStr.substr(0, index).trim();
        weight = parseFloat(weightStr);
        return weight;
    }

    //imperial
    index = weightStr.indexOf("pounds");

    if (index > -1) {
        weightStr = weightStr.substr(0, index).trim();
        weight = parseFloat(weightStr) * 453.592;
        return weight;
    }

    index = weightStr.indexOf("ounces");

    if (index > -1) {
        weightStr = weightStr.substr(0, index).trim();
        weight = parseFloat(weightStr) * 28.35;
        return weight;
    }
}

window.onload = onWindowLoad;