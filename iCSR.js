/* iCSR - Client Side Rendering how IKEA would do it

 license: MIT

 http://iCSR.github.io

 History:
 december 2015 - first Proof of Concept

 Author/support information:
 Danny Engelman - danny@engelman.nl

 TODO:
 - load client templates inside iCSR
 - one config object declaration
 - Host demo version on 365CSI.com or CDN
 - counter image

 :view item by groupmembership

 JavaScript style notes

 - Global namespace iCSR holds all content
 - iCSR.fn = generic functions
 - iCSR.CFG = generic configurations
 - iCSR.SP = SharePoint related code (can be in other places as well)
 - iCSR.DO = methods to be called by user or code
 - iCSR.ctrl = constructors to be called by user (new iCSR.table) or other code

 - Global configurations
 (optional) iCSR.interactive true/false = indicates default setting to be used by all iCSR (screen) elements, this overrides custom setting

 */

//region JSHINT
/*global document,window,navigator,setTimeout,event*/
/*global console*/
/*global $*/

/*global SP,SPClientTemplates,_spPageContextInfo*/
/*global ClientPivotControl,RenderHeaderTemplate,RegisterModuleInit*/
/*global GenerateIIDForListItem, GetAncestor, AJAXRefreshView,ctx*/
/*global GenerateIID,GetDaysAfterToday,_spYield*/
/*jshint -W069*/ //allow ["notation"]
/*jshint -W030*/ //allow anonymous function
//endregion

//region Global overrides: GetAncestor
function GetAncestor(element, tagType) { //overloaded by SharePoint core.js implementation, declared because CSR code runs before core.js is loaded
    while (element !== null && element.tagName !== tagType) element = element.parentNode;
    return element;
}

//endregion

//noinspection JSUnusedAssignment
var iCSR = iCSR || {};
iCSR._ver = '0.0.3';
iCSR.Template = iCSR.Template || {}; //Template functions return HTML for easy execution in a CSR file
iCSR.SP = false;//placeholder SP sub-namespace
iCSR.fn = iCSR.fn || {}; //support functions
iCSR.DO = iCSR.DO || {}; //doable functions
iCSR.ctrl = iCSR.ctrl || {}; //controllers created with new ()

iCSR.init = function () {
    console.info('%c iCSR - Proof of Concept - ' + iCSR._ver + ' ', iCSR.CFG.colorBlueYellow + ';font-size:20px;');
    iCSR.traceon();
    if (SP) {
        SP.SOD.executeFunc("clienttemplates.js", "SPClientTemplates", function () {
            iCSR.trace(0, 'initialized SharePoint clienttemplates.js');
            iCSR.initTemplate('iCSR.Template', 'progressBar', 'display interactive progressBar');
            iCSR.initTemplate('iCSR.Template', 'priority', 'display interactive priorityoptions');
        });
    } else {
        iCSR.traceerror('no SharePoint environment');
    }
    if (!window.iC) {
        window.iC = iCSR;
    }
};

/**
 * TODO: implement more templated approach
 * @param iCSRnamespace
 * @param modulename
 * @param description
 * @returns {boolean}
 */
iCSR.initTemplate = function (iCSRnamespace, modulename, description) {
    if (iCSR.Template.hasOwnProperty(modulename)) {
        console.log(iCSRnamespace, modulename, description);
        return true;
    } else {
        //iCSR.traceerror('Missing: ', modulename);
    }
};

//region iCSR.CFG - global configuration Namespace, properties and methods                              ###    iCSR.CFG
iCSR.CFG = iCSR.CFG || { //configuration options
        colorBlueYellow: 'background:#005AA9;color:#FCD500;font-weight:bold;',
        tracing: true,
        colors: { //predefined colors for fieldnames
            "Default": ['', 'lightcoral', 'pink', 'orange', 'lightgreen'],
            "Priority": ['', 'lightcoral', 'pink', 'orange', 'lightgreen'],
            objectDescription: 'custom colors matching SharePoint internal fieldnames'
        },
        allowtokenfunctions: true, //a very weak option to optionally disallow the creation of tokenfuntions
        objectDescription: 'iCSR global configurations'

    };

iCSR.CFG.tokenfunctions = {};//if CFG.[token] does not exist, a corresponding function kan be executed
iCSR.CFG.hastokenfunction = function (functionname) {
    iCSR.trace(4, 'hastokenfunction:', typeof functionname, functionname);
    var hasFunction = false;
    if (typeof(functionname) === 'string') {
        functionname = functionname.split('(')[0];
        if (iCSR.CFG.tokenfunctions.hasOwnProperty(functionname)) {
            hasFunction = true;
        }
    }
    return hasFunction;
};


/**
 *
 * @param functionname
 * @param parameters
 * @param silent
 * @returns {*}
 */
iCSR.fn.executeTokenfunction = function (functionname, parameters, silent) {
    // TODO: (high) this opens up Script Injection!
    iCSR.trace(1, 'executeTokenfunction:', silent ? '(silent)' : '', functionname, '(', parameters, ')');
    var tokenfunctionResult;
    if (iCSR.CFG.allowtokenfunctions) {
        if (iCSR.CFG.hastokenfunction(functionname)) {
            try {
                var tokenfunction = iCSR.CFG.tokenfunctions[functionname];
                iCSR.trace(2, 'call: ', functionname, '(', parameters, ')\n', tokenfunction);
                tokenfunctionResult = tokenfunction.call(this, parameters);
            } catch (e) {
                iCSR.catch(e, 'executeTokenfunction:' + functionname);
            }
        } else {
            if (!silent) {
                iCSR.traceerror('Missing tokenfunction', '', functionname);
            }
        }
    } else {
        if (!silent) {
            iCSR.trace(0, 'Tokenfunctions disabled', functionname);
        }
    }
    return tokenfunctionResult;
};

/**
 *
 * @param circleSize
 * @param color
 * @returns {*}
 */
iCSR.CFG.tokenfunctions.svgcircle = function circle(circleSize, color) {
    var defaultcolor = color || '[color]';
    var html = "<svg height={0} width={0}><circle cx={1} cy={1} r={1} fill='{2}'/></svg>";
    html = String.format(html, circleSize, circleSize / 2, defaultcolor);
    return html;
};

//endregion iCSR.CFG

//region iCSR.info & iCSR.trace                                         ###    iCSR.info iCSR.traceon()  iCSR.traceoff()
iCSR.info = function () { //list all iCSR doable functions and methods
    var consoleObject = function (iCSRobject) {
        console.info('iCSR: ' + iCSR._ver, iCSRobject.objectDescription);
        for (var key in iCSRobject) {
            if (iCSRobject.hasOwnProperty(key)) {
                console.warn(key);
            }
        }
    };
    consoleObject(iCSR.Template);
    consoleObject(iCSR.ctrl);
};
iCSR.trace = function (tracelevel, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15) {
    //TODO: (low) refactor to get rid of those ugly vars
    var p1 = '';
    if (tracelevel === 'string') {
        tracelevel = 0;
        p1 = tracelevel;
    }
    var tracelevelcolors = ['background:beige;', 'background:green', 'background:lightgreen', 'background:lightcoral;'];
    var tracelevelcolor = tracelevelcolors[tracelevel];
    if (iCSR.CFG.errorcount < 1) {
        if (iCSR.CFG.tracing && console && iCSR.tracelevel >= tracelevel) {
            console.info('%c iCSR ' + '%c ' + tracelevel + ' ' + p1 + '', iCSR.CFG.colorBlueYellow, tracelevelcolor, p2 || '', p3 || '', p4 || '', p5 || '', p6 || '', p7 || '', p8 || '', p9 || '', p10 || '', p11 || '', p12 || '', p13 || '', p14 || '', p15 || '');
        }
    }
};
iCSR.traceend = function (tracelevel, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15) {
    iCSR.CFG.errorcount++;
    iCSR.trace(tracelevel, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15)
};
iCSR.traceerror = function (p1, p2, p3, p4, p5, p6, p7, p8) {
    iCSR.CFG.errorcount++;
    if (console) console.error('%c iCSR ' + p1, 'background:lightcoral;color:black;', p2 || '', p3 || '', p4 || '', p5 || '', p6 || '', p7 || '', p8 || '');
};
iCSR.tracewarning = function (p1, p2, p3, p4, p5, p6, p7, p8) {
    if (console) console.warn('%c iCSR:' + p1, 'background:orange;color:brown', p2 || '', p3 || '', p4 || '', p5 || '', p6 || '', p7 || '', p8 || '');
};
//iCSR.tracelevel = 0; //1 to 3 for more and more detailed console tracing
iCSR.traceon = function (setlevel) {
    if (typeof setlevel === 'undefined')setlevel = 1;
    iCSR.tracelevel = setlevel || 0; //default tracelevel
    iCSR.CFG.tracing = true; //extra information in the F12 Developer console
    iCSR.CFG.errorcount = 0;
    return true;
};
iCSR.traceoff = function (setlevel) {
    iCSR.CFG.tracing = setlevel ? iCSR.traceon(setlevel) : false; //disable tracing
};
iCSR.catch = function (e, functionname, functionreference) { //generic try/catch error reporting
    // Compare as objects
    if (e.constructor === SyntaxError) {
        iCSR.traceerror(functionname, 'programming error!', functionreference); // There's something wrong with your code, bro
    }
    // Get the error type as a string for reporting and storage
    iCSR.traceerror(functionname, e.constructor.name, functionreference, e); // SyntaxError
};
//endregion

//region iCSR.fn - String utility functions                                                              ###    iCSR.fn

iCSR.fn.nowordbreak = function (s) { //replaces space with nonbreakingspaces
    return (s.replace(/ /gi, '&nbsp;'));
};
/**
 *
 * @param value
 * @returns {*}
 */
iCSR.fn.label = function (value) {// (1) Label => Label
    //TODO make generic wih regex to process [n] Label and (1)Label return Object {nr:nr,label:label}
    var valuemarker = ') ',
        label = value.indexOf(valuemarker) > 0 ? value.split(valuemarker)[1] : value;
    return (label);
};


/**
 * "Hello [var]" -> 'Hello','var',
 *
 * @param str
 * @param identifiers
 * @returns {string[]|*|Array}
 */
iCSR.fn.tokenArray = function (str, identifiers) {
    //TODO: (normal) fix nested word[[token]]word issue : 'word','[token',']' - probably escape both tokens or something
    //TODO: (low) rewrite to fix "[var]var[var]" which replaces all occurences (minor issues?)
    var regexArray = ['(.+?)'];//match any wordlength
    identifiers = identifiers || '[]';//default
    var chunksize = parseInt(identifiers.length / 2);//split indentifiers in 2 parts
    identifiers = identifiers.match(new RegExp('.{1,' + chunksize + '}', 'g'));//split in chunck size
    var tokenized = str;
    if (identifiers.length === 2) {
        regexArray.unshift('\\' + identifiers[0]);//add escaped leading identifier
        regexArray.push('\\' + identifiers[1]);//add second escaped identifier
        var regExpStr = regexArray.join('');
        var regExp = new RegExp(regExpStr, 'g');
        tokenized = str.split(regExp);
        //TODO: (normal) post process tokenized, delete undefined references?
    } else {
        iCSR.traceerror('invalid identifiers', identifiers);
    }
    return tokenized;
};

/**
 *
 * @returns {*}
 * @param _string
 * @param tokensconfig
 */
iCSR.fn.replacetokens = function (_string, tokensconfig) { //replace 'Hello [location]!' with propertyvalue from tokensconfig {location:'World'}  => 'Hello World!'
    if (!_string) return _string;

    tokensconfig = tokensconfig || this; //tokens defined in .bind(config)
    var replacetoken = function (token) {
        var _tokenized = token;
        if (tokensconfig.hasOwnProperty(token)) {
            _tokenized = tokensconfig[token]; // predefined tokens defined in .config object take precedence over token
            if (typeof _tokenized === 'function') {
                //TODO: (normal) ?? do we want to allow script creation... cool to investigate how far this would lead
            }
        }
        if (iCSR.CFG.hastokenfunction(_tokenized)) {
            var functionDef = iCSR.fn.tokenArray(token, '()');//token functions like: svgcircle(20)
            var functionname = functionDef[0];
            var parameters = functionDef[1];
            _tokenized = iCSR.fn.executeTokenfunction(functionname, parameters);
        }
        if (token === _tokenized) {
            var strippedtoken = token.replace(/[^a-z0-9+]+/gi, '');
            if (strippedtoken === token) {//token is not declared yet
                _tokenized = '[' + token + ']';
                iCSR.trace(3, 'replacetoken', '(' + typeof _string + ') UNTOUCHED: ', _tokenized);
            }
        } else {
            iCSR.trace(3, 'replacetoken', '(' + typeof _string + ') : ', token, '\n', _tokenized);
        }
        return _tokenized;
    };
    var tokenized = iCSR.fn.tokenArray(_string, '[]');//make array
    iCSR.trace(3, 'tokenized', '\n', tokenized);
    tokenized = tokenized.map(replacetoken);//process all array elements
    tokenized = tokenized.join('');//make it one string again
    iCSR.trace(2, 'replacetokens', '(' + typeof _string + ')\n', _string, '\n', tokenized);
    return tokenized;
};

/**
 * use default colors or default colors for this fieldName
 * @param ctx
 * @returns {string[]}
 */
iCSR.fn.getColors = function (ctx) {
    var _fieldname = ctx.CurrentFieldSchema.Name,
        _colors = iCSR.CFG.colors.Default;
    if (iCSR.CFG.colors.hasOwnProperty(_fieldname)) {
        _colors = iCSR.CFG.colors[_fieldname];
    }
    iCSR.trace(2, 'getColors', _fieldname, _colors);
    return _colors;
};
//endregion

//region iCSR.fn - SharePoint related code                                                                  ### iCSR.fn

/**
 *
 */
iCSR.fn.fixedListViewHeader = function () { //create fixed header with scrolling body
    //  document.querySelectorAll("tr[class*='ms-viewheadertr']");
};
/**
 *
 * @returns {Array}
 */
iCSR.fn.fieldnames = function () { //return the internal fieldnames in the ctx object
    return ctx.ListSchema.Field.map(function (field) {
        return (field.Name);
    });
};

/**
 * get the fieldvalue from the ctx object
 *
 * @param ctx
 * @returns {string}
 */
iCSR.fn.getfieldvalue = function (ctx) {
    iCSR.trace(2, 'getfieldvalue:', typeof ctx, typeof ctx === 'string' ? ctx : ctx.CurrentFieldSchema.Name);
    return (typeof ctx === 'string' ? ctx : ctx.CurrentItem[ctx.CurrentFieldSchema.Name]);
};

iCSR.fn.configValue = function (configobject, property, defaultvalue) {
    var value = defaultvalue;
    if (configobject && configobject.hasOwnProperty(property)) {
        value = configobject[property];
    }
    return value;
};
/**
 *
 * @param ctx
 * @param initialconfig
 * @param bindconfig
 * @returns {{}}
 */
iCSR.fn.getconfig = function (ctx, initialconfig, bindconfig) {
    var key = '', config = {}; //new config object so we do not work with this references
    function mergeConfig(addconfig) {//TODO: (high) this is a shallow copy
        for (key in addconfig) if (addconfig.hasOwnProperty(key)) {
            config[key] = addconfig[key]; //defaultsetting
        }
    }

    try {
        bindconfig = bindconfig.hasOwnProperty('FieldType') ? {} : bindconfig; //get optional config from .bind()
        bindconfig.trace > 0 ? iCSR.traceon(bindconfig.trace) : iCSR.traceoff(iCSR.tracelevel);

        mergeConfig(initialconfig); //defaultsetting
        mergeConfig(bindconfig); //overwrite default settings
        //global configuration options
        if (iCSR.hasOwnProperty('interactive')) config.interactive = iCSR.interactive;

        //Share specific configuration
        config.Name = ctx.CurrentFieldSchema.Name;
        config.value = ctx.CurrentItem[config.Name]; //initial value
        config.valuenr = config.value.match(/(\d+)/g); //get all digits from string as array
        config.valuenr = (config.valuenr && config.valuenr.length > 0) ? config.valuenr / 1 : false;
        config['valuenr-1'] = config.valuenr - 1;
        config.shortlabel = config.valuenr ? iCSR.fn.label(config.value) : config.value; //if a valuenr then shorten it
        config.ID = ctx.CurrentItem.ID;
        return (config);
    } catch (e) {
        iCSR.traceerror('getconfig', e, key, config);
    }
};

/**
 *
 * @param config
 * @param template
 * @returns {iCSR.CFG.priority.templates.default.CSS|{container, containerDiv, choice, choicehover, iCSRdescription}|iCSR.CFG.priority.templates.iCSRbar.CSS|{container, containerDiv, currenttext, currentlabel, choice, choicehover, iCSRdescription}|{}|*}
 */
iCSR.fn.getconfigCSS = function (config, template) {//TODO (high) refactor getconfigCSS
    var rules = config.rules || [];
    var CSS = template.CSS || {};

    function addrule(rule) {
        rule = iCSR.fn.replacetokens(rule, config);
        rules.push(rule);
    }

    if (typeof template.CSS === 'string') CSS = config.templates[template.CSS];
    //iCSR.CSS.addconfigCSS(typeof template.CSS === 'string')?config.templates[template.CSS]:template.CSS;)
    for (var key in CSS) {
        if (CSS.hasOwnProperty(key) && key !== 'iCSRdescription') addrule(CSS[key]);
    }
    iCSR.CSS.addStylesheetWithRules(config.iCSRid, rules, true);
    //iCSR.CSS.addconfigCSS = function (CSS) {
    //    var CSS = CSS || {};
    //}
    return CSS;
};

//endregion

//region iCSR.CSS - CSS operations                                                              ###     iCSR.CSS
/*

 resources:
 http://www.cssscript.com/animated-progress-indicators-with-vanilla-javascript-and-css/
 */
iCSR.CSS = {}; //CSS storage and actions
iCSR.CSS.doc = {
    appendStyleSheettoHEAD: [],
    insertRuleinStyleSheet: [],
    insertRulesfromArray: [],
    addStylesheetWithRules: []
};
iCSR.CSS.sheets = {};//TODO: more interactie CSS processing/changes; refactor to new iCSR.CSS.sheet();
/**
 *
 * @param id
 * @returns {Element}
 */
iCSR.CSS.appendStyleSheettoHEAD = function (id) {
    var _styleEl = document.createElement("STYLE");
    _styleEl.id = id; // _styleEl.setAttribute("media", "only screen and (max-width : 1024px)")
    _styleEl.appendChild(document.createTextNode("")); // WebKit hack :(
    document.head.appendChild(_styleEl);
    iCSR.trace(2, 'added stylesheet', _styleEl.id);
    return _styleEl;
};
iCSR.CSS.insertRuleinStyleSheet = function (rule, element) {
    //TODO: element=element||this;//to bind(element)
    if (element) {
        try {
            element.sheet.insertRule(rule, 0);
        } catch (e) {
            iCSR.tracewarning('ignoring CSS definition:', '"' + rule + '"');
        }
    } else {
        iCSR.traceerror('Not a STYLE sheet', element);
    }
};
iCSR.CSS.insertRulesfromArray = function (element, rules) {
    if (element && element.tagName === 'STYLE') {
        rules.forEach(function (rule) {
            iCSR.CSS.insertRuleinStyleSheet(rule, element);
        });
    } else {
        iCSR.traceerror('Not a STYLE element:', element);
    }
};
/**
 *
 * @param id
 * @param rules
 * @param reload
 * @param unique
 */
iCSR.CSS.addStylesheetWithRules = function (id, rules, reload, unique) {
    try {
        var _styleEl = document.getElementById(id); //get stylesheet with id
        if (reload || unique || !_styleEl) { //attach style only once
            if (reload && _styleEl) _styleEl.parentNode.removeChild(_styleEl);
            _styleEl = iCSR.CSS.appendStyleSheettoHEAD(id);
            iCSR.CSS.insertRulesfromArray(_styleEl, rules);
        }
    } catch (e) {
        iCSR.catch(e, 'iCSR.CSS.addStylesheetWithRules', id, rules);
    }
};
//endregion iCSR.CSS

//region iCSR.SP - SharePoint interactions using JSOM / REST                                             ###    iCSR.SP
//TODO: (high) How does this compare with SPUtility https://sputility.codeplex.com/ (last update feb 2015)

iCSR = iCSR || {};
iCSR.SP = {}; //namespace for SP related stuff

//SOD functions
//https://msdn.microsoft.com/en-us/library/office/ff408081(v=office.14).aspx

/**
 *
 * @param listID
 * @param ID
 * @param fieldname
 * @param value
 * @param successFunc
 * @param errorFunc
 */
iCSR.SP.UpdateItem = function (listID, ID, fieldname, value, successFunc, errorFunc) {
    //TODO: (high) make it work with other (site) context
    //TODO: spinner on save
    event && event.preventDefault();
    event && event.stopPropagation();
    listID = listID || SP.ListOperation.Selection.getSelectedList();
    var context = SP.ClientContext.get_current(); //TODO: (low) use REST instead of JSOM sometime
    var web = context.get_web();
    var list = web.get_lists().getById(listID);
    var item = list.getItemById(ID);
    context.load(item);
    item.set_item(fieldname, value);
    item.update();
    iCSR.trace(2, 'iCSR.SP.UpdateItem', ID, fieldname, value);
    successFunc = successFunc || function () {
            iCSR.trace(1, 'SP.UpdateItem', ID, fieldname, value);
            iCSR.SP.refreshView();
        };
    errorFunc = errorFunc || function () {
            iCSR.traceerror('Error Updating');
        };
    context.executeQueryAsync(successFunc, errorFunc);
};

/**
 *
 * @param ID
 * @param authorID
 */
iCSR.SP.setAuthor = function (ID, authorID) { //TODO: (high) test
    //ctx.ListData.Row.forEach(function (row) {
    //	console.log('ItemID:', row.ID, 'Author', row.Author[0]);
    //	setAuthor(row.ID, _spPageContextInfo.userId);
    //});
    //noinspection JSPotentiallyInvalidConstructorUsage
    var clientContext = new SP.ClientContext.get_current(),
        list = clientContext.get_web().get_lists().getById(SP.ListOperation.Selection.getSelectedList()),
        item = list.getItemById(ID);
    clientContext.load(item);
    item.set_item('Author', authorID);
    item.update();
    clientContext.executeQueryAsync(
        function () {
            AJAXRefreshView({
                currentCtx: ctx,
                csrAjaxRefresh: true
            }, 1);
        },
        function (s, a) {
            iCSR.traceerror(a.get_message());
        }
    );
};

/**
 * standard SharePoint refresh ListView
 * http://www.eliostruyf.com/ajax-refresh-item-rows-in-sharepoint-2013-view/
 *
 * @param clientContext
 * @param refreshall
 */
iCSR.SP.refreshView = function (clientContext, refreshall) {
    clientContext = clientContext || ctx;
    if (clientContext) {
        clientContext.skipNextAnimation = !refreshall || true; // If set to false all list items will refresh
        AJAXRefreshView({
            currentCtx: clientContext,
            csrAjaxRefresh: true
        }, 1); //1=SP.UI.DialogResult.OK
    }
};

/**
 * @param renderCtx
 * @param fRenderHeaderColumnNames
 */
iCSR.SP.renderHeaderTemplate = function (renderCtx, fRenderHeaderColumnNames) { //change the View Selector to display ALL Views
    //console.log(renderCtx.ListSchema.ViewSelectorPivotMenuOptions);
    //noinspection JSUnresolvedVariable
    var viewData = JSON.parse(renderCtx.ListSchema.ViewSelectorPivotMenuOptions);//jshint ignore:line
    //noinspection JSUnusedGlobalSymbols
    ClientPivotControl.prototype.SurfacedPivotCount = viewData.length - 3; //display all View options except 'Create View' & 'Modify View'
    return RenderHeaderTemplate(renderCtx, fRenderHeaderColumnNames); //render default Header template
};
iCSR.SP.isGroupHeader = function (ctx) {
    var property = ctx.CurrentFieldSchema.Name + '.COUNT.group'; // '.groupHeader'
    return ctx.CurrentItem.hasOwnProperty(property);
};

//endregion

//region iCSR.DOM -  Generic DOM functions (related to SharePoint DOM structure, ids etc.)       ### iCSR.DOM

iCSR = iCSR || {};
iCSR.DOM = {}; //namespace for SP related stuff
iCSR.DOM.fn = {}; //namespace for SP related stuff
iCSR.DOM.ctrl = {}; //namespace for SP related stuff

/**
 *
 * @param id
 * @param callback
 * @param yieldtime
 */
iCSR.DOM.waitforelement = function (id, callback, yieldtime) { //  Wait for a DOM element with id to exist, then execute callback function
    //yieldtime is not a fix millesonds but decreases by 1 millesecond on every loop, so 1000 milliseconds to start with runs for some time!
    var element = document.getElementById(id);
    if (element) { //if the element exists, execute callback by putting it at end of the event queue; not using 'callback(element)'
        setTimeout(callback.bind(null, element), 0);
    } else {
        if (yieldtime < 0) { //if done waiting then something is wrong
            iCSR.traceerror('iCSR.DOM.waitforelement failed:', id);
        } else { //we're getting less and less patient.. is that element there yet?
            setTimeout(iCSR.DOM.waitforelement.bind(null, id, callback, yieldtime - 1), yieldtime || 100);
        }
    }
};

/**
 * Usage: in OnPostRender
 * new iCSR.DOM.ctrl.attachAllOption( 'Colors' );
 *
 * @param fieldname
 * @param allLabel
 */
iCSR.DOM.ctrl.attachAllOption = function (fieldname, allLabel) {
    allLabel = allLabel || 'All ' + fieldname;
    var self = this,
        allid = "selectAll_" + fieldname,
        allinput = document.getElementById(allid);
    this.elements = document.querySelectorAll('input[id^=' + fieldname + '][id*="MultiChoiceOption"]');
    this.options = [].map.call(this.elements, function (element) { //make array of DOM node objects
        return (element);
    });
    this.selectall = function () {
        var checkall = this.checked; //checked state of the All option
        self.options.forEach(function (option) { //loop all options
            option.checked = checkall;
        });
    };
    if (!allinput) { //only attach All option once
        var tr = document.createElement('TR');
        tr.innerHTML = String.format("<td><input id='{0}' type='checkbox'><label for='{0}'>{1}</label></td>", allid, allLabel);
        GetAncestor(this.options[0], 'TBODY').appendChild(tr);
    }
    allinput = document.getElementById(allid);
    allinput.addEventListener("click", this.selectall);
};

//endregion iCSR.DOM

//region iCSR.Template - change Browser or SharePoint states *************************************/

//region iCSR.Template.colordate
/**
 *
 * @param ctx
 * @returns null
 */
iCSR.Template.colorDate = function (ctx) {
    if (!ctx) {
        console.warn('iCSR.Template.colorDate.bind({[config]})');
        return null;
    }
    var id = GenerateIID(ctx), //TR id
        ranges = (this.ranges || '#f55,-21,#f7a,-14,#fab,-7,#fda,-10,pink,0,#cf9,7,#9fa').split(','), //default range
        labels = this.labels || ['No Due Date', 'days left', 'days past'], //default labels
        color = 0, //first defined color in range
        fieldschema = ctx.CurrentFieldSchema, //store so it can be used inside the waitforelement function
        value = ctx.CurrentItem[fieldschema.Name],
        days = GetDaysAfterToday(new Date(value));
    var colorelement = this.element || 'TD';
    while (Number(ranges[color + 1]) < days) color += 2; //loop to find color
    //noinspection JSUnusedLocalSymbols
    iCSR.DOM.waitforelement(id, function () { //TODO: (low) CSR fix elementfound (tried it twice, ask on SO)
        var TR = document.getElementById(id); //temp fix, elementfound doesn't work
        var TD = TR.cells[fieldschema.counter - 1]; //current column
        if (Number(days))(colorelement === 'TD' ? TD : TR).style.backgroundColor = ranges[color];
    }, 10);
    var html = isNaN(days) ? labels[0] : "<div style='background-color:{0}'>{1} {2}</div>";
    return String.format(html, ranges[color], Math.abs(days), labels[days > 0 ? 1 : 2]);
};
//endregion

//region iCSR.Template.progressBar
/**
 *
 */
iCSR.CFG.progressBar = {
    CSSid: 'iCSRprogressBar', //class name for all progressBars
    colors: ['transparent', 'red', 'orangered', 'indianred', 'goldenrod', 'goldenrod', 'goldenrod', 'yellowgreen', 'mediumseagreen', 'forestgreen', 'green'],
    width: '180px',
    resourcelinks: 'https://jsfiddle.net/dannye/bes5ttmt/',
    objectDescription: 'iCSR progressBar configuration'
};

/**
 *
 * @param ctx
 */
iCSR.Template.progressBar = function (ctx) {
    var config = iCSR.fn.getconfig(ctx, iCSR.CFG.progressBar, this); //this = ctx.CurrentFieldSchema;//if not .bind() scope then this is CurrentFieldSchema
    config.cssreload = true; //force reloading of CSS when live-testing config settings
    config.barid = ctx.wpq + '_' + config.ID; //unique id to this progressBar//TODO (high) move to getconfig
    if (config.unique) config.CSSid += config.barid; //custom class for every progressBar
    if (!config.update) {
        iCSR.trace(2, 'using default SharePoint JSOM code to update', config.Name);
        config.update = function (progressBar) {
            SP.SOD.executeOrDelayUntilScriptLoaded(function updateProgress() {
                var listID = SP.ListOperation.Selection.getSelectedList();
                iCSR.SP.UpdateItem(listID, progressBar.config.ID, progressBar.config.Name, progressBar.value / 100);
            }, 'sp.js');
        };
    }
    return new iCSR.ctrl.progressBar(config).html();
};
//endregion

//region iCSR.Template.priority
//noinspection BadExpressionStatementJS,HtmlUnknownTarget
iCSR.CFG.priority = {
    iCSRid: 'Priority',
    trace: 4,//custom tracelevel for this template
    values: {
        '(1) High': 'lightcoral',
        '(2) Normal': 'orange',
        '(3) Low': 'lightgreen'
    },
    //colors: ['red', 'orange', 'green'],
    textcolor: 'black',
    interactive: iCSR.CFG.interactive || true,
    width: '110px', //total width
    widthCurrent: '50%',
    widthChoice: '15px', //width of the non Current Choice options
    html: '',
    Classcontainer: 'iCSRpriority_Container',
    Classcurrent: 'iCSRpriority_Current',
    Classchoice: 'iCSRpriority_Choice',
    clickupdate: "iCSR.SP.UpdateItem(false,'[ID]','[Name]','[keyvalue]');", //ID,Name,value
    layouts: '/_layouts/15/images/',
    template: 'iCSRbar',//default templates.nnn
    templates: {
        default: {
            container: "<div class='[Classcontainer]'>[html]</div>",
            item: "<span class='[classname]' style='color:[color]' onclick=\"[click]\">[label]</span>",
            CSS: {
                container: ".[Classcontainer] {}",
                containerDiv: ".[Classcontainer]>div {position:relative;float:left;}",
                choice: ".[Classchoice] {cursor:pointer;opacity:.2}",
                choicehover: ".[Classchoice]:hover {opacity:1;border-color:black}",
                iCSRdescription: 'reusable generic CSS for KPI indicators'
            }
        },
        iCSRbar: {
            item: "<div style='background-color:[color]' class='[classname]' onclick=\"[click]\">[label]</div>",
            CSS: { //object of strings with tokenized CSS definitions
                container: ".[Classcontainer] {width:[width];}",
                containerDiv: ".[Classcontainer]>div {position:relative;float:left;display:inline;border:1px solid grey}",
                currenttext: ".[Classcurrent] {font-size:11px;color:[textcolor]}",
                currentlabel: ".[Classcurrent] {width:[widthCurrent];text-align:center;padding:2px;}",
                choice: ".[Classchoice] {width:[widthChoice];cursor:pointer;opacity:.4}",
                choicehover: ".[Classchoice]:hover {opacity:1;border-color:black}",
                iCSRdescription: 'CSS for the iCSR default priority interaction'
            }
        },
        kpiCSR1: {
            item: "<span class='[classname]' onclick=\"[click]\"><img src='[layouts]/kpidefault-[nr].gif'></span>" //default sharepoint images in the layouts folder
        },
        kpiCSR2: {
            item: "<span class='[classname]' onclick=\"[click]\"><img src='[layouts]/kpipeppers-[nr].gif'></span>" //default sharepoint images in the layouts folder
        },
        kpiCSR3: {
            item: "<span class='[classname]' onclick=\"[click]\"><img src='[layouts]/kpipepperalarm-[nr].gif'></span>" //default sharepoint images in the layouts folder
        },
        kpiCSR4: {
            item: "<span class='[classname]' onclick=\"[click]\"><img src='[layouts]/kpinormal-[nr].gif'></span>" //default sharepoint images in the layouts folder
        }
    },
    iCSRdescription: 'iCSR priority configuration'
};
iCSR.fn.getconfigTemplate = function (config) {//TODO (high) refactor getconfigtemplate
    iCSR.trace(1, 'getconfigTemplate2', config.template);
    var ispredefinedtemplate = config.templates.hasOwnProperty(config.template);
    var template = config.templates.default;//start with default template
    if (ispredefinedtemplate) {
        var customtemplate = config.templates[config.template];//overwrite with customtemplate
        for (var key in customtemplate) {
            if (customtemplate.hasOwnProperty(key)) template[key] = customtemplate[key];
        }
    } else {
        template.item = iCSR.fn.replacetokens(config.template);
        //template.item = "<div class='[classname]' onclick=\\"[click]\\">" + config.template + "</div>";
    }
    //overwrite with userdefined template settings
    config.template = template;
    return template;
};

iCSR.Template.priority = function (ctx) {
    var config = iCSR.fn.getconfig(ctx, iCSR.CFG.priority, this); //this = ctx.CurrentFieldSchema;//if not .bind() scope then this is CurrentFieldSchema

    var replacetokens = iCSR.fn.replacetokens.bind(config); //bind the current config to the function

    var template = iCSR.fn.getconfigTemplate(config);
    var CSS = iCSR.fn.getconfigCSS(config, template);

    config.nr = "0"; //trick replacement in accepting first value as 0 string
//    iCSR.traceon(0);
    iCSR.trace(0, config.iCSRid, 'config.template =', config.template, '\n config:', config, '\n item:', template.item);
    iCSR.trace(1, 'CSS:', CSS);
    for (var keyvalue in config.values) { // jshint ignore:line, Object has those keyvalues
        config.keyvalue = keyvalue;
        var iscurrent = config.value === keyvalue;
        config.click = replacetokens(config.clickupdate);
        config.classname = config[iscurrent ? 'Classcurrent' : 'Classchoice'];
        config.color = config.colors ? config.colors[config.nr] : config.values[config.keyvalue];
        config.label = iscurrent ? config.shortlabel : '&nbsp;&nbsp;';
        var item = template.item || config.template;
        for (var nestedTokens = 0; nestedTokens < 3; nestedTokens++) item = replacetokens(item);
        if (iscurrent || config.interactive) config.html += item;
        config.nr++;
    }
    var html = config.interactive ? template.container : config.html;
    for (var nestedTokens = 0; nestedTokens < 3; nestedTokens++) html = replacetokens(html);
    console.log('html:', config.interactive, html);
    //TODO (high) fix trace per Template at end of template
    return html;
};

//endregion iCSR.Template.priority

//endregion iCSR.Template

//region iCSR.ctrl.table
/**
 *  iCSR CONTROL:table - start definition*****************************************************************
 *
 * @param ctx
 */
iCSR.ctrl.table = function (ctx) {
    ctx = ctx || window.ctx;
    var tableControl = this;
    tableControl.table = document.getElementById(ctx.clvp.tab.id);
    tableControl.columnNumbers = {};
    tableControl.columns = {};
    tableControl.columnNames = ctx.ListSchema.Field.map(function (field) {
        tableControl.columnNumbers[field.Name] = field.counter;
        tableControl.columns[field.Name] = {
            counter: field.counter,
            hidden: false
        };
        return (field.Name);
    });

    function getColumnArray(columns) {
        columns = typeof columns === 'object' ? columns : [columns]; //make sure it is an array
        return columns.map(function (column) { //make it an array of columnNRs
            return typeof column === "string" ? tableControl.columnNumbers[column] : column;
        });
    }

    //execute action on all rows and cells
    tableControl.actions = function (table, rowaction, cellaction) {
        Array.prototype.slice.call(table.rows).forEach(function (row, rownr) {
            rowaction && rowaction(row);
            Array.prototype.slice.call(row.cells).forEach(function (cell, colnr) {
                cellaction && cellaction(cell, rownr, colnr);
            });
        });
    };
    tableControl.hideheaders = function (el, hide) { //walk up the DOM to the table and hide the header row
        var headerRow = el ? GetAncestor(el, 'TABLE').firstChild : tableControl.table.firstChild;
        if (hide) {
            headerRow.style.visibility = 'hidden'; //hide headers
        } else {
            headerRow.style.display = 'none'; //hide headers
        }
    };
    tableControl.hideColumns = function (columns, display) { //array of mixed numbers/strings
        columns = getColumnArray(columns);
        display = display || 'none';
        //var table = document.getElementById(ctx.clvp.tab.id);
        tableControl.actions(tableControl.table, false,
            function (cell, rownr, colnr) {
                var name = tableControl.columnNames[colnr];
                if (columns.indexOf(colnr) > -1) {
                    cell.style.display = display;
                    console.log(name, tableControl.columns[name]);
                    tableControl.columns[name].hidden = display === 'none';
                }
            });
    };
    tableControl.showColumns = function () {
        tableControl.hideColumns(tableControl.columnNames, 'table-cell');
    };
    tableControl.colorColumns = function (columnNames, color) { //array of mixed numbers/strings
        tableControl.actions(tableControl.table, false, function (cell, rownr, colnr) {
            if (columnNames.indexOf(tableControl.columnNames[colnr]) > -1) {
                cell.style.backgroundColor = color;
            }
        });
    };
    iCSR.hideRows = function (ctx, rows) {

    };

};
//endregion

/*DUPLICATES *****************************************************************************/
/*
 Usage: in OnPostRender
 new iCSR.ctrl.duplicates(ctx,{title:'Title',color:'pink',buttonlabel:['Show Duplicates', 'Hide Duplicates']});
 */
iCSR.ctrl.duplicates = function (ctx, cfg) {
    var check = cfg ? cfg.title : 'Title', //name of Item field to check for duplicates
        color = cfg ? cfg.color : 'ligthcoral',
        buttonlabel = cfg ? cfg.buttonlabel : ['Show Duplicates', 'Hide Duplicates'],
        all = [], //holds all values
        duplicates = [], //holds all duplicate TR elements, EXCLUDING the first value
        duplicatesShown = true,
        button = document.createElement('BUTTON');
    ctx.ListData.Row.forEach(function (item) {
        if (all.indexOf(item[check]) > -1) {
            var TR = document.getElementById(GenerateIIDForListItem(ctx, item));
            TR.style.backgroundColor = color;
            duplicates.push(TR);
        }
        all.push(item[check]);
    });
    button.onclick = function (event) {
        event.preventDefault();
        duplicatesShown = !duplicatesShown;
        duplicates.forEach(function (TR) {
            TR.style.display = duplicatesShown ? 'table-row' : 'none';
        });
        button.innerHTML = buttonlabel[duplicatesShown / 1];
    };
    document.getElementById('CSRListViewControlDiv' + ctx.wpq).appendChild(button);
    button.click(); //first init hide duplicates
};
//region iCSR.ctrl.progressBar
iCSR.ctrl.progressBar = function (config) {
    var progressBar = this;
    var cfg = progressBar.config = config || {}; //shorthand notation for internal config object

    function configError(txt) {
        iCSR.traceerror('iCSR progressBar', txt);
    }

    progressBar.setconfig = function (setting, value) {
        progressBar.config[setting] = config.hasOwnProperty(setting) ? config[setting] : value; //setter
    };
    if (!cfg) console.warn('progressBar with default settings. or use .bind({CONFIGURATION})');
    progressBar.barid = 'iCSRprogressBar_' + (cfg.barid || new Date() / 1); //default random number
    progressBar.setconfig('interactive', true); //if bar is interactive
    if (cfg.interactive) progressBar.updateFunction = cfg.update || configError('missing .update definition');
    progressBar.setconfig('CSSid', 'iCSRprogressBar'); //optional custom CSS for every progressBar, otherwise one per HTML page
    progressBar.setconfig('barcolor', 'green');
    progressBar.setconfig('color', 'white');
    progressBar.setconfig('background', 'lightgrey');
    progressBar.setconfig('width', '220px');
    progressBar.setconfig('scalecolor', 'green');
    progressBar.setconfig('scale', cfg.interactive); //display scale in bar
    progressBar.setconfig('unique', false); //unique CSS styles for bars
    progressBar.segments = []; //array DOM elements of all percentage segments making up this progressBar
    iCSR.trace(2, 'progressBar', cfg.ID, progressBar);

    progressBar.addCSS = function () {
        var CSSname = "." + cfg.CSSid;
        var rules = [];
        rules.push(CSSname + " {width:" + cfg.width + ";height:15px;position:relative;background-color:" + cfg.background + "}");
        rules.push(CSSname + " {font-family:arial;font-size:11px;}");
        if (cfg.scale) rules.push(CSSname + " {color:" + cfg.scalecolor + "}"); //scale indicator
        rules.push(CSSname + ">div {position:absolute;text-align:right;font-size:80%;height:100%;}");
        if (cfg.scale) rules.push(CSSname + ">div {border-right:1px solid #a9a9a9}");
        if (cfg.interactive) { //hover actions
            rules.push(CSSname + ">div:not(.currentProgress):hover{color:black;font-size:100%;background:lightgreen;z-index:4;cursor:pointer;opacity:.8}");
            rules.push(CSSname + ">div:not(.currentProgress):hover:before{content:'►';font-weight:bold}");
        }
        rules.push(CSSname + ">div:hover:after," + CSSname + " .currentProgress:after{content:'%'}");
        rules.push(CSSname + " .currentProgress{font-size:100%;z-index:3}");
        rules.push(CSSname + " .currentProgress{background-color:" + cfg.barcolor + ";color:" + cfg.color + "}");
        iCSR.CSS.addStylesheetWithRules(cfg.CSSid, rules, cfg.cssreload, cfg.unique);
    };

    progressBar.html = function (currentProgress) {
        var html = '';
        currentProgress = currentProgress || progressBar.currentnr;
        for (var nr = 10; nr > 0; nr--) { //create 10 overlapping DIVs
            var segmentid = progressBar.barid + "_" + nr;
            progressBar.segments[nr] = segmentid;
            html += "<div id='" + segmentid + "'"; //
            if (nr === currentProgress) html += " class='currentProgress'";
            if (currentProgress === 0 || nr > currentProgress) html += " onclick='" + progressBar.barid + ".progressClicked(this)'"; //attach click handler for higher values only
            html += " style='width:" + nr * 10 + "%'>";
            if (cfg.scale || nr === currentProgress) html += nr * 10; //display scale value
            html += "</div>";
        }
        return "<div id='" + progressBar.barid + "' class='" + cfg.CSSid + "'>" + html + "</div>";
    };
    progressBar.setValue = function (nr) { //input value van be in 'nr %' string notation
        progressBar.value = nr.match(/(\d+)/g)[0] / 1; // 0-100 without %
        progressBar.currentnr = Math.round(progressBar.value / 10); // Rounded values 0 to 10
    };
    progressBar.progressClicked = function (el) {
        event.preventDefault();
        event.stopPropagation();
        el = (typeof el.click === 'function') ? el : el.srcElement;
        if (progressBar.currentnr) document.getElementById(progressBar.segments[progressBar.currentnr]).className = ''; //reset previous selection
        progressBar.setValue(el.innerHTML);
        el.className = "currentProgress";
        if (cfg.interactive) progressBar.updateFunction(progressBar);
    };
    progressBar.addCSS();
    progressBar.setValue(cfg.value || configError('missing .value'));
    window[progressBar.barid] = progressBar; //extra global reference to all progressBars
    ctx.iCSR = ctx.iCSR || {}; //store progressBars on the global ctx object
    ctx.iCSR.progressBar = ctx.iCSR.progressBar || [];
    ctx.iCSR.progressBar.push(progressBar);
    return progressBar.html();
};
//endregion

/*COLORS*************************************************************************************/

iCSR.CFG.colorGroupheaders = false;
//region iCSR.Template.colorLabel
iCSR.Template.colorLabel = function (ctx) {
    var value = iCSR.fn.getfieldvalue(ctx),
        label = iCSR.fn.label(value),
        html = value,
        color = false;
    iCSR.trace(2, 'colorLabel', label, value);
    if (iCSR.CFG.colorGroupheaders || !iCSR.SP.isGroupHeader(ctx)) {
        var colors = iCSR.fn.getColors(ctx);
        color = colors.hasOwnProperty(value) ? colors[value] : Array.isArray(colors) ? colors[value.match(/(\d+)/g)] : 'inherit'; //use number from value label
        html = '<span style="background-color:{0};">&nbsp{1}&nbsp</span>';
    }
    return String.format(html, color, iCSR.fn.nowordbreak(label));
};
//endregion

iCSR.init();

///////
