/*Javascript file for bread crumb look up control.*/


//Create the object
LookupIpodMenu = function () {

  

    var idDivLookup = "div1"; //id of the div that displays the look up
    var idDivLookupJQ = "#div1"  //Jquery Id

    
    //The source control that the breadcrumb control will be hookoed into.
    var sourceCtrl = null;


    //Used to store the previous search value.
    var previousSearchValue = "";

    
    //**NEW the path that is set initially
    var lookupPath = "";

    //If True, auto complete is triggered when the key is preesed.
    var useAutoCompleteOnKeyPress = false;

    //The delay in MS after which the auto complete is triggered.
    var autoCompleteOnKeyPressDelay = 1000;

    //The automatic key refresh timer functionality.
    var timer = null;

    //Use to enable/disable animations in the control.
    var enableAnimation = false;

    //If true, a search box will also be displayed that will allow the user to type the path
    var displaySearchBox = false;

    //This function is used to get the data. The value is the source data (the path). If the function is successful, the onSuccess function should be called.
    //If there is an error, the onError should be called. It is important to handle the error (for example displaying) and then call onError. 
    var callback_getdata = null; //function (value, onSuccess, onError) {  }

    //The function is called when the bread crumb item is clicked.
    var callback_itemClicked = function (text) {
        
    }

    //The function is called when an item is selected in the list.
    var callback_itemSelected = function (path) {
    }

    //The function is called when the lookup is displayed. 
    //The target is the source  that triggered the display of the lookup.
    //The text is the text that will be displayed in the lookup
    //If false is returned the lookup will not be displayed.
    var callback_displayLookup = function (text, target) {
        return true;
    }

    //The function is called when the look up is closed.
    //The target is the source  that triggered the close of the lookup. For example if clicked outside
    //If false is returned the look up will not be closed.
    var callback_closeLookup = function (target) {
        return true;
    }


    //This function is called to return the position where the lookup control is displayed.
    var callback_getposition = function (target, left, top) {

        return {
            left: left,
            top: top
        };
    }

    


    //Not set by options
    //Id declarations.
    var idSearchBox = ""; //id of the text search box
    var idSearchBoxJQ = "";//Jquery Id


    var idDivLookupItems = "";//id of the div that contains the lookup items
    var idDivLookupItemsJQ = "" //Jquery Id

    var idDivLookupItemsLoading = ""; //id of the div that should be displayed when the look up items are loading
    var idDivLookupItemsLoadingJQ = ""; //Jquery Id


    //Initialize the control. Should be called only once when the body is loaded.
    function initialize(opts) {


        //Initialize the options.
        initOptions(opts);

        //Initialize variables
        previousSearchValue = "";

        //Register the window key down event.
        $(window).keydown(keyDownHandler);

        //Register the window key up event.
        $(window).keyup(keyUpHandler);




        //Register the mouse up handler
        $(document).mouseup(mouseUpHandler);



        createLookupDiv(sourceCtrl);

        //**NEW
        createLookupBC(lookupPath, sourceCtrl);
    }

    //Used to initialize the options
    function initOptions(opts) {

        opts = opts || {}; //If not passed create a new empty default.



        sourceCtrl = opts.sourceCtrl || sourceCtrl;

        

        /**********CALL BACK FUNCTIONS *****************/
        /***********************************************/

        //Set the getdata call back. This is a required function.
        callback_getdata = opts.callback_getdata || callback_getdata;

        //Called when a link is clicked 
        callback_itemClicked = opts.callback_itemClicked || callback_itemClicked;

        callback_itemSelected = opts.callback_itemSelected || callback_itemSelected;

        //Called when look up is displayed.
        callback_displayLookup = opts.callback_displayLookup || callback_displayLookup;

        //Set the close lookup call back.
        callback_closeLookup = opts.callback_closeLookup || callback_closeLookup;

        //Set the get position call back - if none is provided use the default.
        callback_getposition = opts.callback_getposition || callback_getposition;




        /***********************************************/
        /**********CALL BACK FUNCTIONS *****************/

        //Set auto-complete on/off - if none is provided set it to default.
        useAutoCompleteOnKeyPress = opts.useAutoCompleteOnKeyPress || useAutoCompleteOnKeyPress;

        //Set auto-complete delay- if none is provided set it to default.
        autoCompleteOnKeyPressDelay = opts.autoCompleteOnKeyPressDelay || autoCompleteOnKeyPressDelay;

        //Set the display search box option.
        displaySearchBox = opts.displaySearchBox || displaySearchBox;

        lookupPath = opts.lookupPath || lookupPath;

        enableAnimation = opts.enableAnimation || enableAnimation;


        idDivLookup = opts.idDivLookup || idDivLookup;
        idDivLookupJQ = "#" + idDivLookup;

        idSearchBox = opts.idDivLookup + "_SB";
        idSearchBoxJQ = "#" + idSearchBox;

        idDivLookupItems = opts.idDivLookup + "_LUI";
        idDivLookupItemsJQ = "#" + idDivLookupItems;

        idDivLookupItemsLoading = opts.idDivLookup + "_LUIL";
        idDivLookupItemsLoadingJQ = "#" + idDivLookupItemsLoading;



        //Initialize the stop watch object if we are using auto complete.
        if (useAutoCompleteOnKeyPress) {
            initializeTimer();
        }


    }

    //Initialize the stopwatch object
    function initializeTimer() {
        //stopWatch = new DS.Utility.timer.Stopwatch(autoCompleteOnKeyPressDelay, onTimerCallBack, false);
    }




    //The function is called when the auto-complete timer finishes.
    function onTimerCallBack() {
        populateResults();
    }


    //Function used to check if the search box value has been modified (for example key event might be raised but the value is not modified).
    //Returns true if the previousSearchValue is different to the text box current value.
    function hasSearchBoxValueChanged() {
        var retvalue = false;
        var newValue = $(idSearchBoxJQ).val();

        if (previousSearchValue !== newValue)
            retvalue = true;

        return retvalue;
    }

    //The function returns true if the passed value exists in the list of look up items.
    function isValueAMatchInLookupItems(value) {

        var item = null;

        if (value.length > 0) {
            var items = $(idDivLookupItemsJQ + " .ds-nav-lu-results-li-item-name");
            for (var i = 0; i < items.length; i++) {

                var path = $(items[i]).data("path");

                if (value.toLowerCase() == path.toLowerCase()) {

                    item = items[i];

                    break;
                }
            }


        }


        return item;
    }


    //The function is called to handle the selection of an item in the search box on key down event
    function handleEnterKeyDownInSearchBox() {
        var value = $(idSearchBoxJQ).val();

        var item = isValueAMatchInLookupItems(value);

        //If it is match we select the item
        if (item !== null) {
            selectItem(item);

        } else {
            if (useAutoCompleteOnKeyPress == false) {
                populateResults();
            }

        }


    }

    //handles the key up event.
    function keyUpHandler(event) {
        //If the search text box has the focus
        var isSearchBoxFocus = false;

        isSearchBoxFocus = isFocusElement(idSearchBox);

        if (isSearchBoxFocus) {

            if (hasSearchBoxValueChanged())
                startTimer();
        }
    }

    //handles the key down event.
    function keyDownHandler(event) {
        //If the search text box has the focus
        var isSearchBoxFocus = false;

        isSearchBoxFocus = isFocusElement(idSearchBox);

        if (isSearchBoxFocus) {
            stopTimer();
        }


        switch (event.which) {

            //enter
            case 13:
                if (isSearchBoxFocus) {
                    handleEnterKeyDownInSearchBox();
                }

                break;

                //space
            case 32:
                if (!isSearchBoxFocus) {
                    var activeItem = $(idDivLookupItemsJQ + " .ds-nav-lu-results-activeitem .ds-nav-lu-results-li-item-name");
                    selectItem(activeItem);
                }

                break;

            case 37: // left
                if (!isSearchBoxFocus) {
                    navigateBack();
                }

                break;

            case 38: // up
                traverseList(false);
                scrollActiveItem();
                break;

            case 39: // right
                if (!isSearchBoxFocus) {

                    var activeItem = $(idDivLookupItemsJQ + " .ds-nav-lu-results-activeitem .ds-nav-lu-results-li-item-name");
                    if (activeItem.length > 0) {
                        navigateTo(activeItem.eq(0));
                    }
                }


                break;

            case 40: // down
                traverseList(true);
                scrollActiveItem();
                break;

            default: return; // exit this handler for other keys
        }

    }



    //Handles the mouse up event.
    function mouseUpHandler(event) {

        var target = event.target;
        var sourceId = "#" + $(sourceCtrl).attr("id");


        var visible = $(idDivLookupJQ).is(":visible");


        var validForThisCtrl = $(event.target).parents(sourceId).length > 0;

        //validForThisCtrl - if True this means the mouse event was raised when clicked on the source (or one of the kids)
        //if False - this means the event was raised when clicked outside.

        if (validForThisCtrl && displayNavigationControl(event, visible)) {

            var text = getItemText(target);
            displayLookup(text, target);
        }
        else {

            var lookup = $(idDivLookupJQ);

            //Clicked outside anywhere - so we hide the div
            if (!lookup.is(event.target) && lookup.has(event.target).length === 0) {

                closeLookup(event.target);

            }

            $(sourceCtrl).find(".ds-bc-nav-lu-caret").removeClass("fa-caret-down fa-caret-right ds-bc-nav-lu-caret-expand").addClass("fa-caret-right");

        }


    }

    //This function is called to determine if the lookup should be displayed when the mouse is clicked.
    //The first parameter is the event that triggered the function. 
    //The second parameter is the current state of the look up.
    function displayNavigationControl(event, isLookupVisible) {

        var retValue = false;

        var source = sourceCtrl;

        var id = "#" + $(source).attr("id");

        var visible = isLookupVisible;
        var clickedCaret = $(event.target).hasClass("ds-bc-nav-lu-caret");
        var clickedOnBC = $(id + " .ds-bc-nav-lu").is(event.target);



        //We will change the > caret to point down. For this we first remove all caret classes and add only the right ones.
        //This is the default state.
        $(id + " .fa-caret-down").removeClass("fa-caret-down fa-caret-right ds-bc-nav-lu-caret-expand").addClass("fa-caret-right");

        //For the clicked caret - remove the right caret, and add the down caret.
        if (clickedCaret) {
            $(event.target).removeClass("fa-caret-right");
            $(event.target).addClass("fa-caret-down ds-bc-nav-lu-caret-expand");
        }


        //First we check if the look up control is visible. If it is not visible it should only be displayed if we click ont he breadcrumb or the caret.
        //If the look up is visible we need to display it again if the caret is clicked otherwise we should hide it.

        if (!visible) {
            if (clickedOnBC || clickedCaret)
                retValue = true;
            else
                retValue = false;
        } else {
            if (clickedCaret)
                retValue = true;
            else
                retValue = false;
        }


        return retValue;
    }

    //The function returns the selected caret text
    function getSelectedTextForBreadCrumbItem(target) {
        var selectedCaretText = "";

        if ($(target).hasClass("ds-bc-nav-lu-caret")) {

            //The target is the caret <i> class - we go two levels up and then find the previous span element and get the text.
            var parent = $(target).parent();
            if (parent.length > 0) {
                parent = $(parent).parent();
            }

            if (parent.length > 0) {
                var element = $(parent).prev();

                if (element.length > 0) {
                    selectedCaretText = $(element).text();

                    if (selectedCaretText.length == 0)
                        selectedCaretText = "\\"; //implies its the first root level.
                }
            }

        }

        return selectedCaretText;
    }

    //The function is called when the source item text is required.
    function getItemText(target) {


        var source = sourceCtrl;

        //We try and find the caret that was clicked so we can display the path up to that level. The first step is to find the text for that caret level.
        var selectedCaretText = getSelectedTextForBreadCrumbItem(target);

        //Completed will be set to true if we find the max level we have to display in the lookup
        var completed = false;
        var text = "";

        //we get all items
        var id = "#" + $(source).attr("id");

        $(id + " .ds-bc-nav-lu-item").not(".ds-bc-defaultitem").each(function (i) {

            if (completed == false) {

                var txt = $(this).text().trim();

                if (txt.length > 0) {
                    text = text + txt + "\\";
                }


                if (selectedCaretText.length > 0 && (selectedCaretText.toLowerCase() == txt.toLowerCase() || selectedCaretText == "\\")) {
                    completed = true;
                }
            }

        });


        return text;
    }

    //Closes the look up window and removes the events.
    function closeLookup(target) {

        if (callback_closeLookup(target)) {

            $(idDivLookupJQ).hide();

            //clear variables
            previousSearchValue = "";

            //clear all the existing events.
            $(idDivLookupItemsJQ).off();

            //replace the div with items
            $(idDivLookupItemsJQ).html("");

            $(idDivLookupItemsJQ).html("").hide();
            $(idDivLookupItemsLoadingJQ).show();

        }
    }

    //The function displays the look up with the text.
    function displayLookup(text, target) {

        if (callback_displayLookup(text, target)) {


            //position the element
            var top = $(target).position().top;
            top = top + 30;

            var left = $(".fa-home").position().left;

            var retobj = callback_getposition(target, left, top);

            left = retobj.left;
            top = retobj.top;

            $(idDivLookupJQ).css({
                top: top + "px",
                left: left +"px"
            });

            //Set the text in the search box
            $(idSearchBoxJQ).val(text);

            if (enableAnimation) {
                //Display the look up
                $(idDivLookupJQ).fadeIn(function () {

                    $(idSearchBoxJQ).focus().val($(idSearchBoxJQ).val());
                    populateResults();
                })
            }
            else {
                $(idDivLookupJQ).show();
                $(idSearchBoxJQ).focus().val($(idSearchBoxJQ).val());
                populateResults();
            }
               
        }
    }

    //Returns true if the focus element id matches the passed id
    function isFocusElement(id) {
        var focusElement = $(':focus');
        return focusElement.length > 0 && focusElement.attr("id") !== undefined && focusElement.attr("id").toLowerCase() == id.toLowerCase();
    }

    //If passed true, displays the loading div and hides the items div.
    function showLoadingDiv(display) {

        if (display) {
            $(idDivLookupItemsLoadingJQ).show();
            $(idDivLookupItemsJQ).hide();
        }
        else {

            $(idDivLookupItemsLoadingJQ).hide();
            $(idDivLookupItemsJQ).show();

            if (enableAnimation) {
                var $items = $(".ds-nav-lu-results-ul");
                $items.css({ left: $items.outerWidth() });

                $items.animate({ left: 0 }, 300, function () {

                });
            }
        }
    }



    //The function displays the look up items
    function displayLookupItems(data) {
        //clear all the existing events.
        $(idDivLookupItemsJQ).off();


        //**NEW**
        data = createLookupItems(data);

        //replace the div with items
        $(idDivLookupItemsJQ).html(data);

        showLoadingDiv(false);




        //This has better performance because we are attaching only event on the parent and then all the kids are raising that event and jquery is doing the selector for LI and calling our function.
        $(idDivLookupItemsJQ).on("mousemove",
                          "li",
                          function () {
                              var activeItem = $(idDivLookupItemsJQ + " .ds-nav-lu-results-activeitem");
                              activeItem.removeClass("ds-nav-lu-results-activeitem");
                              $(this).addClass("ds-nav-lu-results-activeitem");

                          });

        $(idDivLookupItemsJQ).on("click",
                         ".ds-nav-lu-results-li-item-name",
                         function (event) {

                             //var activeItem = $(idDivLookupItemsJQ + " .ds-nav-lu-results-activeitem");
                             //activeItem.removeClass("ds-nav-lu-results-activeitem");
                             //$(this).addClass("ds-nav-lu-results-activeitem");

                             selectItem(this);

                         });


        $(idDivLookupItemsJQ).on("click",
                        ".ds-nav-lu-results-li-item-navigate",
                        function () {


                            var activeItem = $(this).parents("li").first().find(".ds-nav-lu-results-li-item-name").first();

                            if (activeItem.length > 0) {
                                navigateTo(activeItem.eq(0));
                            }

                        });

        $(idDivLookupItemsJQ).on("click",
                  ".ds-nav-lu-results-li-item-back",
                  function () {
                      navigateBack();

                  });






        //reset the scroll list.
        $(idDivLookupItemsJQ + ' .ds-nav-lu-results').scrollTop(0);
    }

    //Selects the item and closes the list.
    function selectItem(item) {
        var path = $(item).data("path");

        lookupPath = path;

        lookupPath = lookupPath.replace(/\\/g, "/");

        createLookupBC();
        closeLookup(item);

        if (callback_itemSelected !== undefined || callback_itemSelected !== null) {
            callback_itemSelected(lookupPath)
        }



    }

    //Error handler for ajax request
    function errorHandler(err) {
        showLoadingDiv(false);


    }

    //The function creates an Ajax request and populates the results.
    function populateResults() {



        //display the loading div
        showLoadingDiv(true);

        //get the path
        var value = $(idSearchBoxJQ).val();
        previousSearchValue = value; //store this value in the previous value.


        getData(value);


    };

    function getData(value) {

        if (callback_getdata != null) {

            //if callback is defined call the getdata function.
            callback_getdata(value, displayLookupItems, errorHandler);
        }

    }

    //navigates up a level by removing \ from the path and populating the results
    function navigateBack() {

        var text = $(idSearchBoxJQ).val();
        var idx = text.lastIndexOf("\\");


        //we remove the last \
        if (idx >= 0) {

            text = text.substring(0, idx);

            //now we remove the name so it displays all items otherwise filtering will only show that specific item due to starts with match
            var idx = text.lastIndexOf("\\");

            if (idx >= 0) {
                text = text.substring(0, idx + 1);
            }
            else {
                text = "";
            }

        }

        $(idSearchBoxJQ).val(text);

        populateResults();
    };

    //navigates to the specific item, by adding it to the path and populating the results.
    function navigateTo(activeItem) {

        var text = $(activeItem).text();
        var path = $(activeItem).data("path");
        var children = parseInt($(activeItem).data("children"));

        if (children > 0) {

            path = path + "\\";
            $(idSearchBoxJQ).val(path);
            populateResults();
        }

    }

    //goes through the list item up or down depending on keyboard navigation. If down = true, the item next in the list is selected (or the first).
    //if down = false, the previous item in the list is selected.
    function traverseList(down) {

        $(idSearchBoxJQ).blur();

        var item = $(idDivLookupItemsJQ + " li");
        var activeItem = $(idDivLookupItemsJQ + " .ds-nav-lu-results-activeitem");


        //if there are no selected item always select the first one.
        if (activeItem.length == 0) {

            if (item.length > 0) {
                item.removeClass("ds-nav-lu-results-activeitem");
                $(item[0]).addClass("ds-nav-lu-results-activeitem");

            }
        }
        else {
            //we have an item selected.
            activeItem.removeClass("ds-nav-lu-results-activeitem");


            //key down was pressed
            if (down) {

                var nextItem = activeItem.next();//if down key was pressed get next item

                //If we have select next item, else select the first one.
                if (nextItem.length > 0) {
                    nextItem.addClass("ds-nav-lu-results-activeitem");
                }
                else {
                    $(item.eq(0)).addClass("ds-nav-lu-results-activeitem");

                }//

            }
            else {
                var prevItem = activeItem.prev();//otherwise up key was pressed, get prev item

                //If we have select prev item, else select the last one.
                if (prevItem.length > 0) {
                    prevItem.addClass("ds-nav-lu-results-activeitem");
                }
                else {

                    var cnt = item.length;
                    $(item.eq(cnt - 1)).addClass("ds-nav-lu-results-activeitem");

                }//
            }



        }//else
    }

    //Wrapper functiont that calls scrollSelectedItem.
    function scrollActiveItem() {
        var item = $('.ds-nav-lu-results-activeitem');
        var container = $('.ds-nav-lu-results');
        var activeItem = $(idDivLookupItemsJQ + " .ds-nav-lu-results-activeitem");

        if (activeItem.length > 0)
            scrollSelectedItem(item, container);
    }

    //todo - change this function so it takes parameters of the item to select.
    //brings the currently active item into view.
    function scrollSelectedItem(item, container) {



        //Code taken from internet - refactored slightly.
        if (item.position().top + container.height() >= container.scrollTop() + container.height()) {

            container.scrollTop(item.position().top - container.height() + container.scrollTop())

        } else if (item.position().top <= container.scrollTop()) {

            container.scrollTop(0 + item.position().top)
        }

    }


    //creates the look up div.
    function createLookupDiv() {
        var TMPL_DIV = '<div id="{Id}" class="ds-nav-lu ds-nav-lu-custom" style="display:none">\
<input id="{idSearchBox}" class="ds-nav-lu-search ds-nav-lu-search-custom" type="text" />\
<div id="{idDivLookupItems}" class="ds-nav-lu-results" style="display:none"></div>\
<div id="{idDivLookupItemsLoading}" class="ds-nav-lu-results ds-nav-lu-results-loading" style="display:block">\
<span class="center-block ds-nav-lu-results-loading-container"><i class="fa fa-spinner fa-spin ds-nav-lu-results-loading-icon"></i></span></div></div>'

        var div = TMPL_DIV.replace("{Id}", idDivLookup).replace("{idSearchBox}", idSearchBox).replace("{idDivLookupItems}", idDivLookupItems).replace("{idDivLookupItemsLoading}", idDivLookupItemsLoading)

        $(sourceCtrl).after(div);

        if (displaySearchBox===false) {
            $(".ds-nav-lu-search").hide();
        }
    }

    //Creates the lookup items. 
    //Items must be an array which has a length property.
    //The item must be an object with the following properties.
    //Name
    //Path
    //AllowNavigation
    function createLookupItems(items) {

        var TMPL_UL = '<ul class="ds-nav-lu-results-ul">';

        var TMPL_BACK_ITEM = '<li class="ds-nav-lu-results-li">&nbsp;<strong class="ds-nav-lu-results-li-item"><a href="#" class="ds-nav-lu-results-li-item-back"> <i class="fa fa-level-up"></i> </a></strong></li>';

        var TMPL_ITEM = '<li class="ds-nav-lu-results-li"> <i class="fa fa-folder ds-nav-lu-results-li-item-foldericon"></i> <a href="#" class="ds-nav-lu-results-li-item-name" data-children="{Count}" data-path="{Path}">{NAME}</a></li>';

        var TMPL_NAV = '<strong class="ds-nav-lu-results-li-item"><a href="#" class="ds-nav-lu-results-li-item-navigate"> <i class="fa fa-chevron-circle-right"></i> </a></strong>';


        var ul = $(TMPL_UL);

        //Create the back button
        var li_back = $(TMPL_BACK_ITEM);

        //Append it
        $(ul).append(li_back);

        for (var i = 0 ; i < items.length; i++) {

            var item = items[i];

            var _path = item.Path;
            var _name = item.Name;
            var _allowNavigation = item.AllowNavigation;

            //Create the list item
            var li_item = $(TMPL_ITEM.replace("{Count}", items.length).replace("{Path}", _path).replace("{NAME}", _name));

            if (_allowNavigation == true) {
                //create the navigation
                var li_nav = $(TMPL_NAV);

                //append it to the li
                $(li_item).append(li_nav);
            }

            //Append the li_item to the ul
            $(ul).append(li_item);
        }


        return $(ul);
    }


    //Creates the display text when the look up is not displayed.
    function createLookupBC() {

        var TMPL_DIV = '<div class="ds-bc-nav ds-bc-nav-lu"></div>';

        var TMPL_HOME = '<span class="ds-bc-nav-lu-item"><a href="#"><i class="fa fa-home"></i></a></span><span><a href="#"><i class="fa fa-caret-right ds-bc-nav-lu-caret"></i></a></span>';

        var TMPL_BC = '<span class="ds-bc-nav-lu-item"><a href="{Url}">{Path}</a></span><span><a href="#"><i class="fa fa-caret-right ds-bc-nav-lu-caret"></i></a></span>';



        $(sourceCtrl).html("");
        $(sourceCtrl).off();

        var url = "#";

        var div = $(TMPL_DIV);

        div.append(TMPL_HOME);


        if (lookupPath.length > 0) {

            var _paths = lookupPath.split("/");

            for (var i = 0; i < _paths.length; i++) {

                var _path = _paths[i];

                var bc = TMPL_BC.replace("{Path}", _path).replace("{Url}", url);

                div.append(bc);
            }

        }

        $(sourceCtrl).append(div);

        $(sourceCtrl).on("click",
                 ".ds-bc-nav-lu-item",
                 function () {
                     callback_itemClicked($(this).text());

                 });



    }


    //Starts the timer that will call the onTimerCallBack function. this is triggered when the user will press and key.
    function startTimer() {


        var delay = autoCompleteOnKeyPressDelay;
        var callback = onTimerCallBack;

        if (autoCompleteOnKeyPressDelay) {

            stopTimer();

            timer = setTimeout(function () {
                callback();
                stopTimer();
            }, delay);
        }
    }

    //Stops the timer
    function stopTimer() {
        if (timer !== null && timer !== undefined)
            clearTimeout(timer);
    }

    return {
        Initialize: initialize
    }

};






//Extend jquery so that it contains a short cut to our look up control.
$.fn.extend({
    lookupIpodMenu: function (opts) {
        var lu = new LookupIpodMenu();
        opts.sourceCtrl = this;
        lu.Initialize(opts);
    }
});