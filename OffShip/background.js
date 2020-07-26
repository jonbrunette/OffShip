window.onload = function () {
    console.log("page load!");

    chrome.storage.onChanged.addListener(function (changes, namespace) {
        for (var key in changes) {
            var storageChange = changes[key];
            console.log('Storage key "%s" in namespace "%s" changed. ' +
                'Old value was "%s", new value is "%s".',
                key,
                namespace,
                storageChange.oldValue,
                storageChange.newValue);
        }
    });

    AddActionLinksToPage(document);
}

//window.onload = onWindowLoad;
function addActionLink(actionListDiv) {

    //sc-list-item-content ->  sc-action-links
    itemActionList = actionListDiv.getElementsByClassName("sc-action-links");

    if (itemActionList[0].hasAttribute("carbon-link-added"))
        return;

    var iSeperator = document.createElement("i");
    iSeperator.setAttribute("class", "a-icon a-icon-text-separator sc-action-separator");
    iSeperator.setAttribute("role", "img");
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

function AddActionLinksToPage(document_root) {

    var list = document_root.getElementsByClassName("sc-list-body");
    
    try {
        for (i = 0; i < list.length; i++) {
            if (list[i].hasAttribute("data-name") && list[i].getAttribute("data-name") == "Active Items") {

                innerList = list[i].getElementsByClassName("sc-list-item");

                if (typeof innerList === 'undefined' || innerList.length == 0)
                    continue;

                for (j = 0; j < innerList.length; j++) {
                    try {
                        itemContentList = innerList[j].getElementsByClassName("sc-list-item-content");

                        if (typeof itemContentList === 'undefined' || itemContentList.length == 0)
                            continue;
                        
                        addActionLink(itemContentList[0]);
                    }
                    catch (innerErr) {
                        console.log("Error in adding ActionLink: " + innerErr.message);
                        return "Error in adding ActionLink: " + innerErr.message;
                    }
                }
            }
        }

        console.log("Finished adding action links");
    }
    catch (err) {
        console.log(err.message);
        return err.message;
    }
}