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
                var product = JSON.parse(data[k]);

                if (typeof product !== 'undefined' && typeof product.id !== 'undefined') {
                    count++;

                    var normalizedWeight = normalizeWeight(product.weight);
                    totalWeight += normalizedWeight;
                }

                //This works
                //findCarbonOffset(1, 10);
                //getCreditOptions(2, "tonne", 3);
            }
            catch (err) {
                console.error("Error in loading products: " + err);
            }
        }

        document.getElementById("numberItemsSpan").innerText = count;
        document.getElementById("totalWeightSpan").innerText = (totalWeight / 1000) + " kg";
        //document.getElementById("numberItemsSpan").innerHTML = str;
    });

    chrome.storage.local.get("location", function (data) {
        document.getElementById("addressSpan").innerText = data["location"];
    });    
}

function getCreditOptions(amount, units, numberOfOptions) {
    var url = `http://127.0.0.1:5000/v1/project/project_with_cost?units=${units}&amount=${amount}&n=${numberOfOptions}`;

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onerror = function () { // only triggers if the request couldn't be made at all
        console.error("Carbon Resp Error");
    };
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {

            message.innerHTML += ("Carbon Choices recieved!");
            // JSON.parse does not evaluate the attacker's scripts.
            //[{ "id": 4, "name": "For Peat's Sake", "description": "The Katingan Project reduced over 7.5 mm tonnes of CO2 each year by protecting and restoring 157000 hectares of the peat swamp ecosystem: one of the largest remaining of its kind.", "location": "Indonesia", "cost": 6.6, "total_cost": "19.8", "url": "https://www.cooleffect.org/content/project/for-peats-sake" }, { "id": 5, "name": "Tri-City Forest Project", "description": " Three towns that realize the impact of climate change coming together to protect their combined 6500-acre watershed lands.", "location": " Massachusets", "cost": 9.34, "total_cost": "28.02", "url": "https://www.cooleffect.org/content/project/tri-city-forest-project" }, { "id": 1, "name": "Brazilian Amazon Rosewood Conservation Project", "description": " Preventing deforestation & giving degraded forests an opportunity to regenerate and improving the livelihoods of local Riverine families.", "location": "Brazil", "cost": 3.57, "total_cost": "10.71", "url": "https://www.cooleffect.org/content/project/brazilian-amazon-rosewood-conservation-project" }]
            var offsetObj = JSON.parse(xhr.responseText);
            document.getElementById("offsetOptionsDiv").innerHTML += ("Carbon choices: " + xhr.responseText);
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
            var carbonObj = JSON.parse(xhr.responseText);

            //{ "unit": "kilograms/ton-km", "emissionFactor": 0.0079 }
            message.innerHTML += ("Carbon emission factor: " + carbonObj.emissionFactor);
        }
    }

    xhr.send();
    return;
}

function normalizeWeight(weightStr) {

    var weight = 0;
    var weightStr = weightStr.trim().toLowerCase();

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
}

window.onload = onWindowLoad;