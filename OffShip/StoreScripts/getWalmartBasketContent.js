
function getProductDetails(asin) {

    var link = `https://${window.location.hostname}/gp/product/${asin}/`;
    
    var xhr = new XMLHttpRequest();
    xhr.open("GET", link, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            // JSON.parse does not evaluate the attacker's scripts.
            //var resp = JSON.parse(xhr.responseText);
            var resp = xhr.responseText;
            var productData = extractProductData(resp);

            //appendMessage(resp);

            updateProductInLocalCache(asin, productData.weight, productData.dimentions);
        }
    }

    xhr.send();
    return link;
}

//TODO: This code is not re-written
function ReadDOMForWalmartBasket(document_root) {
   
    var count = 0;
    var list = document_root.getElementsByClassName("sc-list-body");
    
    var itemArray = [];
    var innerList = [];

    try {
        for (i = 0; i < list.length; i++) {
            if (list[i].hasAttribute("data-name") && list[i].getAttribute("data-name") == "Active Items") {

                innerList = list[i].getElementsByClassName("sc-list-item");

                if (typeof innerList === 'undefined' || innerList.length == 0)
                    continue;

                for (j = 0; j < innerList.length; j++) {
                    try {

                        var itemid = innerList[j].getAttribute("data-itemid");
                        var price = innerList[j].getAttribute("data-price");
                        var asin = innerList[j].getAttribute("data-asin");

                        itemArray.push(asin);

                        itemContentList = innerList[j].getElementsByClassName("sc-list-item-content");

                        if (typeof itemContentList === 'undefined' || itemContentList.length == 0)
                            continue;
                       
                        var img = itemContentList[0].getElementsByTagName("img")[0];
                        var itemDesc = img.getAttribute("alt");
                        var itemImgSrc = img.getAttribute("src");
                        var link = `https://${window.location.hostname}/gp/product/${asin}/`;

                        if (typeof storageCache[asin] === 'undefined' || storageCache[asin] === "") {
                            var product = { id: asin, description: itemDesc, link: link, imgSrc: itemImgSrc, price: price, inCart: "y" };
                            var rowStr = formatItemRow(product);

                            chrome.runtime.sendMessage({
                                action: "appendBasketContent",
                                source: rowStr
                            });

                            getProductDetailsAndStore(asin, itemDesc, link, itemImgSrc, price);
                            console.log(`${asin} not found in local cache, adding now`);
                        }

                        adjustCache(itemArray);
                    }
                    catch (innerErr) {
                        console.log(innerErr.message);
                        appendMessage("Error in getting product details: " + innerErr.message);
                        sendError(window.location.href, innerErr.message, "Error in getting product details");
                        return "Error in getting product details: " + innerErr.message;
                    }
                }
            }
        }
    }
    catch (err) {
        console.log(err.message);
        appendMessage(err.message);
        sendError(window.location.href, err.message, "Error in ReadDOMForWalmartBasket");
        return err.message;
    }   
    //return "Blank Cart";
    //return `<table><tr><td colspan='4'>Found ${count} items:</td></tr> ${strItems}<tr><td colspan='4'></td>${postalCode}</tr></table>`;    
}

function addWalmartWatcher(doc) {
    var addButtons = doc.getElementsByClassName("add-to-cart-btn");
    var count = addButtons.length;

    for (i = 0; i < addButtons.length; i++) {
        addButtons[i].addEventListener('click', walmartAddToCart);
    }

    addButtons = doc.getElementsByClassName("css-1i45fk4");
    count += addButtons.length;

    for (i = 0; i < addButtons.length; i++) {
        addButtons[i].addEventListener('click', walmartAddToCartProductPage);
    }

    addButtons = doc.getElementsByClassName("button stepper-toggle__bttn button--ghost button--small");
    count += addButtons.length;

    for (i = 0; i < addButtons.length; i++) {
        addButtons[i].addEventListener('click', walmartAddToCartUS);
    }

    addButtons = doc.getElementsByClassName("button spin-button prod-ProductCTA--primary button--primary");
    count += addButtons.length;

    for (i = 0; i < addButtons.length; i++) {
        addButtons[i].addEventListener('click', walmartAddToCartProductPageUS);
    }

    addButtons = doc.getElementsByClassName("button button--small button--ghost");
    count += addButtons.length;

    for (i = 0; i < addButtons.length; i++) {
        addButtons[i].addEventListener('click', walmartAddToCartFromSuggestionsUS);
    }

    console.log(`Finished adding ${count} listeners`);
}

function walmartAddToCart(event) {

    var parentElm = event.target.parentElement;
    var temp = parentElm.getAttribute("class");

    if (temp != "CTA-container") {
        parentElm = parentElm.parentElement;
    }

    parentElm = parentElm.parentElement;

    try {

        var linkContainer = parentElm.getElementsByClassName("product-link")[0];
        var linkHref = linkContainer.href;
        var imgSrc = linkContainer.children[1].children[1].children[0].currentSrc;
        var desc = linkContainer.children[2].children[0].innerText;
        var price = extractWalmartPrice(linkContainer.children[2].children[3].innerText);
        var linkSplit = linkHref.split("/")
        var sku = linkSplit[linkSplit.length - 1];

        var item = { store: "Walmart.ca", asin: sku, description: desc, link: linkHref, imgSrc: imgSrc, price: price, inCart: "y" };
        updateFullProductInLocalCache(item);
        //getWalmartProductDetails(linkHref); //lazy load errors.
    }
    catch (err) {
        sendError(window.location.href, err.message, "Error in walmartAddToCart");
        return err.message;
    }
}

function walmartAddToCartUS(event) {

    var parentElm = event.target.parentElement;
    
    while (parentElm.getAttribute("class") != "search-result-gridview-item clearfix arrange-fill" && parentElm.getAttribute("class") != "unified-p13n-carousel-tile item-tile Grid-col u-size-1-6") {
        parentElm = parentElm.parentElement;
    }
    
    try {

        var linkContainer = parentElm.getElementsByClassName("search-result-productimage gridview display-block")[0];
        var linkHref = linkContainer.href;
        var imgSrc = linkContainer.children[1].children[0].currentSrc;
        imgSrc = imgSrc.split("?")[0];
        var desc = parentElm.children[6].children[0].children[1].innerText;
        var price = extractWalmartPrice(parentElm.getElementsByClassName("price-main-block")[0].innerText);
        var linkSplit = linkHref.split("/")
        var sku = linkSplit[linkSplit.length - 1];

        var item = { store: "Walmart.com", asin: sku, description: desc, link: linkHref, imgSrc: imgSrc, price: price, inCart: "y" };
        updateFullProductInLocalCache(item);
        //getWalmartProductDetails(linkHref); //lazy load errors.
    }
    catch (err) {
        sendError(window.location.href, err.message, "Error in walmartAddToCartUS");
        return err.message;
    }
}

function walmartAddToCartFromSuggestionsUS(event) {

    var parentElm = event.target.parentElement;
    
    while (parentElm.getAttribute("class") != "unified-p13n-carousel-tile item-tile Grid-col u-size-1-6") {
        parentElm = parentElm.parentElement;
    }
    
    try {

        var linkContainer = parentElm.getElementsByTagName("a")[0];
        var linkHref = linkContainer.href;
        var imgSrc = linkContainer.children[0].currentSrc;
        imgSrc = imgSrc.split("?")[0];
        var desc = parentElm.children[0].children[1].children[0].children[0].innerText;
        var price = parentElm.getElementsByClassName("price-group")[0].innerText;
        var linkSplit = linkHref.split("/")
        var sku = linkSplit[linkSplit.length - 1];

        var item = { store: "Walmart.com", asin: sku, description: desc, link: linkHref, imgSrc: imgSrc, price: price, inCart: "y" };
        updateFullProductInLocalCache(item);
        //getWalmartProductDetails(linkHref); //lazy load errors.
    }
    catch (err) {
        sendError(window.location.href, err.message, "Error in walmartAddToCartUS");
        return err.message;
    }
}

function getWalmartProductDetails(link) {
    //lazy load errors. Page does not return full result, parsing is not possible
    var xhr = new XMLHttpRequest();
    xhr.open("GET", link, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            // JSON.parse does not evaluate the attacker's scripts.
            //var resp = JSON.parse(xhr.responseText);
            var resp = xhr.responseText;
            //var productData = extractProductData(resp);
            //appendMessage(resp);
            //updateProductInLocalCache(asin, productData.weight, productData.dimentions);
        }
    }

    xhr.send();
    return link;
}

function walmartAddToCartProductPage(event) {

    var eSource = event.target;
    var infoDiv = document.getElementsByClassName("e1yn5b3f0")[0];

    try {
        var linkHref = window.location.href;
        var imgSrc = document.getElementById("main-image").currentSrc;
        var descH1 = infoDiv.getElementsByTagName("h1")[0];
        var desc = descH1.innerText;
        var price = extractWalmartPrice(infoDiv.getElementsByClassName("css-k008qs e1ufqjyx0")[0].innerText);
        var linkSplit = linkHref.split("/")
        var sku = linkSplit[linkSplit.length - 1];

        var detailsDiv = document.getElementsByClassName("css-uy642q e1yg7dmx3")[0].children[0];
        var details = extractWalmartDetails(detailsDiv);

        var item = { store: "Walmart.ca", asin: sku, description: desc, link: linkHref, imgSrc: imgSrc, price: price, weight: details.weight, dimentions: details.dimentions, inCart: "y" };
        updateFullProductInLocalCache(item);
    }
    catch (err) {
        sendError(window.location.href, err.message, "Error in walmartAddToCart");
        return err.message;
    }
}

function walmartAddToCartProductPageUS(event) {

    var eSource = event.target;
    //var infoDiv = document.getElementsByClassName("e1yn5b3f0")[0];

    try {
        var linkHref = window.location.href;
        var imgSrc = document.getElementsByClassName("hover-zoom-hero-image")[0].currentSrc
        imgSrc = imgSrc.split("?")[0];

        var desc = document.getElementsByClassName("prod-ProductTitle prod-productTitle-buyBox font-bold")[0].innerText;
        var price = extractWalmartPrice(document.getElementsByClassName("price display-inline-block arrange-fit price price--stylized")[0].innerText);
        var linkSplit = linkHref.split("/")
        var sku = linkSplit[linkSplit.length - 1];

        //var detailsDiv = document.getElementsByClassName("css-uy642q e1yg7dmx3")[0].children[0];
        //var details = extractWalmartDetails(detailsDiv);

        //var item = { store: "Walmart.ca", asin: sku, description: desc, link: linkHref, imgSrc: imgSrc, price: price, weight: details.weight, dimentions: details.dimentions, inCart: "y" };
        //updateFullProductInLocalCache(item);
    }
    catch (err) {
        sendError(window.location.href, err.message, "Error in walmartAddToCart");
        return err.message;
    }
}

function extractWalmartDetails(detailsDiv) {

    var weight = "";
    var dimentions = "";
    var height = "";
    var length = "";
    var width = "";

    for (i = 0; i < detailsDiv.children.length; i++) {
        if (detailsDiv.children[i].children.length < 2)
            continue;

        var lineTitle = detailsDiv.children[i].children[0].innerText.toLocaleLowerCase();
        var lineValue = detailsDiv.children[i].children[1].innerText;

        if (lineTitle.includes("assembled weight") || lineTitle.includes("poids"))
            weight = lineValue;

        if (lineTitle.includes("assembled height") || lineTitle.includes("assembled depth") || lineTitle.includes("hauteur") || lineTitle.includes("profondeur"))
            height = lineValue;

        if (lineTitle.includes("assembled length") || lineTitle.includes("longueur"))
            length = lineValue;

        if (lineTitle.includes("assembled width") || lineTitle.includes("largeur"))
            width = lineValue;
    }

    dimentions = `${width}x${length}x${height}`;

    return { weight: weight, dimentions: dimentions };
}

function extractWalmartPrice(text) {
    //"$7?Was $12.97"
    //"$14?.?97?Was $19.93"
    //"$12 to $19?.?97"
    //"$10?.?97 to $29?.?97"

    //For french
    text = text.replace(",", ".");

    var prices = text.split('\n');
    var dec = "00";

    if (prices[0].includes(" ")) {
        prices = prices[0].split(" ");
    }
    else {
        if (prices.length > 2 && !isNaN(prices[2]) && prices[1] == ".") {
            dec = prices[2].trim();
        }
        else if (prices.length > 2 && prices[2].includes(" ")) {
            dec = prices[2].split(" ")[0];
        }
    }

    var price = prices[0].trim();

    if (!price.includes("."))
        price = price + "." + dec;

    price = normalizePrice(price);
    return price;
}

chrome.storage.local.get(null, function (data) {
    storageCache = data;
});

window.onload = function () {
    if (window.location.hostname.toLocaleLowerCase().includes("walmart.")) {
        //ReadDOMForWalmartBasket(document);
        addWalmartWatcher(document);
    }
}