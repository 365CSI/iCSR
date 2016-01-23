(function (window) {// Office365/SharePoint Client Side Rendering JavaScript programming education and support library
    window.iCSR = window.iCSR || {};//One Namespace for all iCSR functionality
    var iCSR = window.iCSR;//just to be sure, in case iCSR is added to another Namespace
    Object.defineProperties(iCSR, {
        _VERSION: {
            value: '0.5', writable: false
        },
        Interactive: {//(optional) indicates default setting (overrides Template config!) to be used by all iCSR Templates
            value: false, writable: true
        },
        ReloadCSSforeveryItem: {//Re-applies CSS for every item; easy for Cisar developing, set to false for delivery
            value: true, writable: true
        }
    });
    /* iCSR - Client Side Rendering IKEA style

     license: CC-BY
     http://iCSR.github.io

     History: december 2015 - first Proof of Concept

     TODO: Host demo version on 365CSI.com or CDN; counter image

     Whishlist:
     - view item by groupmembership

     JavaScript style notes
     - Global namespace iCSR holds all content
     - .Me function auto executes Templates and Controls based on the ctx object fieldnames or fieldtypes
     - iCSR.CFG = generic configurations for Templates and Controls
     - iCSR.SP = SharePoint related code (can be in other places as well)
     - iCSR.CSS = CSS code
     - iCSR.Control = constructors to be called by user (new iCSR.table) or other code
     - iCSR.Template = ready made functionality
     - iCSR.fn = generic support functions
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

//region Global overrides - SharePoint core.js is not loaded yet ----------------------------------- ### Global Functions
    /**
     * Get Ancestor up in the DOM tree - SharePoint overloads this in (loaded later) core.js
     * @param element
     * @param tagType
     * @returns {*}
     * @constructor
     */
    function GetAncestor(element, tagType) {
        while (element !== null && element.tagName !== tagType) element = element.parentNode;
        return element;
    }

//endregion --------------------------------------------------------------------------------------- Global Functions

//region iCSR Namespaces --------------------------------------------------------------------------- ### iCSR Namespaces
    /**
     * use any predefined code declared in previous libraries, all functionality in this file will be appended
     *
     */
    iCSR.Template = iCSR.Template || {}; //Template functions return HTML for easy execution in a CSR file
    iCSR.SP = iCSR.SP || {};//placeholder SP sub-namespace
    iCSR.fn = iCSR.fn || {}; //support functions
    iCSR.Control = iCSR.Control || {}; //controllers created with new ()
    iCSR.Str = iCSR.Str || {}; //String functions because .prototyping is not 100% safe because others can do it as well.
    iCSR.CSS = iCSR.CSS || {}; //CSS storage and actions
    iCSR.Tokens = iCSR.Tokens || {}; // String functions and Custom function declarations for handling [token] in Strings
//endregion --------------------------------------------------------------------------------------- iCSR Namespaces

    iCSR.init = function () {
        console.info('%c iCSR - Proof of Concept - ' + iCSR._VERSION + ' ', iCSR.CFG.colorBlueYellow + ';font-size:20px;');
        //iCSR.traceon();
        //if (SP) {
        //    //SP.SOD.executeFunc("clienttemplates.js", "SPClientTemplates", function () {
        //        iTrace(0, 'initialized SharePoint clienttemplates.js');
        //        //TODO (low) enhance use of Templates (version 2.0)
        //        iCSR.initTemplate('iCSR.Template', 'PercentComplete', 'display interactive progressBar');
        //        iCSR.initTemplate('iCSR.Template', 'Priority', 'display interactive priorityoptions');
        //        iCSR.initTemplate('iCSR.Template', 'Status', 'display colored Status labels');
        //    //});
        //} else {
        //    iCSR.traceerror('no SharePoint environment');
        //}
        //window.iC = iCSR;//shortcut for F12 console use, better not use it in code, iCSR is the only global variable to be used
        //
        //window.ic = iCSR.inspector;//ctx property inspector
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
            iCSR.traceerror('Missing: ', modulename);
        }
    };

//region iCSR.CFG - global configuration Namespace, properties and methods------------------------- ### iCSR.CFG
    iCSR.CFG = iCSR.CFG || { //configuration options for all Templates
            interactive: false,
            colorBlueYellow: 'background:#005AA9;color:#FCD500;font-weight:bold;',
            tracing: true,
            colors: { //predefined colors for fieldnames
                "Default": ['', 'lightcoral', 'pink', 'orange', 'lightgreen'],
                "Priority": ['', 'lightcoral', 'pink', 'orange', 'lightgreen'],
                objectDescription: 'custom colors matching SharePoint internal fieldnames'
            },
            objectDescription: 'iCSR global configurations'

        };
//endregion --------------------------------------------------------------------------------------- iCSR.CFG

//region iCSR.Tokens ------------------------------------------------------------------------------ ### iCSR.Tokens
    /**
     * Strings may contain [token] tokens to be replaced by a corresponding config.[token] value
     *
     * config.firstword ='Hello';
     * config.location='[firstword] World';
     * iCSR.Tokens.replace( '[location]!' );   ==>  'Hello World!'
     *      *
     * Known issues:
     * Nested [[token]] does not work, creates '[token',']' array
     *
     * */
    /**
     *
     * @param token
     * @param _tokenconfig
     * @returns {*}
     */
    iCSR.Tokens.replacetoken = function (token, _tokenconfig) {
        var _tokenized = token;
        if (_tokenized !== '.') {//allways ignore tokens
            if (_tokenconfig.hasOwnProperty(token)) {
                _tokenized = _tokenconfig[token]; // predefined tokens defined in .config object take precedence over token
                if (typeof _tokenized === 'function') {
                    //TODO: (normal) ?? do we want to allow script creation... cool to investigate how far this would lead
                }
            }
            if (iCSR.Tokens.hasfunction(_tokenized)) {
                var functionDef = iCSR.fn.tokenArray(token, '()'),//token functions like: svgcircle(20)
                    functionname = functionDef[0],
                    parameters = functionDef[1];
                _tokenized = iCSR.Tokens.callfunction(functionname, parameters);
            }
            if (token === _tokenized) {
                var strippedtoken = iCSR.Str.alphanumeric(token);
                if (strippedtoken === token) {//token is not declared yet
                    _tokenized = '[' + token + ']';
                    iTrace(3, 'replacetoken UNTOUCHED: ', _tokenized);
                }
            } else {
                iTrace(3, 'replacetoken:', token, '\n', _tokenized);
            }
        }
        return _tokenized;
    };

    /**
     * replace 'Hello [location]!' with propertyvalue from _tokenconfig {location:'World'}  => 'Hello World!'
     * @param _string
     * @param _tokenconfig
     * @returns {*}
     */
    iCSR.Tokens.replace = function (_string, _tokenconfig) {
        if (!_string) return _string;

        _tokenconfig = _tokenconfig || this; //tokens defined in optional .bind(config)
        var tokenized;//working array breaking string into tokens
        var tokencount = 1;
        for (var loop = 0; loop < 5; loop++) {//too lazy to develop recursive code
            tokenized = iCSR.fn.tokenArray(_string, '[]');//make array
            if (tokenized.length === tokencount) break;//exit loop if no more tokens need to be replaced
            tokencount = tokenized.length;
            iTrace(3, 'tokenized before processing\n', tokenized);
            tokenized = tokenized.map(function (token) {
                return iCSR.Tokens.replacetoken(token, _tokenconfig);
            }); // jshint ignore:line
            _string = tokenized.join('');//make it one string again
        }
        iTrace(2, 'replacetokens', '(' + typeof _string + ') tokenized string: \n', _string, '\n', tokenized);
        return _string;
    };

//region iCSR.Tokens.functions -------------------------------------------------------------------- ### iCSR.Token
    iCSR.Tokens.functions = {};
    /**
     *
     * @param circleSize
     * @param color
     * @returns {*}
     */
    iCSR.Tokens.functions.svgcircle = function circle(circleSize, color) {
        color = color || '[color]';//token is replaced later with correct color
        var radius = circleSize / 2;
        var html = "<svg height=" + circleSize + " width=" + circleSize + ">";
        html += "<circle cx=" + radius + " cy=" + radius + " r=" + radius + " fill='" + color + "'/>";
        html += "</svg>";
        return html;
    };
//endregion --------------------------------------------------------------------------------------- iCSR.Tokens.functions

    /**
     *
     * @param functionname
     * @returns {boolean}
     */
    iCSR.Tokens.hasfunction = function (functionname) {
        iTrace(5, 'hasfunction:', typeof functionname, functionname);
        var hasFunction = false;
        if (typeof(functionname) === 'string') {
            functionname = functionname.split('(')[0];
            if (iCSR.Tokens.functions.hasOwnProperty(functionname)) {
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
    iCSR.Tokens.callfunction = function (functionname, parameters, silent) {
        iTrace(1, 'callfunction:', silent ? '(silent)' : '', functionname, '(', parameters, ')');
        var tokenfunctionResult;
        if (iCSR.Tokens.hasfunction(functionname)) {
            try {
                var tokenfunction = iCSR.Tokens.functions[functionname];
                iTrace(2, 'call: ', functionname, '(', parameters, ')\n', tokenfunction);
                tokenfunctionResult = tokenfunction.call(this, parameters);//TODO: use Template config scope
            } catch (e) {
                iCSR.catch(e, 'callfunction:' + functionname);
            }
        } else {
            if (!silent) {
                iCSR.traceerror('Missing tokenfunction', '', functionname);
            }
        }
        return tokenfunctionResult;
    };

//endregion --------------------------------------------------------------------------------------- iCSR.Tokens

//region iCSR.info & iCSR.trace-------------------------------------------------------------------- ### iCSR.info 
    iCSR.info = function () { //list all iCSR doable functions and methods
        var consoleObject = function (iCSRobject) {
            console.info('iCSR: ' + iCSR._VERSION, iCSRobject.objectDescription);
            for (var key in iCSRobject) {
                if (iCSRobject.hasOwnProperty(key)) {
                    console.warn(key);
                }
            }
        };
        consoleObject(iCSR.Template);
        consoleObject(iCSR.Control);
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
    var iTrace = window.iTrace = iCSR.trace;//global reference to trace, makes it easy to comment them all with // so they are deleted in iCSR.min.js
    window.cl = function (p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15) {//TODO (high) delete in all code, used for easy development
        iTrace(0, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15);
    };

    iCSR.traceend = function (tracelevel, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15) {
        iCSR.CFG.errorcount++;
        iTrace(tracelevel, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15);
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
        iTrace(0, 'iCSR trace level ' + iCSR.tracelevel + ' - template initialized - ' + new Date());
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
//endregion ---------------------------------------------------------------------------------------- ### iCSR.info

//region iCSR.Str - String utility functions------------------------------------------------------- ### iCSR.Str
    iCSR.Str.nowordbreak = function (s) { //replaces space with nonbreakingspaces
        return s.replace(/ /gi, '&nbsp;');
    };
    iCSR.Str.alphanumeric = function (_string, _replacer) {//replace all non a-z and 0-9 characters
        return _string.replace(/[^a-z0-9+]+/gi, _replacer || '');
    };
    iCSR.Str.toNumber = function (_string, _default) { //extract FIRST number from string or return _default
        if (typeof _string !== 'string') return _string;
        var _value = _string.match(/\d+/);
        if (_value) return _value[0];
        return _default;
    };
//endregion --------------------------------------------------------------------------------------- iCSR.Str

//region iCSR.fn - utility functions----------------------------------------------------------------### iCSR.fn
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
     * return a (choices) named value color object from a String or Array or Object
     * @param colorObject
     * @param choices
     * @returns {*}
     */
    iCSR.fn.extractcolors = function (colorObject, choices) {
        if (typeof colorObject === 'string') {
            var colors = colorObject.split(',');
            colorObject = {};
            for (var n = 0; n < choices.length; n++) {
                var choice = choices[n];
                var color = colors[n];
                if (!color)color = 'snow';
                colorObject[choice] = color;
            }
            //TODO proces colorObject when it is an Array, check Choices names
        }
        return colorObject;
    };

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
        iTrace(2, 'getfieldvalue:', typeof ctx, typeof ctx === 'string' ? ctx : ctx.CurrentFieldSchema.Name);
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
        var key = '', config = {
            ID: 0,
            Name: 'none',
            value: false
        }; //new config object so we do not work with this references

        function mergeConfig(addconfig) {//TODO: (high) this is a shallow copy
            for (key in addconfig) if (addconfig.hasOwnProperty(key)) {
                config[key] = addconfig[key]; //defaultsetting
            }
        }

        try {
            //if scope is the ctx object create a empty object
            bindconfig = bindconfig.hasOwnProperty('FieldType') ? {} : bindconfig;

            bindconfig.trace > 0 ? iCSR.traceon(bindconfig.trace) : iCSR.traceoff(iCSR.tracelevel);

            mergeConfig(initialconfig); //defaultsetting
            mergeConfig(bindconfig); //overwrite default settings

            //global configuration options overruling config
            if (iCSR.hasOwnProperty('Interactive')) {
                config.interactive = iCSR.Interactive;
            } else {

            }
            config.demonotice = "Download iCSR.js from iCSR.github.io ► the iCSR.js file you linked is for demonstration use only";
            //SharePoint specific configuration
            //Get Relevant properties from CurrentFieldSchema
            ['Name', 'Display Name', 'RealFieldName', 'FieldType', 'counter', 'Choices'].forEach(function (property) {
                config[property] = ctx.CurrentFieldSchema[property];
            });
            if (config.FieldType === 'Choice') {
                //still in Template.Status
            }
            //-c- Ctrl-F marker config
            config.ID = ctx.CurrentItem.ID;
            config.iid = GenerateIID(ctx);
            config.value = ctx.CurrentItem[config.Name]; //initial value
            config.valuenr = iCSR.Str.toNumber(config.value, false);
            config.shortlabel = config.valuenr ? iCSR.fn.label(config.value) : config.value; //if a valuenr then shorten it

            if (config.FieldType === 'DateTime') {
                config.days = GetDaysAfterToday(new Date(config.value));
                config.absdays = Math.abs(config.days);
                if (isNaN(config.days)) {
                    config.days = config.absdays = false;
                }
            }

            return (config);
        } catch (e) {
            iCSR.traceerror('getconfig', e, key, config);
        }
    };
    /**
     * pre-Process all configurations (global, Template, custom) into one configuration for a Template
     * @param config
     * @returns {iCSR.CFG.Priority.templates.default|{container, item, CSS}|iCSR.CFG.priority.templates.default}
     */
    iCSR.fn.getconfigTemplate = function (config) {//TODO (high) refactor getconfigtemplate
        iTrace(3, 'getconfigTemplate', config.template);

        var ispredefinedtemplate = config.templates.hasOwnProperty(config.template);
        var template = config.templates.default;//start with default template

        if (ispredefinedtemplate) {
            var customtemplate = config.templates[config.template];//overwrite with customtemplate
            for (var key in customtemplate) {
                if (customtemplate.hasOwnProperty(key)) template[key] = customtemplate[key];
            }
        } else {
            template.item = iCSR.Tokens.replace(config.template);
            //template.item = "<div class='[classname]' onclick=\\"[click]\\">" + config.template + "</div>";
        }
        //JavaScript variables are references, so we can also overwrite the input config
        config.template = template;
        return template;//also return a copy because the Template function uses a local var (for now)
    };


//endregion --------------------------------------------------------------------------------------- iCSR.fn

//region iCSR.CSS - CSS operations------------------------------------------------------------------### iCSR.CSS
    /*

     resources:
     http://www.cssscript.com/animated-progress-indicators-with-vanilla-javascript-and-css/
     */
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
        iTrace(2, 'added stylesheet', _styleEl.id);
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
     * append (create) StyleSheet and insert array of Rules
     * @param id - DOM element id
     * @param rules - Array of strings
     */
    iCSR.CSS.addStylesheetWithRules = function (id, rules) {
        try {
            var _styleEl = document.getElementById(id); //get existing stylesheet
            if (iCSR.ReloadCSSforeveryItem || !_styleEl) { //attach style only once
                if (iCSR.ReloadCSSforeveryItem && _styleEl) {
                    iCSR.DOM.deleteElement(_styleEl);
                }
                _styleEl = iCSR.CSS.appendStyleSheettoHEAD(id);
                iCSR.CSS.insertRulesfromArray(_styleEl, rules);
            }
        } catch (e) {
            iCSR.catch(e, 'iCSR.CSS.addStylesheetWithRules', id, rules);
        }
    };

    /**
     * Append CSS from Template config definition to the page
     * @param CSS
     * @param config
     * @returns {iCSR.CFG.Priority.templates.default.CSS|{container, containerDiv, choice, choicehover, iCSRdescription}|iCSR.CFG.Priority.templates.iCSRbar.CSS|{container, containerDiv, currenttext, currentlabel, choice, choicehover, iCSRdescription}|{}|*}
     */
    iCSR.CSS.appendTemplateCSS = function (CSS, config) {
        var rules = config.rules || [];
        CSS = CSS || false;

        if (typeof CSS === 'string') {
            CSS = config.templates[CSS];//get CSS from config definition
        }
        if (CSS) {
            for (var key in CSS) {
                if (CSS.hasOwnProperty(key) && key !== 'iCSRdescription') {
                    var rule = iCSR.Tokens.replace(CSS[key], config);
                    rules.push(rule);
                }
            }
            iCSR.CSS.addStylesheetWithRules(config.iCSRid, rules, true);
            iTrace(1, 'CSS:', CSS);
        } else {
            iCSR.traceerror('Missing CSS config.templates:', CSS);
        }
        return CSS;
    };

//endregion --------------------------------------------------------------------------------------- iCSR.CSS

//region iCSR.SP - SharePoint interactions using JSOM / REST----------------------------------------### iCSR.SP
//TODO: (high) How does this compare with SPUtility https://sputility.codeplex.com/ (last update feb 2015)

    iCSR = iCSR || {};
    iCSR.SP = {}; //namespace for SP related stuff

    iCSR.Status = function (text, color, title, first) {
        SP.SOD.executeFunc("sp.js", "SP.ClientContext", function () {
            if (!text || color === 0) {
                SP.UI.Status.removeAllStatus(true);
            }
            if (text) {
                var status = SP.UI.Status.addStatus(title || 'iCSR Demo', text, first || false);
                SP.UI.Status.setStatusPriColor(status, color || 'yellow');
                window.setTimeout(function () {
                    SP.UI.Status.removeStatus(status);
                }, 5000);
            }
        });
    };

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
        value = String(value);//make sure we are writing string values
        item.set_item(fieldname, value);
        item.update();
        iTrace(2, 'iCSR.SP.UpdateItem', ID, fieldname, typeof value);
        successFunc = successFunc || function () {
                iTrace(1, 'success SP.UpdateItem', ID, fieldname, value);
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

//endregion --------------------------------------------------------------------------------------- iCSR.SP

//region iCSR.DOM -  Generic DOM functions (related to SharePoint DOM structure, ids etc.)--------- ### iCSR.DOM

    iCSR = iCSR || {};
    iCSR.DOM = {}; //namespace for SP related stuff
    iCSR.DOM.fn = {}; //namespace for SP related stuff
    iCSR.DOM.Control = {}; //namespace for SP related stuff

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
     * Delete a DOM element
     * @param element
     */
    iCSR.DOM.deleteElement = function (element) {
        try {
            if (typeof element === 'string') {
                element = document.getElementById(element);
            }
            element.parentNode.removeChild(element);
        } catch (e) {
            iCSR.tracewarning('deleteElement error:', element);
        }
    };
    /**
     * Usage: in OnPostRender
     * new iCSR.DOM.Control.attachAllOption( 'Colors' );
     *
     * @param fieldname
     * @param allLabel
     */
    iCSR.DOM.Control.attachAllOption = function (fieldname, allLabel) {
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

//endregion --------------------------------------------------------------------------------------- iCSR.DOM

//region iCSR.Control.table--------------------------------------------------------------------------- ### iCSR.Control.table
    /**
     *  iCSR CONTROL:table - start definition*****************************************************************
     *
     * @param ctx
     */
    iCSR.Control.table = function (ctx) {
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

    /*DUPLICATES *****************************************************************************/
    /*
     Usage: in OnPostRender
     new iCSR.Control.duplicates(ctx,{title:'Title',color:'pink',buttonlabel:['Show Duplicates', 'Hide Duplicates']});
     */
    iCSR.Control.duplicates = function (ctx, cfg) {
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

//endregion --------------------------------------------------------------------------------------- iCSR.Control

//region iCSR.Template ------------------------------------------------------------------------------### iCSR.Template

//region --- iCSR.Template.Status ------------------------------------------------------------------ ### iCSR.Template.Status
    iCSR.CFG.Status = {
        iCSRid: 'Status',
        trace: 4,//custom tracelevel for this template
        colors: {
            "Not Started": 'lightgray',
            "Deferred": 'pink',
            "Waiting on someone else": 'gold',
            "In Progress": 'orange',
            "Completed": 'lightgreen'
        },
        textcolor: 'black',
        width: '20px',
        interactive: iCSR.CFG.interactive || true,
        html: '',
        Classcontainer: 'iCSR_Status_Container',
        //template: 'iCSRStatus',//default templates.nnn
        templates: {
            default: {
                container: "<div class='[Classcontainer]' style='background:[color];color:[textcolor]'>&nbsp;[value]&nbsp;</div>",
                CSS: {
                    container: ".[Classcontainer] {}",
                    iCSRdescription: 'Backgroundcolored Status label - default for all custom additions'
                }
            },
            textcolor: {
                container: "<div class='[Classcontainer]' style='color:[color]'>&nbsp;[value]&nbsp;</div>",
                CSS: { //object of strings with tokenized CSS definitions
                    container: ".[Classcontainer] {font-size:[fontsize];}",
                    iCSRdescription: 'Only text colored'
                }
            },
            block: {
                container: "<div class='[Classcontainer]'><div style='float:left;background:[color];width:[width]'>&nbsp;</div>&nbsp;[value]&nbsp;</div>",
                CSS: { //object of strings with tokenized CSS definitions
                    container: ".[Classcontainer] {font-size:[fontsize];}",
                    iCSRdescription: 'colored square in front of Status label'
                }
            },
            iCSRStatus: {
                CSS: { //object of strings with tokenized CSS definitions
                    container: ".[Classcontainer] {font-size:[fontsize];}",
                    iCSRdescription: 'Background colored'
                }
            }
        }
    };

    iCSR.Template.Status = function (ctx) {
        var html;
        var config = iCSR.fn.getconfig(ctx, iCSR.CFG.Status, this); //this = ctx.CurrentFieldSchema;//if not .bind() scope then this is CurrentFieldSchema
        iCSR.CFG.colorGroupheaders = false;
        if (iCSR.CFG.colorGroupheaders || !iCSR.SP.isGroupHeader(ctx)) {
            var replacetokens = iCSR.Tokens.replace.bind(config); //bind the current config to the function
            var template = iCSR.fn.getconfigTemplate(config);
            if (config.FieldType === 'Choice') {
                config.colors = iCSR.fn.extractcolors(config.colors, config.Choices);
            }
            config.color = config.colors[config.value];
            iCSR.CSS.appendTemplateCSS(template.CSS, config);
            html = replacetokens(template.container);
            iTrace(1, 'Status HTML:\n', html);
        } else {
            html = config.value;
        }
        return html;
    };
//endregion --------------------------------------------------------------------------------------- iCSR.Template.Status

//region --- iCSR.Template.DueDate ----------------------------------------------------------------- ### iCSR.Template.DueDate
    /**
     *
     * @type {{iCSRid: string, trace: number, ranges: Array, labels: string[], textcolor: string, interactive: boolean, html: string, Classcontainer: string, templates: {default: {container: string, CSS: {container: string, containerDiv: string, iCSRdescription: string}}}, iCSRdescription: string}}
     */
    iCSR.CFG.DueDate = {
        iCSRid: 'DueDate',
        trace: 4,//custom tracelevel for this template
        ranges: ('#f55,-21,#f7a,-14,#fab,-7,#fda,-10,pink,0,#cf9,7,#9fa').split(','),
        labels: ['No Due Date', 'days left', 'days past'],
        //colors: ['red', 'orange', 'green'],
        textcolor: 'black',
        interactive: iCSR.CFG.interactive || true,
        html: '[absdays] [label]',
        Classcontainer: 'iCSR_DueDate_Container',
        templates: {
            default: {
                container: "<div class='[Classcontainer]' style='background-color:[color]'>[html] [value]</div>",
                CSS: {
                    container: ".[Classcontainer] {}",
                    containerDiv: ".[Classcontainer]>div {position:relative;float:left;}",
                    iCSRdescription: 'reusable generic CSS for DateTime'
                }
            }
        },
        iCSRdescription: 'iCSR DueDate configuration'
    };
    /**
     *
     * @param ctx
     * @returns {*}
     * @constructor
     */
    iCSR.Template.DueDate = function (ctx) {
        var html;
        var config = iCSR.fn.getconfig(ctx, iCSR.CFG.DueDate, this); //this = ctx.CurrentFieldSchema;//if not .bind() scope then this is CurrentFieldSchema
        var replacetokens = iCSR.Tokens.replace.bind(config); //bind the current config to the function
        var template = iCSR.fn.getconfigTemplate(config);
        iCSR.CSS.appendTemplateCSS(template.CSS, config);
        var color = 0;
        while (Number(config.ranges[color + 1]) < config.days) color += 2; //loop to find color
        config.color = config.ranges[color];
        config.label = config.labels[config.days > 0 ? 1 : 2];
        html = config.days ? replacetokens(template.container) : config.labels[0];
        iCSR.DOM.waitforelement(config.iid, function () { //TODO: (low) CSR fix elementfound (tried it twice, ask on SO)
            var TR = document.getElementById(config.iid); //temp fix, elementfound doesn't work
            var TD = TR.cells[config.counter]; //current column
            if (Number(config.days))(config.TD ? TD : TR).style.backgroundColor = config.color;
        }, 10);
        iTrace(1, 'DateTime HTML:\n', html);
        return html;
    };
    iCSR.Template.colorDate = function (ctx) {
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
            var TD = false;//TR.cells[fieldschema.counter - 1]; //current column
            if (Number(days))(colorelement === 'TD' ? TD : TR).style.backgroundColor = ranges[color];
        }, 10);
        var html = isNaN(days) ? labels[0] : "<div style='background-color:{0}'>{1} {2}</div>";
        return String.format(html, ranges[color], Math.abs(days), labels[days > 0 ? 1 : 2]);
    };
//endregion ---------------------------------------------------------------------------------------- iCSR.Template.DueDate

//region --- iCSR.Template.PercentComplete --------------------------------------------------------- ### iCSR.Template.PercentComplete
    /**
     *
     */
    iCSR.CFG.PercentComplete = {
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
    iCSR.Template.PercentComplete = function (ctx) {
        var config = iCSR.fn.getconfig(ctx, iCSR.CFG.PercentComplete, this); //this = ctx.CurrentFieldSchema;//if not .bind() scope then this is CurrentFieldSchema
        config.cssreload = true; //force reloading of CSS when live-testing config settings
        config.barid = ctx.wpq + '_' + config.ID; //unique id to this progressBar//TODO (high) move to getconfig
        if (config.unique) config.CSSid += config.barid; //custom class for every progressBar
        if (!config.update) {
            config.update = function (progressBar) {
                iTrace(2, 'using default SharePoint JSOM code to update', config.Name, progressBar);
                SP.SOD.executeOrDelayUntilScriptLoaded(function updateProgress() {
                    var listID = SP.ListOperation.Selection.getSelectedList();
                    iCSR.SP.UpdateItem(listID, progressBar.config.ID, progressBar.config.Name, progressBar.value / 100);
                }, 'sp.js');
            };
        }
        return new iCSR.Control.PercentComplete(config).html();
    };
//region --- iCSR.Control.PercentComplete ---------------------------------------------------------- ### iCSR.Control.PercentComplete
    iCSR.Control.PercentComplete = function (config) {
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
        iTrace(2, 'progressBar', cfg.ID, progressBar);

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
                if (nr === currentProgress) html += " class='currentProgress'";//o365cs-base.o365cst = UI color
                if (currentProgress === 0 || nr > currentProgress) html += " onclick='" + progressBar.barid + ".progressClicked(this)'"; //attach click handler for higher values only
                html += " style='width:" + nr * 10 + "%'>";
                if (cfg.scale || nr === currentProgress) html += nr * 10; //display scale value
                html += "</div>";
            }
            return "<div id='" + progressBar.barid + "' class='" + cfg.CSSid + "'>" + html + "</div>";
        };
        progressBar.setValue = function (nr) { //input value van be in 'nr %' string notation
            progressBar.value = iCSR.Str.toNumber(nr, 0);// 0-100 without %
            progressBar.currentnr = Math.round(progressBar.value / 10); // Rounded values 0 to 10
            iTrace(1, nr, progressBar.value, progressBar);
        };
        progressBar.resettozero = function () {
            document.getElementById(progressBar.segments[progressBar.currentnr]).className = ''; //reset previous selection
        };
        progressBar.progressClicked = function (el) {
            event.preventDefault();
            event.stopPropagation();
            el = (typeof el.click === 'function') ? el : el.srcElement;
            if (progressBar.currentnr) progressBar.resettozero();
            progressBar.setValue(el.innerHTML);
            el.className = "currentProgress";
            if (cfg.interactive) progressBar.updateFunction(progressBar);
        };
        progressBar.addCSS();
        progressBar.setValue(cfg.value || configError('missing .value'));
        window[progressBar.barid] = progressBar; //extra global reference to all progressBars
        ctx.iCSR = ctx.iCSR || {}; //store progressBars on the global ctx object//TODO (high) don't do this
        ctx.iCSR.PercentComplete = ctx.iCSR.PercentComplete || [];
        ctx.iCSR.PercentComplete.push(progressBar);
        return progressBar.html();
    };
//endregion --------------------------------------------------------------------------------------- iCSR.Control.PercentComplete

//endregion --------------------------------------------------------------------------------------- iCSR.Template.PercentComplete

//region --- iCSR.Template.Priority ---------------------------------------------------------------- ### iCSR.Template.Priority
    /** IDE ignore definitions in String (escaped double quotes to keep onclick working and img src references which IDE can't recognize*/
    //noinspection BadExpressionStatementJS,HtmlUnknownTarget
    /**
     * Template Configuration
     */
    iCSR.CFG.Priority = {
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
                item: "<span class=\"[classname]\" style=\"color:[color]\" onclick=\"[click]\">[label]</span>",
                CSS: {
                    container: ".[Classcontainer] {}",
                    containerDiv: ".[Classcontainer]>div {position:relative;float:left;}",
                    choice: ".[Classchoice] {cursor:pointer;opacity:.2}",
                    choicehover: ".[Classchoice]:hover {opacity:1;border-color:black}",
                    iCSRdescription: 'reusable generic CSS for KPI indicators',
                    demoware: "body::after{color:#FCD500;background:#005AA9;content:'[demonotice]';position:fixed;bottom:30px;width:100%;left:0px;font-size:21px;padding:5px;text-align:center;}"
                }
            },
            iCSRbar: {
                item: "<div class=\"[classname]\" style=\"background-color:[color]\" onclick=\"[click]\">[label]</div>",
                CSS: { //object of strings with tokenized CSS definitions
                    container: ".[Classcontainer] {width:[width];}",
                    containerDiv: ".[Classcontainer]>div {position:relative;float:left;display:inline;border:1px solid grey}",
                    currenttext: ".[Classcurrent] {font-size:11px;color:[textcolor]}",
                    currentlabel: ".[Classcurrent] {width:[widthCurrent];text-align:center;padding:2px;}",
                    currentnoninteractive: ".[Classcurrent].NonInteractive {width:100%}",
                    choice: ".[Classchoice] {width:[widthChoice];cursor:pointer;opacity:.4}",
                    choicehover: ".[Classchoice]:hover {opacity:1;border-color:black}",
                    iCSRdescription: 'CSS for the iCSR default priority interaction'
                }
            },
            kpi1: {
                item: '<span class="[classname]" onclick=\"[click]\"><img src="[layouts]/kpidefault-[nr].gif"></span>' //default sharepoint images in the layouts folder
            },
            kpi2: {
                item: "<span class='[classname]' onclick=\"[click]\"><img src='[layouts]/kpipeppers-[nr].gif'></span>" //default sharepoint images in the layouts folder
            },
            kpi3: {
                item: "<span class='[classname]' onclick=\"[click]\"><img src='[layouts]/kpipepperalarm-[nr].gif'></span>" //default sharepoint images in the layouts folder
            },
            kpi4: {
                item: "<span class='[classname]' onclick=\"[click]\"><img src='[layouts]/kpinormal-[nr].gif'></span>" //default sharepoint images in the layouts folder
            }
        },
        iCSRdescription: 'iCSR priority configuration'
    };
    iCSR.Template.Priority = function (ctx) {
        var config = iCSR.fn.getconfig(ctx, iCSR.CFG.Priority, this); //this = ctx.CurrentFieldSchema;//if not .bind() scope then this is CurrentFieldSchema

        var replacetokens = iCSR.Tokens.replace.bind(config); //bind the current config to the function

        var template = iCSR.fn.getconfigTemplate(config);
        iCSR.CSS.appendTemplateCSS(template.CSS, config);

        config.nr = "0"; //trick replacement in accepting first value as 0 string
//    iCSR.traceon(0);
        iTrace(0, config.iCSRid, 'config.template =', config.template, '\n config:', config, '\n item:', template.item);
        for (var keyvalue in config.values) { // jshint ignore:line, Object has those keyvalues
            config.keyvalue = keyvalue;
            var iscurrent = config.value === keyvalue;
            config.click = replacetokens(config.clickupdate);
            config.classname = config[iscurrent ? 'Classcurrent' : 'Classchoice'];
            if (!config.interactive) config.classname += ' NonInteractive';//add CSS class for non-interactive Template
            config.color = config.colors ? config.colors[config.nr] : config.values[config.keyvalue];
            config.label = iscurrent ? config.shortlabel : '&nbsp;&nbsp;';
            var item = replacetokens(template.item || config.template);
            if (iscurrent || config.interactive) config.html += item;
            config.nr++;
        }
        var html = replacetokens(config.interactive ? template.container : config.html);
        iTrace(1, 'Priority HTML:\n', html);
        return html;
    };

//endregion iCSR.Template.Priority ----------------------------------------------------------------- ### iCSR.Template.Priority

//endregion ---------------------------------------------------------------------------------------- iCSR.Template


    /**
     * iCSR.Me
     * @param ctx
     * @returns {*}
     * @constructor
     */


//region ctx object inspector can be used from the F12 console - type 'ic' in the console
    iCSR.SP.getctxobjectinfo = function (ctx_object, fieldnames) {
        var fields = {};
        ctx_object.forEach(function (field) {
            var fieldinfo = {};
            fieldnames.split(',').forEach(function (prop) {
                fieldinfo[prop] = field[prop];
            });
            fields[field.counter] = fieldinfo;
        });
        return (fields);
    };
    if (!window.ic) {
        //noinspection JSUnusedGlobalSymbols
        Object.defineProperty(window, 'ic', {
            configurable: true,
            get: function () {
                if (ctx) return console.table(iCSR.SP.getctxobjectinfo(ctx.ListSchema.Field, "DisplayName,Name,RealFieldName,FieldType,Type,role"));
            }
        });
    }
//endregion
//iCSR.init();
    SP.SOD.notifyScriptLoadedAndExecuteWaitingJobs('iCSR');

///////
    console.info('iCSR scriptfile loaded');
})(window);