/**
 * iCSR.js - Office365/SharePoint (CSR) Client Side Rendering JavaScript programming support library
 * http://iCSR.gitbub.io
 * license: MIT
 */
(function (global) {
    global.iCSR = global.iCSR || {};//One Namespace for all iCSR functionality
    var iCSR = global.iCSR;
    window.iCSR = iCSR;//just to be sure, in case iCSR is hosted in another Namespace
    Object.defineProperties(iCSR, {
        _VERSION: {
            value: '0.9', writable: false
        },
        _DEMO: {
            value: true, writable: true//set value: to false when you have downloaded iCSR.js to use in your Production environment
        },
        ReloadCSSforeveryItem: {
            value: true, writable: true//Re-applies CSS for every item; easy for Cisar developing, set value: to false in Production
        },
        Interactive: {//(optional) indicates default setting (overrides Template config!) to be used by all iCSR Templates
            value: true, writable: true
        }
    });
    /**
     * How to use/read/change this file iCSR.js
     *
     * iCSR.js was written to be used by both entry-level CSR(JavaScript) users and more advanced developers
     *
     * Github
     * - please use Github for questions, feature requests
     * if you make changes please Fork the source on GitHub and make a Pull Request
     *
     * File layout
     * - (un)collapse regions with Ctrl(shift) + and - (available in decent IDEs like WebStorm or Visual Studio)
     *
     * in F12 Developers console
     * - use 'ic' to display ctx object information
     * - add iCSR.traceon(2) to set tracelevel and output to console
     *
     * JavaScript style notes
     * - I am sorry, I could NOT find any use for jQuery
     * - iCSR Global namespace holds all content (apart from the ic F12 console inspector)
     * - _ (underscore) prefixed variables are local and safe to minify/obfuscate
     *
     * main Sub Namespaces: (there are more, see Namespaces Region below)
     * - iCSR.Template = IKEA style CSR Templates
     * - iCSR.SP = SharePoint related code
     * - iCSR.fn = generic support functions
     * - iCSR.Str = String functions
     * - iCSR.Date = Date functions
     * - iCSR.CSS = CSS code
     *
     * Functions:
     * - iCSR.Me - auto executes Templates and Controls based on the ctx object fieldnames or fieldtypes
     *
     *
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

//region Global overrides - SharePoint core.js is not loaded yet ---------------------------------- ### Global Functions
    /**
     * Get Ancestor up in the DOM tree - SharePoint overloads this in (loaded later) core.js
     * @param _element
     * @param tagType
     * @returns {*}
     * @constructor
     */
    function GetAncestor(_element, tagType) {
        while (_element !== null && _element.tagName !== tagType) _element = _element.parentNode;
        return _element;
    }

//endregion --------------------------------------------------------------------------------------- Global Functions

//region iCSR Namespaces -------------------------------------------------------------------------- ### iCSR Namespaces
    /**
     * use any predefined iCSR code declared in previous libraries, all functionality in this file will be appended
     */
    iCSR.Template = iCSR.Template || {};    // Template functions return HTML for easy execution in a CSR file
    iCSR.Items = {};                        // Store all ListItems configurations by Fieldname
    iCSR.SP = iCSR.SP || {};                // SP-SharePoint related functions
    iCSR.fn = iCSR.fn || {};                // generic support functions
    iCSR.Control = iCSR.Control || {};      // controllers created with new () - for use in OnPostRender functions
    iCSR.Str = iCSR.Str || {};              // String functions because .prototyping is not 100% safe
    iCSR.Date = iCSR.Date || {};            // DateTime functions (saves from loading momentJS)
    iCSR.CSS = iCSR.CSS || {};              // CSS storage and actions
    iCSR.Tokens = iCSR.Tokens || {};        // String functions and Custom function declarations for handling [token] in Strings
    iCSR.CFG = iCSR.CFG || {                // configuration options for all Templates
            interactive: false,
            tracing: true,
            objectDescription: 'iCSR.CFG global configurations' // extra descriptions inside objects so it can be displayed in the F12 console
        };
//endregion --------------------------------------------------------------------------------------- iCSR Namespaces

//region iCSR.Init -------------------------------------------------------------------------------- ### iCSR.init
    /**
     * Initialize iCSR
     */
    iCSR.init = function () {
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
//endregion ---------------------------------------------------------------------------------------- iCSR.init

//region iCSR.Tokens ------------------------------------------------------------------------------ ### iCSR.Tokens
    /**
     * Strings may contain [token] tokens to be replaced by a corresponding config.[token] value     *
     *                                                                                               *
     * config.firstword ='Hello';                                                                    *
     * config.location='[firstword] World';                                                          *
     * iCSR.Tokens.replace( '[location]!' );   ==>  'Hello World!'                                   *
     *                                                                                               *
     * Known issues:                                                                                 *
     * Nested [[token]] does not work, creates '[token',']' array                                    *
     *                                                                                               *
     * */
    iCSR.Tokens.maxtokenstringlength = 15;
    /**
     * Convert one String to an array, split on specified token indicator [] or () or whatever
     * "Hello [location]" -> 'Hello','location',
     * "svgcircle(20)" -> 'svgcircle','20'
     *
     * @param _tokenstring
     * @param _tokenidentifier
     * @returns {string[]|*|Array}
     */
    iCSR.Tokens.StringToTokenArray = function (_tokenstring, _tokenidentifier) {
        var _tokenized = _tokenstring;
        if (typeof _tokenized === 'string') {
            var _regexArray = ['(.+?)'];//match any wordlength
            _tokenidentifier = _tokenidentifier || '[]';//default token is [tokenname]
            var _halflength = parseInt(_tokenidentifier.length / 2);//split _tokenindentifier in 2 parts (ready for identiefiers like ##tokenname##)
            _tokenidentifier = _tokenidentifier.match(new RegExp('.{1,' + _halflength + '}', 'g'));//split identifier in chunck size
            if (_tokenidentifier.length === 2) {
                _regexArray.unshift('\\' + _tokenidentifier[0]);//add escaped leading identifier
                _regexArray.push('\\' + _tokenidentifier[1]);//add second escaped identifier
                var regExp = new RegExp(_regexArray.join(''), 'g');
                _tokenized = _tokenstring.split(regExp);
                iTrace(4, 'iCSR.Tokens.StringToTokenArray with: ', _tokenidentifier, {
                    "_tokenstring": _tokenstring,
                    "_tokenized": _tokenized
                });
            } else {
                iCSR.traceerror('invalid _tokenidentifier', _tokenidentifier);
            }
        } else {
            iCSR.tracewarning('iCSR.Tokens.StringToTokenArray with: ', _tokenstring);
        }
        return _tokenized;
    };

    /**
     *
     * @param _tokenstring
     * @param _tokenconfig
     * @returns {*}
     */
    iCSR.Tokens.replacetoken = function (_tokenstring, _tokenconfig) {
        var _tokenized = _tokenstring;
        if (_tokenized !== "" && _tokenized !== "." && _tokenized !== "iCSR") {//allways ignore these tokens
            if (_tokenconfig.hasOwnProperty(_tokenstring)) {
                _tokenized = _tokenconfig[_tokenstring]; // predefined tokens defined in .config object take precedence over token
                if (typeof _tokenized === 'function') {
                    //TODO: (normal) ?? do we want to allow script creation... cool to investigate how far this would lead
                }
            }
            if (iCSR.Tokens.hasfunction(_tokenized)) {
                var _functionDef = iCSR.Tokens.StringToTokenArray(_tokenstring, '()'),//token functions like: svgcircle(20)
                    _functionname = _functionDef[0],
                    _parameters = _functionDef[1];
                _tokenized = iCSR.Tokens.callfunction(_functionname, _parameters);
            }
            if (_tokenstring === _tokenized) {//nothing was changed
                var strippedtoken = iCSR.Str.alphanumeric(_tokenstring);
                if (strippedtoken === _tokenstring) {//token is not declared yet
                    _tokenized = '[' + _tokenstring + ']';
                    iTrace(4, 'replacetoken UNTOUCHED: ', _tokenized);
                }
            } else {
                if (_tokenized) {
                    iTrace(3, 'replacetoken:', _tokenstring, ' ==> ', _tokenized);
                }
            }
        }
        return _tokenized;
    };


    /**
     * replace 'Hello [location]!' with propertyvalue from _tokenconfig {location:'World'}  => 'Hello World!'
     * The functions loops to de-token any nested token definitions eg: location="from [countryname]"
     *
     * @param _string
     * @param _tokenconfig
     * @returns {*}
     */
    iCSR.Tokens.replace = function (_string, _tokenconfig) {
        if (!_string) {
            iCSR.tracewarning('empty _string in Token replace');
            return _string;
        }

        _tokenconfig = _tokenconfig || this; //tokens defined in optional .bind(config)
        var _tokenized;//working array breaking string into tokens
        var tokencount = 1;//count how many tokens are in the array, to break out of the loop when all work is done
        var loop;
        for (loop = 0; loop < 10; loop++) {//too lazy to develop recursive code
            _tokenized = iCSR.Tokens.StringToTokenArray(_string, '[]');//make array
            if (_tokenized.length > 1 || _tokenized.length === 1 && _tokenized[0].length < iCSR.Tokens.maxtokenstringlength) {
                _tokenized = _tokenized.map(function (token) {
                    return iCSR.Tokens.replacetoken(token, _tokenconfig);
                });// jshint ignore:line
            }
            _string = _tokenized.join('');//make it one string again
            if (_tokenized.length === tokencount) break;//exit loop if no more tokens need to be replaced
            tokencount = _tokenized.length;
        }
        iTrace(3, 'replacetokens', '(' + typeof _string + ') _tokenized in ', loop, 'iterations', {
            "string": _string,
            "array": _tokenized
        });
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
     * @param _functionname
     * @returns {boolean}
     */
    iCSR.Tokens.hasfunction = function (_functionname) {
        iTrace(5, 'hasfunction:', typeof _functionname, _functionname);
        var hasFunction = false;
        if (typeof(_functionname) === 'string') {
            _functionname = _functionname.split('(')[0];
            if (iCSR.Tokens.functions.hasOwnProperty(_functionname)) {
                hasFunction = true;
            }
        }
        return hasFunction;
    };

    /**
     *
     * @param _functionname
     * @param _parameters
     * @param silent
     * @returns {*}
     */
    iCSR.Tokens.callfunction = function (_functionname, _parameters, silent) {
        iTrace(1, 'callfunction:', silent ? '(silent)' : '', _functionname, '(', _parameters, ')');
        var tokenfunctionResult;
        if (iCSR.Tokens.hasfunction(_functionname)) {
            try {
                var tokenfunction = iCSR.Tokens.functions[_functionname];
                iTrace(2, 'call: ', _functionname, '(', _parameters, ')\n\t', tokenfunction);
                tokenfunctionResult = tokenfunction.call(this, _parameters);//TODO: use Template config scope
            } catch (e) {
                iCSR.catch(e, 'callfunction:' + _functionname);
            }
        } else {
            if (!silent) {
                iCSR.traceerror('Missing tokenfunction', '', _functionname);
            }
        }
        return tokenfunctionResult;
    };

//endregion --------------------------------------------------------------------------------------- iCSR.Tokens

//region iCSR.info & iCSR.trace-------------------------------------------------------------------- ### iCSR.info
    iCSR.info = function () {
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
    iCSR.traceheader = function () {
        console.clear();
        console.info('%c iCSR.js - ' + iCSR._VERSION + ' ', 'background:#005AA9;color:#FCD500;font-weight:bold;font-size:20px;');
    };
    iCSR.trace = function (tracelevel, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15) {
        //TODO: (low) refactor to get rid of those ugly vars
        var p1 = '';
        if (tracelevel === 'string') {
            tracelevel = 0;
            p1 = tracelevel;
        }
        var tracelevelcolors = ['background:beige;', 'background:green', 'background:lightgreen', 'background:lightcoral;', 'background:indianred;'];
        var tracelevelcolor = tracelevelcolors[tracelevel];
        if (iCSR.CFG.errorcount < 1) {
            if (iCSR.CFG.tracing && console && iCSR.tracelevel >= tracelevel) {
                console.info('%c iCSR ' + '%c ' + tracelevel + ' ' + p1 + '', 'background:#005AA9;color:#FCD500;font-weight:bold;', tracelevelcolor, p2 || '', p3 || '', p4 || '', p5 || '', p6 || '', p7 || '', p8 || '', p9 || '', p10 || '', p11 || '', p12 || '', p13 || '', p14 || '', p15 || '');
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
        iCSR.traceheader();
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
    iCSR.catch = function (e, _functionname, functionreference) { //generic try/catch error reporting
        // Compare as objects
        if (e.constructor === SyntaxError) {
            iCSR.traceerror(_functionname, 'programming error!', functionreference); // There's something wrong with your code, bro
        }
        // Get the error type as a string for reporting and storage
        iCSR.traceerror(_functionname, e.constructor.name, functionreference, e); // SyntaxError
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
    iCSR.Str.label = function (value) {// (1) Label => Label
        //TODO make generic wih regex to process [n] Label and (1)Label return Object {nr:nr,label:label}
        var valuemarker = ') ',
            label = value.indexOf(valuemarker) > 0 ? value.split(valuemarker)[1] : value;

        return (label);
    };
//endregion --------------------------------------------------------------------------------------- iCSR.Str

//region iCSR.Date - DateTime utility functions --------------------------------------------------- ### iCSR.Date
    iCSR.Date.object = function (date) {
        if (typeof date === 'string') date = new Date(date);
        date = date || new Date();//today
        var _date = {
            "yyyy": date.getFullYear(),
            "MM": date.getMonth() + 1,//months in JavaScript are zero based
            "dd": date.getDate(),
            "hh": date.getHours(),
            "mm": date.getMinutes(),
            "ss": date.getSeconds()
        };
        _date.yy = String(_date.yyyy).substring(2);
        return _date;
    };
    iCSR.Date.add = function (date, numberOfDays, numberOfMonths, numberOfYears) {
        date = date || new Date();//today
        var _Date = iCSR.Date.object(date);
        return new Date(
            _Date.yyyy + (numberOfYears ? numberOfYears : 0),
            _Date.MM + (numberOfMonths ? numberOfMonths : 0) - 1,//months in JavaScript are zero based
            _Date.dd + (numberOfDays ? numberOfDays : 0),
            _Date.hh,
            _Date.mm,
            _Date.ss
        );
    };
    iCSR.Date.format = function (date, datestring) {//"YYYY"
        var isSP = true;
        datestring = datestring || "yyyy-MM-dd";
        date = date || new Date();//today
        if (isSP) {
            return String.format("{0:" + datestring + "}", date);//TODO dates/months need leading zeros
        }

        var _Date = iCSR.Date.object(date);
        for (var datekey in _Date) {
            if (_Date.hasOwnProperty(datekey)) {
                var replacekey = new RegExp(datekey, 'g');
                datestring = datestring.replace(replacekey, _Date[datekey]);
            }
        }
        return datestring;
    };


//endregion --------------------------------------------------------------------------------------- iCSR.Date

//region iCSR.fn - utility functions----------------------------------------------------------------### iCSR.fn
    /**
     * @return {string}
     */
    iCSR.fn.MMDDYYYY = function (_date, _separator) {
        _separator = _separator || '/';
        _date = new Date(_date);
        return ((_date.getMonth() + 1) + _separator + _date.getDate() + _separator + _date.getFullYear());
    };
    iCSR.fn.addItem = function (config) {
        var _key = config.Name;
        if (!iCSR.Items.hasOwnProperty(_key)) {//init Array
            iCSR.Items[_key] = [];
        }
        iCSR.Items[_key].push(config.value);
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
            if (choices) {
                colorObject = {};
                for (var n = 0; n < choices.length; n++) {
                    var choice = choices[n];
                    var color = colors[n];
                    if (!color)color = 'snow';
                    colorObject[choice] = color;
                }
            } else {
                colorObject = colors;
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
            }
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
            config.shortlabel = config.valuenr ? iCSR.Str.label(config.value) : config.value; //if a valuenr then shorten it
            config.nonbreaklabel = iCSR.Str.nowordbreak(config.shortlabel);
            config.emptystring = config.value === '';

            if (config.FieldType === 'DateTime') {
                var _Date = new Date(config.value);
                config.days = GetDaysAfterToday(_Date);
                config.datepickervalue = iCSR.Date.format(_Date, 'yyyy-MM-dd');
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
     * @returns {*}
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
            if (config.template) template.item = iCSR.Tokens.replace(config.template);
            //template.item = "<div class='[classname]' onclick=\\"[click]\\">" + config.template + "</div>";
        }
        //JavaScript variables are references, so we can also overwrite the input config
        config.template = template;
        return template;//also return a copy because the Template function uses a local var (for now)
    };

    iCSR.fn.getFunctionName = function (fn) {
        var f = typeof fn === 'function';
        var s = f && ((fn.name && ['', fn.name]) || fn.toString().match(/function ([^\(]+)/));
        return (!f && 'not a function') || (s && s[1] || 'anonymous');
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
    /**
     * insert one CSS rule to an existing element
     * @param rule
     * @param _element
     */
    iCSR.CSS.insertRuleinStyleSheet = function (_element, rule) {
        //TODO: _element=_element||this;//to bind(_element)
        if (_element) {
            try {
                _element.sheet.insertRule(rule, 0);
            } catch (e) {
                iCSR.tracewarning('ignoring CSS definition:', '"' + rule + '"');
            }
        } else {
            iCSR.traceerror('Not a STYLE sheet', _element);
        }
    };
    /**
     * insert an array of CSS rules to an existing STYLE element
     * @param _element
     * @param rules
     */
    iCSR.CSS.insertRulesfromArray = function (_element, rules) {
        if (_element && _element.tagName === 'STYLE') {
            rules.forEach(function (rule) {
                iCSR.CSS.insertRuleinStyleSheet(_element, rule);
            });
        } else {
            iCSR.traceerror('Not a STYLE element:', _element);
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
     * @param traceCSS
     * @returns {*}
     */
    iCSR.CSS.appendTemplateCSS = function (CSS, config, traceCSS) {
        var rules = config.rules || [];
        CSS = CSS || false;

        if (typeof CSS === 'string') {//CSS is a reference to a CSS definition in config.templates
            CSS = config.templates[CSS];
        }
        if (CSS) {
            for (var key in CSS) {
                if (CSS.hasOwnProperty(key) && key !== 'iCSRdescription') {
                    var rule = iCSR.Tokens.replace(CSS[key], config);
                    rules.push(rule);
                    if (traceCSS) iTrace(2, 'CSS: ', key, rule);
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

    iCSR.SP.SPStatuscount = 0;
    iCSR.SPStatus = function (text, color, title, first, permanent) {
        SP.SOD.executeFunc("sp.js", "SP.ClientContext", function () {
            var Status = SP.UI.Status;
            if (!text || color === 0) {
                Status.removeAllStatus(true);
            }
            if (text) {
                iCSR.SP.SPStatuscount++;
                if (iCSR.SP.SPStatuscount === 10) {
                    var status = Status.addStatus('iCSR', 'Too many errors', false);
                    Status.setStatusPriColor(status, 'red');
                } else if (iCSR.SP.SPStatuscount < 10) {
                    var status = Status.addStatus(title || 'iCSR Demo', text, first || false);
                    Status.setStatusPriColor(status, color || 'yellow');
                    if (!permanent) {
                        window.setTimeout(function () {
                            iCSR.SP.SPStatuscount--;
                            Status.removeStatus(status);
                        }, 5000);
                    }
                }

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
        //
        //value = String(value);//make sure we are writing string values
        item.set_item(fieldname, value);
        item.update();
        iTrace(0, 'iCSR.SP.UpdateItem', ID, fieldname, typeof value);
        successFunc = successFunc || function () {
                iTrace(1, 'success SP.UpdateItem', ID, fieldname, value);
                iCSR.SP.refreshView();
            };
        errorFunc = errorFunc || function () {
                iCSR.traceerror('Error Updating');
            };
        context.executeQueryAsync(successFunc, errorFunc);
    };
    iCSR.SP.addday = function (listID, ID, currentDate, dayoffset) {
        //get id element from parent
        //iCSR.SP.UpdateItem(listID,ID);

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
        var _element = document.getElementById(id);
        if (_element) { //if the _element exists, execute callback by putting it at end of the event queue; not using 'callback(element)'
            setTimeout(callback.bind(null, _element), 0);
        } else {
            if (yieldtime < 0) { //if done waiting then something is wrong
                iCSR.traceerror('iCSR.DOM.waitforelement failed:', id);
            } else { //we're getting less and less patient.. is that element there yet?
                setTimeout(iCSR.DOM.waitforelement.bind(null, id, callback, yieldtime - 1), yieldtime || 100);
            }
        }
    };

    iCSR.DOM.appendHTML = function (_parentelement, html, _elementType, className) {
        className = className || '';
        _elementType = _elementType || 'DIV';
        var _element = document.createElement(_elementType);
        _element.innerHTML = html;
        _element.className = className;
        return _parentelement.appendChild(_element);
    };
    /**
     * Delete a DOM element
     * @param _element
     */
    iCSR.DOM.deleteElement = function (_element) {
        try {
            if (typeof _element === 'string') {
                _element = document.getElementById(_element);
            }
            _element.parentNode.removeChild(_element);
        } catch (e) {
            iCSR.tracewarning('deleteElement error:', _element);
        }
    };

    iCSR.DOM.footer = function (message) {//TODO use for iCSR messaging
        message = message || "Download iCSR.js from iCSR.github.io ► the iCSR.js file you linked to is for demo use only";
        var demoCSS = ["body::after{color:#FCD500;background:#005AA9;content:'" + message + "';position:fixed;bottom:30px;width:100%;left:0px;font-size:16px;text-align:center;}",
            ".iCSRlogo {position:fixed;bottom:50px;left:30px;width:96px;height:96px;z-index:1}",
            ".helplinks {width:300px}"
        ];
        iCSR.CSS.addStylesheetWithRules('iCSR', demoCSS);
        var helplinks = "<h3>Support Links:</h3>";
        helplinks += "<a href='https://github.com/365CSI/iCSR/blob/master/Documentation/quickstart.md' target='_new'>iCSR Quickstart</a>";
        helplinks += "<br><a href='http://iCSR.github.io' target='_new'>iCSR on GitHub</a>";
        helplinks += "<br><a href='http://davidbau.com/colors/' target='_new'>colornames</a>";
        helplinks = "<div class='helplinks'>" + helplinks + "</div>";
        var html = "<table><tr><td><img src='https://365csi.nl/iCSR/ipcountlogo'></td><td valign='top'>" + helplinks + "</td></tr></table>";//referenced image counts how many request are made
        iCSR.DOM.waitforelement('contentRow', function () {
            iCSR.DOM.appendHTML(document.body, html, 'DIV', 'iCSRlogo');
        }, 50);
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
        this.options = [].map.call(this.elements, function (_element) { //make array of DOM node objects
            return (_element);
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

//region iCSR.Template ---------------------------------------------------------------------------- ### iCSR.Template

    /**
     * iCSR.Me
     * @param ctx
     * @returns {*}
     * @constructor
     */
    iCSR._ERRORCOUNT = 0;
    iCSR.Me = function (ctx) {
        try {
            var _fieldtype = ctx.CurrentFieldSchema.FieldType;
            var _fieldname = ctx.CurrentFieldSchema.RealFieldName;
            //console.log(_fieldname,'\ttype:\t',_fieldtype ,ctx.CurrentFieldSchema);
            if (iCSR.Template[_fieldname]) return iCSR.Template[_fieldname].call(this, ctx);
            var warning = 'No Template for: iCSR.' + _fieldname;
            iCSR.tracewarning(warning, '(' + _fieldtype + ')');
            iCSR.SPStatus(warning, 'yellow', 'iCSR:', false, true);
        } catch (e) {
            console.error(e);
            iCSR.SPStatus(e.message, 'red', 'iCSR error:', false, true);
        }
    };

//region --- iCSR.Template.Status ------------------------------------------------------------------ ### iCSR.Template.Status
    iCSR.Template.Status = function (ctx) {
        var templateId = 'Status';
        var html;
        var config = iCSR.fn.getconfig(ctx, iCSR.Template[templateId].configuration, this); //this = ctx.CurrentFieldSchema;//if not .bind() scope then this is CurrentFieldSchema

        if (config.colorGroupheaders || !iCSR.SP.isGroupHeader(ctx)) {
            var replacetokens = iCSR.Tokens.replace.bind(config); //bind the current config to the function
            var template = iCSR.fn.getconfigTemplate(config);
            config.colors = iCSR.fn.extractcolors(config.colors, config.Choices);
            config.color = config.colors[config.value];
            iCSR.CSS.appendTemplateCSS(template.CSS, config);
            if (config.value === "Waiting on someone else") config.value = "Waiting";
            config.value = iCSR.Str.nowordbreak(config.value);
            html = replacetokens(template.container);
            iTrace(1, 'Status HTML:\n\t', html);
        } else {
            html = config.value;
        }
        return html;
    };
    iCSR.Template.Status.configuration = {
        iCSRid: 'Status',
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
        },
        iCSRdescription: 'colorcode text/label based values'
    };
//endregion --------------------------------------------------------------------------------------- iCSR.Template.Status

//region --- iCSR.Template.DueDate ----------------------------------------------------------------- ### iCSR.Template.DueDate
    /**
     * @return {boolean}
     */
    iCSR.Template.DueDate = function (ctx) {
        var templateId = 'DueDate';
        var html;
        var config = iCSR.fn.getconfig(ctx, iCSR.Template[templateId].configuration, this); //this = ctx.CurrentFieldSchema;//if not .bind() scope then this is CurrentFieldSchema
        var replacetokens = iCSR.Tokens.replace.bind(config); //bind the current config to the function
        var template = iCSR.fn.getconfigTemplate(config);

        if (ctx.inGridMode) {
            ctx.ListSchema.Field.AllowGridEditing = false;
            return config.value;
            //return window.RenderFieldValueDefault(ctx);
        }
        if (!config.interactive) {
            //	config.input="[datepicker_chrome]";
            //config.input='[datepicker]';
        }
        iCSR.CSS.appendTemplateCSS(template.CSS, config, true);
        config.ranges = iCSR.fn.extractcolors(config.ranges);//make sure it is an array: color,days,color,days
        var colornr = 0;
        while (Number(config.ranges[colornr + 1]) < config.days) colornr += 2; //loop to find color
        config.color = config.ranges[colornr];
        config.label_nodate = config.labels[0];
        config.label_future = config.labels[1];
        config.label_past = config.labels[2];
        config.label = config.days > 0 ? config.label_future : config.label_past;

        if (typeof config.days === 'number') {
            //iCSR.DOM.waitforelement(config.iid, function () {// color TD cell or TR row
            //    var TR = document.getElementById(config.iid);
            //    var TD = TR.cells[config.counter]; //current column
            //    (config.TD ? TD : TR).style.backgroundColor = config.color;
            //}, 10);
            html = template.container;
        } else {
            html = config.datepicknodate;
        }
        html = replacetokens(html);
        iTrace(1, 'DateTime HTML:\n\t', html);
        return html;
    };
    //noinspection HtmlUnknownAttribute
    iCSR.Template.DueDate.configuration = {
        iCSRid: 'DueDate',
        ranges: ('#f55,-21,#f7a,-14,#fab,-7,#fda,0,#cf9,7,#9fa').split(','),
        labels: ['No Due Date', 'days left', 'days past'],
        onclick: "onclick='{event.stopPropagation();}'",
        onchange: "onchange=\"iCSR.SP.UpdateItem(false,'[ID]','[Name]',new Date(this.value))\" ",
        textcolor: 'inherit',
        width: "150px",
        height: '20px',
        paddingcontainer: "padding:0px 3px 0px 3px",
        interactive: iCSR.CFG.interactive || false,
        datepicker_chrome: "[absdays] [label] <input type='date' min='2000-12-31' [onclick] [onchange] value='[datepickervalue]' style='background-color:[color]'>",
        //interactive for non Chrome browser
        onclickSubtract: "onclick=\"iCSR.SP.UpdateItem(false,'[ID]','[Name]',iCSR.Date.add('[value]',-1))\" ",
        onclickAdd: "onclick=\"iCSR.SP.UpdateItem(false,'[ID]','[Name]',iCSR.Date.add('[value]',1))\" ",
        nextday: "next day",
        previousday: "previous day",
        setpreviousday: "<DIV class='[Classcontainer]update [Classcontainer]yesterday' [onclickSubtract]> [previousday] </DIV>",
        setnextday: "<DIV class='[Classcontainer]update [Classcontainer]tomorrow' [onclickAdd]> [nextday] </DIV>",
        datepicker: "<DIV class='iCSRdatepicker'>[setpreviousday] [setnextday]</DIV>",
        datepicknodate: "<div onclick=\"iCSR.SP.UpdateItem(false,'[ID]','[Name]',iCSR.Date.add(false,0))\" >[label_nodate]</div>",
        //non-interactive
        input: "<DIV class='iCSRdaycount'>[absdays] [label]</DIV><DIV class='iCSRdate'>[value]</DIV>[datepicker]",
        html: "",
        Classcontainer: 'iCSR_DueDate_Container',
        templates: {
            default: {
                container: "<div class='[Classcontainer]' style='background-color:[color]'>[input]</div>",
                CSS: {
                    container: ".[Classcontainer] {width:[width];color:[textcolor];[paddingcontainer];height:[height];padding:-2px 2px 0px 2px;}",
                    daycount: ".iCSRdaycount {position:relative;float:left;}",
                    date: ".iCSRdate {position:relative;float:right;}",
                    datepicker: ".iCSRdatepicker {position:relative;z-index:3;width:100%;height:[height];backgrouand:pink}",
                    dayselect: ".[Classcontainer]tomorrow,.[Classcontainer]yesterday {display:block;font-size:14px;position:absolute;width:60%}",
                    yesterday: ".[Classcontainer]yesterday {left:0%}",
                    tomorrow: ".[Classcontainer]tomorrow {right:0%;text-align:right}",
                    update: ".[Classcontainer]update {width:20px;height:[height];font-weight:bold;opacity:0}",
                    updatehover: ".[Classcontainer]update:hover {color:white;font-weight:bold;opacity:1;cursor:pointer;background:grey}",
                    input: ".[Classcontainer]>input {width:125px;border:none;margin-top:-4px;}",
                    iCSRdescription: 'reusable generic CSS for DateTime'
                }
            }
        },
        iCSRdescription: 'color code DateTime values from calculated x days past or x days to go'
    };

//endregion ---------------------------------------------------------------------------------------- iCSR.Template.DueDate

//region --- iCSR.Template.PercentComplete --------------------------------------------------------- ### iCSR.Template.PercentComplete
    /**
     *
     * @param ctx
     */
    iCSR.Template.PercentComplete = function (ctx) {
        var templateId = 'PercentComplete';
        var config = iCSR.fn.getconfig(ctx, iCSR.Template[templateId].configuration, this); //this = ctx.CurrentFieldSchema;//if not .bind() scope then this is CurrentFieldSchema
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
    iCSR.Template.PercentComplete.configuration = {
        CSSid: 'iCSRprogressBar', //class name for all progressBars
        colors: ['transparent', 'red', 'orangered', 'indianred', 'goldenrod', 'goldenrod', 'goldenrod', 'yellowgreen', 'mediumseagreen', 'forestgreen', 'green'],
        width: '180px',
        resourcelinks: 'https://jsfiddle.net/dannye/bes5ttmt/',
        iCSRdescription: 'display progress bar from 0.0 to 1.0 number field'
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
    iCSR.Template.Priority = function (ctx) {
        var templateId = 'Priority';
        var config = iCSR.fn.getconfig(ctx, iCSR.Template[templateId].configuration, this); //this = ctx.CurrentFieldSchema;//if not .bind() scope then this is CurrentFieldSchema

        var replacetokens = iCSR.Tokens.replace.bind(config); //bind the current config to the function
        var template = iCSR.fn.getconfigTemplate(config);
        iCSR.CSS.appendTemplateCSS(template.CSS, config);

        config.nr = "0"; //trick replacement in accepting first value as "0" string instead of empty string
        iTrace(1, 'Configured: ', 'iCSR.Template.' + templateId, {
            "config": config,
            "template": template
        });
        template.htmlparts = [];

        for (var keyvalue in config.values) { // jshint ignore:line, Object has those keyvalues
            config.keyvalue = keyvalue;
            var iscurrent = config.value === keyvalue;
            config.click = replacetokens(config.clickupdate);
            config.classname = config[iscurrent ? 'Classcurrent' : 'Classchoice'];
            if (!config.interactive) config.classname += ' NonInteractive';//add CSS class for non-interactive Template
            config.colors = iCSR.fn.extractcolors(config.colors, config.Choices);
            config.color = config.colors ? config.colors[config.keyvalue] : config.values[config.keyvalue];
            config.label = iscurrent ? config.shortlabel : '&nbsp;&nbsp;';
            template.htmlitem = template.item || config.template;
            var item = replacetokens(template.htmlitem);
            if (iscurrent) template.htmlcurrentindex = template.htmlparts.length;
            template.htmlparts.push(item);
            iTrace(2, 'item:', config.nr, 'iCSR.Template.' + templateId, ':', item, {
                'config': config,
                'template': template
            });
            config.nr++;
        }
        template.htmlcurrentchoice = template.htmlparts[template.htmlcurrentindex];
        config.interactive = template.htmlcurrentchoice.indexOf('onclick') > -1;
        config.html = config.interactive ? template.htmlparts.join('') : template.htmlcurrentchoice;
        var html = replacetokens(template.container);
        iTrace(0, 'Output: ', 'iCSR.Template.' + templateId, {
            "html": html,
            "config": config,
            "template": template
        });
        return html;
    };
    //noinspection BadExpressionStatementJS,HtmlUnknownTarget
    /** IDE ignore definitions in String (escaped double quotes to keep onclick working and img src references which IDE can't recognize*/
    iCSR.Template.Priority.configuration = {
        iCSRid: 'Priority',
        values: {
            '(1) High': 'lightcoral',
            '(2) Normal': 'orange',
            '(3) Low': 'lightgreen'
        },
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
                    iCSRdescription: 'reusable generic CSS for KPI indicators'
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
        iCSRdescription: 'colorcode (1) (2) (3) Priority values'
    };

//--
//endregion iCSR.Template.Priority ----------------------------------------------------------------- ### iCSR.Template.Priority

//endregion ---------------------------------------------------------------------------------------- iCSR.Template

//region iCSR.Controllers ------------------------------------------------------------------------- ### iCSR.Controllers (OnPostRender)

//region iCSR.Control.table--------------------------------------------------------------------- ### iCSR.Control.table

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
//endregion

//region iCSR.Control.duplicates --------------------------------------------------------------- ### iCSR.Control.duplicates
    /**
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
//endregion

//endregion --------------------------------------------------------------------------------------- iCSR.Control

//region code snippets for future features
    /**
     * Full screen settings from core.js
     */
//SetFullScreenMode(true);
//_ToggleFullScreenMode();
//GetCookie('WSS_FullScreenMode');

//endregion


//region ----- ctx object inspector can be used from the F12 console - type 'ic' in the console ---- ### ctx object inspector
    /**
     * @param ctx_object
     * @param fieldnames
     */
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
        Object.defineProperty(window, 'ic', {
            configurable: true,
            get: function () {
                if (ctx) return console.table(iCSR.SP.getctxobjectinfo(ctx.ListSchema.Field, "DisplayName,Name,RealFieldName,FieldType,Type,role"));
            }
        });
    }
//endregion ---------------------------------------------------------------------------------------- ctx object inspector

    if (iCSR.hasOwnProperty('_DEMO')) iCSR.DOM.footer();
//iCSR.init();//executing inside declaration seems to stall CSR template
    iCSR.traceheader();
    SP.SOD.notifyScriptLoadedAndExecuteWaitingJobs('iCSR');
})
(window);