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
 - iCSR.cfg = generic configurations
 - iCSR.SP = SharePoint related code (can be in other places as well)
 - iCSR.DO = methods to be called by user or code
 - iCSR.ctrl = constructors to be called by user (new iCSR.table) or other code

 - Global configurations
 (optional) iCSR.interactive true/false = indicates default setting to be used by all iCSR (screen) elements, this overrides custom setting

 */
/*global document,window,navigator,setTimeout,event*/
/*global console*/
/*global $*/

/*global SP,SPClientTemplates,_spPageContextInfo*/
/*global ClientPivotControl,RenderHeaderTemplate,RegisterModuleInit*/
/*global GenerateIIDForListItem, GetAncestor, AJAXRefreshView,ctx*/
/*global GenerateIID,GetDaysAfterToday,_spYield*/

/*jshint -W069*/ //allow ["notation"]
/*jshint -W030*/ //allow anonymous function

function GetAncestor(a, b) { //overloaded by SharePoint core.js implementation, declared because CSR code runs before core.js is loaded
    while (a !== null && a.tagName != b) a = a.parentNode;
    return a;
}


var iCSR = iCSR || {};
iCSR._ver = '0.0.3';
iCSR.fn = iCSR.fn || {}; //support functions
iCSR.DO = iCSR.DO || {}; //doable functions
iCSR.ctrl = iCSR.ctrl || {}; //controllers created with new ()

iCSR.initialize = function () {
    console.info('%c iCSR - Proof of Concept - ' + iCSR._ver + ' ', iCSR.cfg.tracecolor + ';font-size:20px;');
    iCSR.traceon();
    if (SP) {
        SP.SOD.executeFunc("clienttemplates.js", "SPClientTemplates", function () {
            iCSR.trace('initialized SharePoint clienttemplates.js');
            iCSR.initTemplate('iCSR.DO', 'progress', 'display interactive progressBar');
        });
    } else {
        console.error('no SharePoint environment');
    }
};

/**
 * TODO: implement more template approach
 * @param iCSRnamespace
 * @param modulename
 * @param description
 * @returns {boolean}
 */
iCSR.initTemplate = function (iCSRnamespace, modulename, description) {
    if (iCSR.tracelevel>3) console.log(iCSRnamespace, modulename, description);
    return true;
};

//region iCSR.cfg - global configuration Namespace, properties and methods                              ###    iCSR.cfg
iCSR.cfg = iCSR.cfg || { //configuration options
        tracecolor: 'background:#005AA9;color:#FCD500;font-weight:bold;',
        tracing: true,
        colors: { //predefined colors for fieldnames
            "Default": ['', 'lightcoral', 'pink', 'orange', 'lightgreen'],
            "Priority": ['', 'lightcoral', 'pink', 'orange', 'lightgreen'],
            objectDescription: 'custom colors matching SharePoint internal fieldnames'
        },
        allowtokenfunctions: true, //a very weak option to optionally disallow the creation of tokenfuntions
        objectDescription: 'iCSR global configurations'

    };

iCSR.cfg.tokenfunctions = {};//if cfg.[token] does not exist, a corresponding function kan be executed

/**
 *
 * @param circleSize
 * @returns {*}
 */
iCSR.cfg.tokenfunctions.svgcircle = function circle(circleSize) {
    return String.format("<svg height={0} width={0}><circle cx={1} cy={1} r={1} fill='[color]'/></svg>", circleSize, circleSize / 2);
};

//endregion iCSR.cfg

//region iCSR.info & iCSR.trace                                         ###    iCSR.info iCSR.traceon()  iCSR.traceoff()
iCSR.info = function () { //list all iCSR doable functions and methods
    var key;
    var consoleObject = function (iCSRobject) {
        console.info('iCSR: ' + iCSR._ver, iCSRobject.objectDescription);
        for (key in iCSRobject) {
            if (iCSRobject.hasOwnProperty(key)) console.warn(key);
        }
    };
    consoleObject(iCSR.DO);
    consoleObject(iCSR.ctrl);
};
iCSR.trace = function (p1, p2, p3, p4, p5, p6, p7, p8) {
    var tracelevelcolors = ['', '', '', ''];
    var tracelevelcolor = tracelevelcolors[0];//TODO: add selective coloring of console statements
    if (iCSR.cfg.tracing && console) console.info('%c iCSR ', iCSR.cfg.tracecolor + tracelevelcolor, p1 || '', p2 || '', p3 || '', p4 || '', p5 || '', p6 || '', p7 || '', p8 || '');
};
iCSR.tracecolor = function (p1, p2, p3, p4, p5, p6, p7, p8) {
    if (iCSR.cfg.tracing && console) console.info('%ciCSR ' + p1, 'background:lightcoral;color:black;', p2 || '', p3 || '', p4 || '', p5 || '', p6 || '', p7 || '', p8 || '');
};
iCSR.tracelevel = 0; //1 to 3 for more and more detailed console tracing
iCSR.traceon = function (setlevel) {
    iCSR.tracelevel = setlevel || 1; //default tracelevel
    iCSR.cfg.tracing = true; //extra information in the F12 Developer console
    return true;
};
iCSR.traceoff = function (setlevel) {
    iCSR.cfg.tracing = setlevel ? iCSR.traceon(setlevel) : false; //disable tracing
};
iCSR.catch = function (e, functionname) { //generic try/catch error reporting
    // Compare as objects
    if (e.constructor == SyntaxError) {
        iCSR.tracecolor(functionname, 'programming error!'); // There's something wrong with your code, bro
    }
    // Get the error type as a string for reporting and storage
    iCSR.tracecolor(functionname, e.constructor.name); // SyntaxError
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
iCSR.fn.labelOnly = function (value) {
    var valuemarker = ') ', //(1) Label
        label = value.indexOf(valuemarker) > 0 ? value.split(valuemarker)[1] : value;
    return (label);
};
/**
 *
 * @param value
 * @param tokens
 * @returns {string}
 */
iCSR.fn.replacetokens = function (value, tokens) { //replace 'Hello [location]!' with propertyvalue from tokens {location:'World'}  => 'Hello World!'
    if (iCSR.tracelevel > 2) iCSR.trace('replacetokens', typeof value, value);
    if (!value) return '';
    try {
        tokens = tokens || this; //tokens defined in .bind(config)
        //var a = value.split(/\{\{(.+?)\}\}/g); //split string on {{ and }}
        var replacer, a = value.split(/\[(.+?)\\]/g);
        if (iCSR.tracelevel > 2) iCSR.trace('replacetokens:', typeof a, a);
        a = a.map(function (stringPart) {
            replacer = tokens[stringPart]; // predefined tokens defined in .config object take precedence over token
            if (typeof replacer === 'function') {
                //TODO: ?? do we want to allow script creation... cool to investigate how far this would lead
            } else {
                if (iCSR.cfg.allowtokenfunctions && !replacer) {
                    var tokenfunctioncheck = stringPart.split(/\((.+?)\)/g); // svgcircle(10)
                    var functionName = tokenfunctioncheck[0];
                    if (iCSR.cfg.tokenfunctions.hasOwnProperty(functionName)) {
                        try {
                            var parameters = tokenfunctioncheck[1];
                            replacer = iCSR.cfg.tokenfunctions[functionName].call(tokens, parameters); //call defined function, TODO: this opens up Script Injection!
                        } catch (e) {
                            iCSR.catch(e, 'replacetokens: function: ' + functionName);
                        }
                    }
                }
            }
            return replacer ? replacer : stringPart;
        });
        return a.join('');
    } catch (e) {
        iCSR.catch(e, 'replacetokens:' + value);
    }
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
    if (iCSR.tracelevel > 2) iCSR.trace('getfieldvalue:', typeof ctx, typeof ctx === 'string' ? ctx : ctx.CurrentFieldSchema.Name);
    return (typeof ctx === 'string' ? ctx : ctx.CurrentItem[ctx.CurrentFieldSchema.Name]);
};

iCSR.fn.isGroupHeader = function (ctx) {
    var property = ctx.CurrentFieldSchema.Name + '.COUNT.group'; // '.groupHeader'
    return ctx.CurrentItem.hasOwnProperty(property);
};

/**
 * standard SharePoint refresh ListView
 * http://www.eliostruyf.com/ajax-refresh-item-rows-in-sharepoint-2013-view/
 *
 * @param clientContext
 * @param refreshall
 */
iCSR.DO.refreshView = function (clientContext, refreshall) {
    clientContext = clientContext || ctx;
    if (clientContext) {
        ctx.skipNextAnimation = !refreshall || true; // If set to false all list items will refresh
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
iCSR.DO.renderHeaderTemplate = function (renderCtx, fRenderHeaderColumnNames) { //change the View Selector to display ALL Views
    //console.log(renderCtx.ListSchema.ViewSelectorPivotMenuOptions);
    //noinspection JSUnresolvedVariable
    var viewData = JSON.parse(renderCtx.ListSchema.ViewSelectorPivotMenuOptions);//jshint ignore:line
    //noinspection JSUnusedGlobalSymbols
    ClientPivotControl.prototype.SurfacedPivotCount = viewData.length - 3; //display all View options except 'Create View' & 'Modify View'
    return RenderHeaderTemplate(renderCtx, fRenderHeaderColumnNames); //render default Header template
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
    try {
        bindconfig = bindconfig.hasOwnProperty('FieldType') ? {} : bindconfig; //get optional config from .bind()
        bindconfig.trace == 1 ? iCSR.traceon(bindconfig.trace) : iCSR.traceoff();

        function mergeConfig(addconfig) {//TODO: this is a shallow copy
            for (key in addconfig) if (addconfig.hasOwnProperty(key)) {
                config[key] = addconfig[key]; //defaultsetting
            }
        }

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
        config.shortlabel = config.valuenr ? iCSR.fn.labelOnly(config.value) : config.value; //if a valuenr then shorten it
        config.ID = ctx.CurrentItem.ID;
        return (config);
    } catch (e) {
        console.error('getconfig', e, key, config);
    }
};

//endregion

//region iCSR.CSS - CSS operations                                                              ###     iCSR.CSS
/*

 resources:
 http://www.cssscript.com/animated-progress-indicators-with-vanilla-javascript-and-css/
 */
iCSR.CSS = {}; //CSS storage and actions
iCSR.CSS.sheets = {};
/**
 *
 * @param id
 * @returns {Element}
 */
iCSR.CSS.addstylesheet = function (id) {
    var _styleEl = document.createElement("STYLE");
    _styleEl.id = id; // _styleEl.setAttribute("media", "only screen and (max-width : 1024px)")
    _styleEl.appendChild(document.createTextNode("")); // WebKit hack :(
    document.head.appendChild(_styleEl);
    if (iCSR.tracelevel > 1) iCSR.tracecolor('added stylesheet', _styleEl.id);
    return _styleEl;
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
            _styleEl = iCSR.CSS.addstylesheet(id);
        }
        rules.forEach(function (rule) {
            if (iCSR.tracelevel > 2) iCSR.trace('adding ', rules.length, 'rules to', _styleEl.id);
            if (_styleEl) _styleEl.sheet.insertRule(rule, 0);
        });
    } catch (e) {
        iCSR.catch(e);
    }
};
//endregion


//region iCSR.SP - SharePoint interactions using JSOM / REST                                             ###    iCSR.SP
//TODO: How does this compare with SPUtility https://sputility.codeplex.com/ (last update feb 2015)

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
iCSR.SP.updateItem = function (listID, ID, fieldname, value, successFunc, errorFunc) { //TODO make it work with other (site) context
    event && event.preventDefault();
    event && event.stopPropagation();
    listID = listID || SP.ListOperation.Selection.getSelectedList();
    var context = SP.ClientContext.get_current(); //TODO: use REST instead of JSOM sometime
    var web = context.get_web();
    var list = web.get_lists().getById(listID);
    var item = list.getItemById(ID);
    context.load(item);
    item.set_item(fieldname, value);
    item.update();
    iCSR.tracecolor('iCSR.SP.updateItem', ID, fieldname, value);
    successFunc = successFunc || function () {
            if (iCSR.tracelevel > 1) iCSR.trace('SP.updateItem', ID, fieldname, value);
            iCSR.DO.refreshView();
        };
    errorFunc = errorFunc || function () {
            console.error('Error Updating');
        };
    context.executeQueryAsync(successFunc, errorFunc);
};

/**
 *
 * @param ID
 * @param authorID
 */
iCSR.SP.setAuthor = function (ID, authorID) { //TODO:test
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
            console.error(a.get_message());
        }
    );
};
//endregion

//region iCSR MODULE:DOM -  Generic DOM functions (related to SharePoint DOM structure, ids etc.)       ### iCSR.DOM

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
            console.error('iCSR.DO.waitforelement failed:', id);
        } else { //we're getting less and less patient.. is that element there yet?
            setTimeout(iCSR.DO.waitforelement.bind(null, id, callback, yieldtime - 1), yieldtime || 100);
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

/* iCSR MODULE:DOM - end definition */
//endregion

//region .CSR.DO - change Browser or SharePoint states *************************************/

//region .CSR.DO.colordate
/**
 *
 * @param ctx
 * @returns null
 */
iCSR.DO.colorDate = function (ctx) {
    if (!ctx) {
        console.warn('iCSR.DO.colorDate.bind({[config]})');
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
    iCSR.DOM.waitforelement(id, function (elementfound) { //TODO: CSR fix elementfound
        var TR = document.getElementById(id); //temp fix, elementfound doesn't work
        var TD = TR.cells[fieldschema.counter - 1]; //current column
        if (Number(days))(colorelement === 'TD' ? TD : TR).style.backgroundColor = ranges[color];
    }, 10);
    var html = isNaN(days) ? labels[0] : "<div style='background-color:{0}'>{1} {2}</div>";
    return String.format(html, ranges[color], Math.abs(days), labels[days > 0 ? 1 : 2]);
};
//endregion

//region .CSR.DO.progressBar
/**
 *
 */
iCSR.cfg.progressBar = {
    CSSid: 'iCSRprogressBar', //class name for all progressBars
    colors: ['transparent', 'red', 'orangered', 'indianred', 'goldenrod', 'goldenrod', 'goldenrod', 'yellowgreen', 'mediumseagreen', 'forestgreen', 'green'],
    width: '180px',
    resourcelinks: 'https://jsfiddle.net/dannye/bes5ttmt/',
    objectDescription: ''
};

/**
 *
 * @param ctx
 */
iCSR.DO.progressBar = function (ctx) {
    var config = iCSR.fn.getconfig(ctx, iCSR.cfg.progressBar, this); //this = ctx.CurrentFieldSchema;//if not .bind() scope then this is CurrentFieldSchema
    config.cssreload = true; //force reloading of CSS when live-testing config settings
    config.barid = ctx.wpq + '_' + config.ID; //unique id to this progressBar//TODO move to getconfig
    if (config.unique) config.CSSid += config.barid; //custom class for every progressBar
    if (!config.update) {
        iCSR.trace('using default SharePoint JSOM code to update', config.Name);
        config.update = function (progressBar) {
            SP.SOD.executeOrDelayUntilScriptLoaded(function updateProgress() {
                var listID = SP.ListOperation.Selection.getSelectedList();
                iCSR.SP.updateItem(listID, progressBar.config.ID, progressBar.config.Name, progressBar.value / 100);
            }, 'sp.js');
        };
    }
    return new iCSR.ctrl.progressBar(config).html();
};
//endregion

//region iCSR.DO.priority
//noinspection BadExpressionStatementJS,HtmlUnknownTarget
iCSR.cfg.priority = {
    iCSRid: 'Priority',
    values: {
        '(1) High': 'lightcoral',
        '(2) Normal': 'orange',
        '(3) Low': 'lightgreen'
    },
    //colors: ['red', 'orange', 'green'],
    textcolor: 'black',
    interactive: iCSR.cfg.interactive || true,
    width: '110px', //total width
    widthCurrent: '50%',
    widthChoice: '15px', //width of the non Current Choice options
    tracelevel: 4,
    html: '',
    Classcontainer: 'iCSRpriority_Container',
    Classcurrent: 'iCSRpriority_Current',
    Classchoice: 'iCSRpriority_Choice',
    border: 'border:1px solid grey',
    clicktemplate: "iCSR.SP.updateItem(false,'[ID]','[Name]','[keyvalue]');", //ID,Name,value
    layouts: '/_layouts/15/images/',
    template: 'default',
    templates: {
        kpiCSRCSS: {
            container: ".[Classcontainer] {}",
            containerDiv: ".[Classcontainer]>div {position:relative;float:left;}",
            choice: ".[Classchoice] {cursor:pointer;opacity:.2}",
            choicehover: ".[Classchoice]:hover {opacity:1;border-color:black}",
            objectDescription: 'reusable generic CSS for KPI indicators'
        },
        default: {
            container: "<div class='[Classcontainer]'>[html]</div>",
            template: "<div style='background-color:[color]' class='[classname]' onclick=\"[click]\">[label]</div>",
            CSS: { //object of strings with tokenized CSS definitions
                container: ".[Classcontainer] {width:[width];}",
                containerDiv: ".[Classcontainer]>div {position:relative;float:left;display:inline;}",
                currenttext: ".[Classcurrent] {font-size:11px;color:[textcolor]}",
                currentlabel: ".[Classcurrent] {width:[widthCurrent];text-align:center;padding:2px;}",
                choice: ".[Classchoice] {width:[widthChoice];cursor:pointer;opacity:.4}",
                choicehover: ".[Classchoice]:hover {opacity:1;border-color:black}",
                objectDescription: 'CSS for the iCSR default priority interaction'
            }
        },
        kpiCSR1: {
            template: "<span class='[classname]' onclick=\"[click]\"><img src='[layouts]/kpidefault-[nr].gif'></span>", //default sharepoint images in the layouts folder
            CSS: "kpiCSRCSS"
        },
        kpiCSR2: {
            template: "<span class='[classname]' onclick=\"[click]\"><img src='[layouts]/kpipeppers-[nr].gif'></span>", //default sharepoint images in the layouts folder
            CSS: "kpiCSRCSS"
        },
        kpiCSR3: {
            template: "<span class='[classname]' onclick=\"[click]\"><img src='[layouts]/kpipepperalarm-[nr].gif'></span>", //default sharepoint images in the layouts folder
            CSS: "kpiCSRCSS"
        },
        kpiCSR4: {
            template: "<span class='[classname]' onclick=\"[click]\"><img src='[layouts]/kpinormal-[nr].gif'></span>", //default sharepoint images in the layouts folder
            CSS: "kpiCSRCSS"
        }
    },
    description: ''
};
iCSR.DO.priority = function (ctx) {
    //TODO: spinner on save
    var config = iCSR.fn.getconfig(ctx, iCSR.cfg.priority, this); //this = ctx.CurrentFieldSchema;//if not .bind() scope then this is CurrentFieldSchema
    var replacetokens = iCSR.fn.replacetokens.bind(config); //bind the current config to the function
    var rules = config.rules || [];
    var template = config.templates.hasOwnProperty(config.template) ? config.templates[config.template] : {};
    if (!template.hasOwnProperty('container')) template.container = config.templates.default.container;
    var CSS = template.CSS || {};
    if (typeof template.CSS === 'string')CSS = config.templates[template.CSS];
    for (var key in CSS) if (CSS.hasOwnProperty(key)) rules.push(replacetokens(CSS[key]));
    if (config.border || true) rules.push(replacetokens(".[Classcontainer]>div {[border]}"));
    config.interactive = template.hasOwnProperty('CSS') && config.interactive;
    iCSR.CSS.addStylesheetWithRules(config.iCSRid, rules, true);
    config.nr = "0"; //trick replacement in accepting first value as 0 string
    for (var keyvalue in config.values) {
        config.keyvalue = keyvalue;
        var iscurrent = config.value === keyvalue;
        config.click = replacetokens(config.clicktemplate);
        config.classname = config[iscurrent ? 'Classcurrent' : 'Classchoice'];
        config.color = config.colors ? config.colors[config.nr] : config.values[config.keyvalue];
        config.label = iscurrent ? config.shortlabel : '&nbsp;&nbsp;';
        var elementTemplate = template.template || config.template;
        for (var nestedTokens = 0; nestedTokens < 3; nestedTokens++) elementTemplate = replacetokens(elementTemplate);
        if (iscurrent || config.interactive) config.html += elementTemplate;
        config.nr++;
    }
    var outputHTML = config.interactive ? template.container : config.html;
    return replacetokens(outputHTML);
};

//endregion priority

//endregion .CSR.DO

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
            return typeof column == "string" ? tableControl.columnNumbers[column] : column;
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
/*PROGRESSBAR*******************************************************************************/
iCSR.ctrl.progressBar = function (config) {
    var progressBar = this;
    var cfg = progressBar.config = config || {}; //shorthand notation for internal config object

    function configError(txt) {
        console.error('iCSR progressBar', txt);
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
    iCSR.trace('progressBar', cfg.ID, progressBar);

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

/*COLORS*************************************************************************************/

iCSR.cfg.colorGroupheaders = false;
iCSR.fn.getColors = function (ctx) {
    var fieldName = ctx.CurrentFieldSchema.Name,
        colors = iCSR.cfg.colors.hasOwnProperty(fieldName) ? iCSR.cfg.colors[fieldName] : iCSR.cfg.colors.Default;
    iCSR.trace('getColors', fieldName, colors);
    return colors;
};
iCSR.DO.colorLabel = function (ctx) {
    var value = iCSR.fn.getfieldvalue(ctx),
        label = iCSR.fn.labelOnly(value),
        html = value,
        color = false;
    iCSR.trace('colorLabel', label, value);
    if (iCSR.cfg.colorGroupheaders || !iCSR.fn.isGroupHeader(ctx)) {
        var colors = iCSR.fn.getColors(ctx);
        color = colors.hasOwnProperty(value) ? colors[value] : Array.isArray(colors) ? colors[value.match(/(\d+)/g)] : 'inherit'; //use number from value label
        html = '<span style="background-color:{0};">&nbsp{1}&nbsp</span>';
    }
    return String.format(html, color, iCSR.fn.nowordbreak(label));
};
iCSR.initialize();

///////
