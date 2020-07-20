function extractData(element) {
    //todo
}

function addActionLink(actionListDiv) {    

    //sc-list-item-content ->  sc-action-links
    itemActionList = actionListDiv.getElementsByClassName("sc-action-links");

    if (itemActionList[0].hasAttribute("carbon-link-added"))
        return;

    var iSeperator = document.createElement("i");
    iSeperator.setAttribute("class","a-icon a-icon-text-separator sc-action-separator");
    iSeperator.setAttribute("role","img");
    iSeperator.setAttribute("aria-label", "|");

    var span = document.createElement("span");
    span.setAttribute("class", "a-declarative a-size-small");
    span.setAttribute("data-action", "sc-item-action");

    var inputBtn = document.createElement("input");
    inputBtn.setAttribute("class", "a-declarative");
    inputBtn.setAttribute("type", "submit");
    inputBtn.setAttribute("value", "Buy carbon offset for the planet");

    span.appendChild(inputBtn);
    
    //<span class="a-declarative" data-action="sc-item-action" data-sc-item-action="{&quot;itemID&quot;:&quot;Ca18d74e1-3666-4942-a4af-25d51b43d83d&quot;,&quot;itemType&quot;:&quot;active&quot;,&quot;isWishListItem&quot;:0,&quot;action&quot;:&quot;save-for-later&quot;,&quot;isFresh&quot;:0}">
    //    <input aria-label="Save for later Baratza Sette 270Wi-Grind by Weight Conical Burr Grinder" data-action="save-for-later" name="submit.save-for-later.Ca18d74e1-3666-4942-a4af-25d51b43d83d" type="submit" value="Save for later">
    // </span>
    //var textnode = document.createTextNode("Buy Carbon Offset for the planet");         // Create a text node

    itemActionList[0].setAttribute("carbon-link-added", "true");
    itemActionList[0].appendChild(iSeperator);
    itemActionList[0].appendChild(span);

    return;
}



function formatItemRow(itemid, img, price) {

    var itemName = img.getAttribute("alt");
    itemName = itemName.length > 30 ? itemName.substr(0, 27) + "..." : itemName;        
    var strImg = "<img src='" + img.getAttribute("src") + "' alt='" + img.getAttribute("alt") + "' width='64' item-id='" + itemid + "'>";
    var strRow = "<tr><td>" + strImg + "</td><td>" + itemName + "</td><td>$" + price + "</td><td>Purchase Offset #</td></tr>";

    return strRow;
}

function ReadDOMForBasket(document_root) {
   
    var count = 0;
    var list = document_root.getElementsByClassName("sc-list-body");

    var itemArray = [];
    var innerList = [];

    var strItems = "";

    try {
        for (i = 0; i < list.length; i++) {
            if (list[i].hasAttribute("data-name") && list[i].getAttribute("data-name") == "Active Items") {

                innerList = list[i].getElementsByClassName("sc-list-item");
                //innerList = list[i].getElementsByClassName("sc-list-item-content");

                for (j = 0; j < innerList.length; j++) {
                    try {
                        itemArray.push(innerList[j]);

                        var itemid = innerList[j].getAttribute("data-itemid");
                        var price = innerList[j].getAttribute("data-price");


                        itemContentList = innerList[j].getElementsByClassName("sc-list-item-content");
                        var img = itemContentList[0].getElementsByTagName("img")[0];
                                                
                        addActionLink(itemContentList[0]);

                        strItems += formatItemRow(itemid, img, price);
                        count++;
                    }
                    catch (innerErr) {
                        console.log(innerErr.message);
                        return innerErr.message;
                    }
                }
            }
        }
    }
    catch (err) {
        console.log(err.message);
        return err.message;
    }   
    //return "Blank Cart";
    return "<table><tr><td colspan='4'>Found " + count + " items:</td></tr>" + strItems +"</table>";
    //return JSON.stringify(tbl);
}

chrome.runtime.sendMessage({
    action: "getBasketContent",
    source: ReadDOMForBasket(document)
});