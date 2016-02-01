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
            value: '1.0', writable: false
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

//region Global overrides ----- SharePoint core.js is not loaded yet ------------------------------ ### Global Functions
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
    iCSR.Template = iCSR.Template || {};                // Template functions return HTML for easy execution in a CSR file
    iCSR.TemplateManager = iCSR.TemplateManager || {};  // Manages all default and custom Templates
    iCSR.Items = {};                                    // Store all ListItems configurations by Fieldname
    iCSR.SP = iCSR.SP || {};                            // SP-SharePoint related functions
    iCSR.fn = iCSR.fn || {};                            // generic support functions
    iCSR.Control = iCSR.Control || {};                  // controllers created with new () - for use in OnPostRender functions
    iCSR.Str = iCSR.Str || {};                          // String functions because .prototyping is not 100% safe
    iCSR.Date = iCSR.Date || {};                        // DateTime functions (saves from loading momentJS)
    iCSR.CSS = iCSR.CSS || {};                          // CSS storage and actions
    iCSR.Tokens = iCSR.Tokens || {};                    // String functions and Custom function declarations for handling [token] in Strings
    iCSR.CFG = iCSR.CFG || {                            // configuration options for all Templates
            interactive: false,
            tracing: true,
            color: {
                msYellow: "#FFB700",
                msRed: "#F02401",
                msBlue: "#219DFD",
                msGreen: "#77BC00",
                msYellowRedBlueGreen: ["#FFB700", "#F02401", "#219DFD", "#77BC00"]//Microsoft colors: yellow,red,blue,green
            }
        };

//endregion --------------------------------------------------------------------------------------- iCSR Namespaces
//region iCSR.info & iCSR.trace-------------------------------------------------------------------- ### iCSR.info
    iCSR.info = function () {
        var consoleObject = function (iCSRobject) {
            console.info('iCSR: ' + iCSR._VERSION);
            for (var key in iCSRobject) {
                if (iCSRobject.hasOwnProperty(key)) {
                    console.warn(key);
                }
            }
        };
        consoleObject(iCSR.Template);
        consoleObject(iCSR.Control);
    };
    iCSR.traceheader = function (clearconsole) {
        if (clearconsole) console.clear();
        console.info('%c iCSR.js - ' + iCSR._VERSION + ' ', 'background:#005AA9;color:#FCD500;font-weight:bold;font-size:20px;');
    };
    iCSR.trace = function (tracelevel, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15) {//yes, could use arguments array
        var p1 = '';
        if (tracelevel === 'string') {
            tracelevel = 0;
            p1 = tracelevel;
        }
        var tracelevelcolors = [];
        tracelevelcolors.push("background:#005AA9;color:#FCD500;font-weight:bold;");//0
        tracelevelcolors.push("background:green");//1
        tracelevelcolors.push("background:lightgreen");//2
        tracelevelcolors.push("background:lightcoral;");//3
        tracelevelcolors.push("background:indianred;");//4
        tracelevelcolors.push("background:red;");//5
        var tracelevelcolor = tracelevelcolors[tracelevel];
        if (tracelevel === 0) {
            p1 = p1 + p2;
            p2 = '';
        }
        if (iCSR.CFG.errorcount < 1) {
            if (iCSR.CFG.tracing && console && iCSR.tracelevel >= tracelevel) {
                console.info('%c iCSR ' + '%c ' + tracelevel + ' ' + p1 + '', 'background:#005AA9;color:#FCD500;font-weight:bold;', tracelevelcolor, p2 || '', p3 || '', p4 || '', p5 || '', p6 || '', p7 || '', p8 || '', p9 || '', p10 || '', p11 || '', p12 || '', p13 || '', p14 || '', p15 || '');
            }
        }
    };
    var iTrace = iCSR.trace;//global reference to trace, makes it easy to comment them all with // so they are deleted in when file is minified
    //window.iTrace = iCSR.trace;
    //window.cl = function (p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15) {//TODO (high) delete in all code, used for easy development
    //    iTrace(0, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15);
    //};

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
    iCSR.traceon = function (setlevel, clearconsole) {
        iCSR.traceheader(clearconsole);
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
//region iCSR.TemplateManager - register CSR Templates with function and configurations------------ ### iCSR.TemplateManager
    iCSR.TemplateManager = iCSR.TemplateManager || {};

    iCSR.TemplateManager.validateTemplateName = function (_templateIDname) {
        return (_templateIDname);
    };
    iCSR.TemplateManager.validateTemplateFunction = function (_templatefunction) {
        return (_templatefunction);
    };
    iCSR.TemplateManager.validateTemplate = function (config) {
        if (!config)console.error('config\n', config);
        return true;
    };
    iCSR.TemplateManager.validateTemplateoutput = function (config) {
        if (config.output) {
            config.output = config.replacetokens(config.output);// proces the HTML one more time for tokens
            iTrace(1, config.templateid, 'output HTML:\n\t', config.output);
        } else {
            iCSR.traceerror(config.templateid + ' template has no output\n', config);
            config.output = config.value;
        }
    };
    iCSR.TemplateManager.attachTemplatefunctions = function (config) {
        config.setcolor = function (tag, color, column) {//todo fix offset of column nr in sharepoint Views with select column
            var elementid = this.iid;
            color = color || this.color;
            column = column || this.counter;
            tag = tag || 'TD';
            iCSR.DOM.waitforelement(elementid, function () {// color TD cell or TR row
                var TR = document.getElementById(elementid);
                if (tag === 'TD') {
                    console.error(this);
                    var TD = TR.cells[column]; //current column
                } else {
                    TR.style.backgroundColor = color;
                }
            }.bind(this), 10);
        }.bind(config);

        config.replacetokens = iCSR.Tokens.replace.bind(config);    // define a bound function so Tokens.replace executes on config without the need for passing it as parameter
    };
    iCSR.TemplateManager.validateTemplateConfiguration = function (_templateconfig) {
        _templateconfig = _templateconfig || {                  // default config if no config with RegisterTemplate
                Classcontainer: '[templateid]'
            };
        if (!_templateconfig.hasOwnProperty('templates')) {     // default template if no template with RegisterTemplate
            _templateconfig.templates = {
                default: {
                    container: "<div class='[Classcontainer]' style='background:[color];color:[textcolor]'>&nbsp;[value]&nbsp;</div>",
                    CSS: {
                        container: ".[Classcontainer] {}"//Backgroundcolored Status label - default for all custom additions
                    }
                }
            };
        }
        _templateconfig.textcolor = _templateconfig.textcolor || "#333";
        _templateconfig.fontsize = _templateconfig.fontsize || "11px";
        _templateconfig.height = _templateconfig.height || "20px";

        //default colors
        _templateconfig.msYellow = iCSR.CFG.color.msYellow;
        _templateconfig.msRed = iCSR.CFG.color.msRed;
        _templateconfig.msBlue = iCSR.CFG.color.msBlue;
        _templateconfig.msGreen = iCSR.CFG.color.msGreen;
        _templateconfig.blankIMG = "img src='/_layouts/images/blank.gif' ";
        //noinspection HtmlUnknownAttribute
        _templateconfig.colorTD = "<[blankIMG] onload={GetAncestor(this,'TD').style.backgroundColor='[color]'}>";
        _templateconfig.colorTR = "<[blankIMG] onload={GetAncestor(this,'TR').style.backgroundColor='[color]'}>";

        return (_templateconfig);
    };
    iCSR.TemplateManager.RegisterTemplate = function (_templateIDname, _templatefunction, _templateconfig) {
        _templateIDname = iCSR.TemplateManager.validateTemplateName(_templateIDname);           //validate input
        _templatefunction = iCSR.TemplateManager.validateTemplateFunction(_templatefunction);   //validate input
        _templateconfig = iCSR.TemplateManager.validateTemplateConfiguration(_templateconfig);  //validate input
        iTrace(0, 'iCSR.TemplateManager.RegisterTemplate', _templateIDname, '\n_templateconfig:', _templateconfig);
        iCSR[_templateIDname] = function (ctx) {                        // create a named function in the global iCSR object
            iTrace(2, 'Executing iCSR.' + _templateIDname);
            var config = iCSR.fn.getconfig(ctx, _templateconfig, this); // built one NEW config object from the 3 sources,'this is 'iCSR.Me.bind({OBJECT}) OR ctx.CurrentFieldSchema
            config.templateid = _templateIDname;
            if (ctx.inGridMode && !config.allowGridMode) {
                ctx.ListSchema.Field.AllowGridEditing = false;
                return config.value;
            }
            if (iCSR.SP.isGroupHeader(ctx) && config.allowGroupHeader) {
                return config.value;
            }
            iCSR[_templateIDname].configuration = config;               // extra property on this function itself so the ViewConfiguration can get to it
            iCSR.fn.setconfigTemplate(config);                          // extract the template from the config settings
            iCSR.CSS.appendTemplateCSS(config.template.CSS, config);    // inject all the CSS for this template into the current page
            iCSR.TemplateManager.attachTemplatefunctions(config);       // attach with bound scope: setcolor() , replacetokens()
            iCSR[_templateIDname].executeTemplate.call(config, ctx);    // ==> execute the actual template function
            iCSR.TemplateManager.validateTemplate(config);              // validate output
            iCSR.TemplateManager.validateTemplateoutput(config);
            return config.output;                                   // return the HTML back to SharePoint CSR calling code
        };
        iCSR[_templateIDname].executeTemplate = _templatefunction;      // create a function reference so it can be executed inside the Template function
        iCSR[_templateIDname].ViewConfiguration = function () {
            var config = iCSR[_templateIDname].configuration;
            var configKeys = Object.keys(config);
            console.info(_templateIDname, 'configuration [tokens] : ', config);
            configKeys.forEach(function (Key) {
            });
        };
    };
//endregion --------------------------------------------------------------------------------------- iCSR TemplateManager
//region --- iCSR.TemplateManager.registerdefaultTemplates ---------------------------------------- ### iCSR.TemplateManager.registerdefaultTemplates
    iCSR.TemplateManager.registerdefaultTemplates = function () {

//region --- iCSR.Planner -------------------------------------------------------------------------- ### iCSR.Planner
        iCSR.TemplateManager.RegisterTemplate('Planner', function () {
                var planner = this;
                planner.state = 0;
                if (planner.CurrentItem.Status === planner.states[0]) {
                    planner.state = 0;
                } else if (planner.CurrentItem.Status === planner.states[3]) {
                    planner.state = 3;
                } else if (planner.days < 0) {
                    planner.state = 1;
                } else {
                    planner.state = 2;
                }
                planner.color = planner.colors[planner.state];
                planner.textcolor = planner.textcolors[planner.state];
                planner.output = "<div style='background:[color];color:[textcolor];padding:0px 2px'>[value]</div>";
            },//end function
            {//iCSR configuration for Status
                colors: iCSR.CFG.color.msYellowRedBlueGreen,//Microsoft colors: yellow,red,blue,green
                textcolors: ['slate', 'lightgrey', 'slate', 'slate'],
                states: ['Not Started', 'Late', 'In progress', 'Completed']
            }
            //end configuration
        );//end RegisterTemplate
//endregion --------------------------------------------------------------------------------------- iCSR.Planner
//region --- iCSR.Status --------------------------------------------------------------------------- ### iCSR.Status
        iCSR.TemplateManager.RegisterTemplate('Status', function () {
                var status = this;
                status.color = status.colors[status.value];
                if (status.value === "Waiting on someone else") status.value = "Waiting";
                status.value = iCSR.Str.nowordbreak(status.value);
                status.output = status.replacetokens(status.template.container);
            },//end function
            {//iCSR configuration for Status
                allowGroupHeader: false,
                allowGridMode: true,
                colors: {
                    "Not Started": 'lightgray',
                    "Deferred": 'pink',
                    "Waiting on someone else": 'gold',
                    "In Progress": 'orange',
                    "Completed": 'lightgreen'
                },
                width: '20px',
                height: "15px",
                padding: "padding:2px 1px 2px 1px;",
                interactive: iCSR.CFG.interactive || true,
                Classcontainer: 'iCSR_Status_Container',
                templates: {
                    default: {
                        container: "<div class='[Classcontainer]' style='background:[color];color:[textcolor]'>&nbsp;[value]&nbsp;</div>",
                        CSS: {
                            container: ".[Classcontainer] {font-size:[fontsize];height:[height];text-align:center;[padding]}"
                        }
                    },
                    colortext: {
                        container: "<div class='[Classcontainer]' style='color:[color]'>&nbsp;[value]&nbsp;</div>",
                        CSS: { //object of strings with tokenized CSS definitions
                            container: ".[Classcontainer] {font-size:[fontsize];}"
                        }
                    },
                    block: {
                        container: "<div class='[Classcontainer]'><div style='float:left;background:[color];width:[width]'>&nbsp;</div>&nbsp;[value]&nbsp;</div>",
                        CSS: { //object of strings with tokenized CSS definitions
                            container: ".[Classcontainer] {font-size:[fontsize];}"
                        }
                    }
                }
            }//end configuration
        );//end RegisterTemplate
//endregion --------------------------------------------------------------------------------------- iCSR.Status
//region --- iCSR.DueDate -------------------------------------------------------------------------- ### iCSR.DueDate
//noinspection HtmlUnknownAttribute
        iCSR.TemplateManager.RegisterTemplate('DueDate', function () {
                var duedate = this;
                if (!duedate.interactive) {
                    //duedate.input="[datepicker_chrome]";//duedate.input='[datepicker]';
                }
                duedate.ranges = iCSR.fn.extractcolors(duedate.ranges);//make sure it is an array: color,days,color,days
                var colornr = 0;
                while (Number(duedate.ranges[colornr + 1]) < duedate.days) colornr += 2; //loop to find color
                duedate.color = duedate.ranges[colornr];
                if (duedate.days > 0) {
                    duedate.label = duedate.label_future;
                } else {
                    duedate.label = duedate.label_past;
                }
                if (typeof duedate.days === 'number') {
                    //iCSR.DOM.waitforelement(duedate.iid, function () {// color TD cell or TR row
                    //    var TR = document.getElementById(duedate.iid);
                    //    var TD = TR.cells[duedate.counter]; //current column
                    //    (duedate.TD ? TD : TR).style.backgroundColor = duedate.color;
                    //}, 10);
                    duedate.output = duedate.template.container;
                } else {
                    duedate.output = duedate.datepicknodate;
                }
            },//end function
            {//start configuration
                allowGroupHeader: false,
                allowGridMode: true,
                ranges: '#f55,-21,#f7a,-14,#fab,-7,#fda,0,#cf9,7,#9fa',
                label_nodate: 'No Date',
                label_future: 'days left',
                label_past: 'days past',
                onclick: "onclick='{event.stopPropagation();}'",
                onchange: "onchange=\"iCSR.SP.UpdateItem(false,'[ID]','[Name]',new Date(this.value))\" ",
                textcolor: 'inherit',
                width: "150px",
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
                            container: ".[Classcontainer] {width:[width];color:[textcolor];height:[height];padding:-2px 2px 0px 2px;}",
                            daycount: ".iCSRdaycount {position:relative;float:left;}",
                            date: ".iCSRdate {position:relative;float:right;}",
                            datepicker: ".iCSRdatepicker {position:relative;z-index:3;width:100%;height:[height]}",
                            dayselect: ".[Classcontainer]tomorrow,.[Classcontainer]yesterday {display:block;font-size:14px;position:absolute;width:60%}",
                            yesterday: ".[Classcontainer]yesterday {left:0%}",
                            tomorrow: ".[Classcontainer]tomorrow {right:0%;text-align:right}",
                            update: ".[Classcontainer]update {width:20px;height:[height];font-weight:bold;opacity:0}",
                            updatehover: ".[Classcontainer]update:hover {color:white;font-weight:bold;opacity:1;cursor:pointer;background:grey}",
                            input: ".[Classcontainer]>input {width:125px;border:none;margin-top:-4px;}"
                        }
                    }
                }
            }//end configuration
        );//end RegisterTemplate
//endregion ---------------------------------------------------------------------------------------- iCSR.DueDate
//region --- iCSR.Priority ------------------------------------------------------------------------- ### iCSR.Priority
//noinspection BadExpressionStatementJS,HtmlUnknownTarget
        /** IDE ignore definitions in String (escaped double quotes to keep onclick working and img src references which IDE can't recognize*/
        iCSR.TemplateManager.RegisterTemplate('Priority', function () {
                var prio = this,
                    currentchoice = 0;
                var htmlparts = prio.Choices.map(function (choice, nr) {  // process all Choices and built the html for each
                    prio.nr = String(nr);
                    prio.choice = choice; // store so it can be used in templates
                    prio.color = prio.colors[choice];
                    if (prio.value === choice) {
                        currentchoice = nr;
                        prio.classname = prio.Classcurrent;
                        prio.label = prio.shortlabel;
                    } else {
                        prio.classname = prio.Classchoice;
                        prio.label = '&nbsp;&nbsp;';
                    }
                    prio.click = prio.replacetokens(prio.clickupdate);
                    if (!prio.interactive) prio.classname += ' NonInteractive';//add CSS class for non-interactive Template
                    return prio.replacetokens(prio.template.item);
                });
                if (htmlparts[currentchoice].indexOf('onclick') > -1) {        // is there on onclick handler
                    prio.choices = htmlparts.join('');
                } else {
                    prio.choices = htmlparts[currentchoice];
                }
                prio.output = prio.template.container;
            },//end function
            {//start configuration
                colors: "[msRed],[msYellow],[msGreen]",//Microsoft colors
                interactive: iCSR.CFG.interactive || true,
                width: '110px', //total width
                widthCurrent: '50%',
                widthChoice: '15px', //width of the non Current Choice options
                Classcontainer: 'iCSRpriority_Container',
                Classcurrent: 'iCSRpriority_Current',
                Classchoice: 'iCSRpriority_Choice',
                clickupdate: "iCSR.SP.UpdateItem(false,'[ID]','[Name]','[choice]');", //ID,Name,value
                layouts: '/_layouts/15/images/',
                template: 'iCSRbar',//default templates.nnn
                templates: {
                    default: {
                        container: "<div class='[Classcontainer]'>[choices]</div>",
                        item: "<span class=\"[classname]\" style=\"color:[color]\" onclick=\"[click]\">[label]</span>",
                        CSS: {
                            container: ".[Classcontainer] {}",
                            containerDiv: ".[Classcontainer]>div {position:relative;float:left;}",
                            choice: ".[Classchoice] {cursor:pointer;opacity:.2}",
                            choicehover: ".[Classchoice]:hover {opacity:1;border-color:black}"
                        }
                    },
                    iCSRbar: {
                        item: "<div class=\"[classname]\" style=\"background-color:[color]\" onclick=\"[click]\">[label]</div>",
                        CSS: { //object of strings with tokenized CSS definitions
                            container: ".[Classcontainer] {width:[width];}",
                            containerDiv: ".[Classcontainer]>div {position:relative;float:left;display:inline;border:1px solid grey}",
                            currenttext: ".[Classcurrent] {font-size:[fontsize];color:[textcolor]}",
                            currentlabel: ".[Classcurrent] {width:[widthCurrent];text-align:center;padding:2px;}",
                            currentnoninteractive: ".[Classcurrent].NonInteractive {width:100%}",
                            choice: ".[Classchoice] {width:[widthChoice];cursor:pointer;opacity:.4}",
                            choicehover: ".[Classchoice]:hover {opacity:1;border-color:black}"
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
                }//templates
            }//end configuration
        );//end RegisterTemplate
//endregion iCSR.Priority -------------------------------------------------------------------------- ### iCSR.Priority
//region --- iCSR.PercentComplete ------------------------------------------------------------------ ### iCSR.PercentComplete
//noinspection HtmlUnknownAttribute
        iCSR.TemplateManager.RegisterTemplate('PercentComplete', function () {
                var progress = this;
                progress.currentpercentage = Math.round(progress.valuenr);
                progress.bars = [100, 90, 80, 70, 60, 50, 40, 30, 20, 10].map(function (percentage) {
                    progress.click = "";
                    progress.barclass = "";
                    progress.barpercentage = percentage;
                    progress.scalelabel = progress.scale ? progress.barpercentage : '';
                    if (percentage > progress.currentpercentage) {
                        progress.barupdatevalue = percentage / 100;
                        progress.click = progress.onclick;
                    }
                    if (progress.currentpercentage === percentage) {
                        progress.barclass = "currentProgress";
                    }
                    return progress.replacetokens(progress.template.item);
                }).join('');
                progress.output = progress.replacetokens(progress.template.container);
            },//end function
            {//start configuration
                scale: true,
                background: "lightgrey",
                scalecolor: "grey",
                barcolor: "#0072C6",//default SharePoint blue
                color: "beige",
                width: "180px",
                onclick: "onclick=\"iCSR.SP.UpdateItem(false,'[ID]','[Name]','[barupdatevalue]')\" ",
                Classcontainer: "pbar",
                templates: {
                    default: {
                        container: "<div id='[templateid]' class='[Classcontainer]'>[bars]</div>",
                        item: "<div class='[barclass]' style='width:[barpercentage]%' [click]>[scalelabel]</div>",
                        CSS: {
                            container: ".[Classcontainer] {width:[width];height:15px;position:relative;background-color:[background]}",
                            scale: ".[Classcontainer] {font-family:arial;font-size:11px;color:[scalecolor]}",
                            bar: ".[Classcontainer]>div {position:absolute;text-align:right;font-size:80%;height:100%;}",
                            barscale: ".[Classcontainer]>div {border-right:1px solid #a9a9a9}",
                            hover: ".[Classcontainer]>div:not(.currentProgress):hover{color:black;font-size:100%;background:lightgreen;z-index:4;cursor:pointer;opacity:.8}",
                            hoverbefore: ".[Classcontainer]>div:not(.currentProgress):hover:before{content:'►';font-weight:bold}",
                            currentpercent: ".[Classcontainer]>div:hover:after,.[Classcontainer] .currentProgress:after{content:'%'}",
                            current: ".[Classcontainer] .currentProgress{font-size:100%;z-index:3}",
                            barcolor: ".[Classcontainer] .currentProgress{background-color:[barcolor];color:[color]}"
                        }//CSS
                    }//default template
                }//templates
            }//end configuration
        );
//end RegisterTemplate
//endregion --------------------------------------------------------------------------------------- iCSR.PercentComplete

    }
    ;//iCSR.TemplateManager.registerdefaultTemplates
//endregion --------------------------------------------------------------------------------------- iCSR.TemplateManager.registerdefaultTemplates
//region iCSR.Init -------------------------------------------------------------------------------- ### iCSR.init
    /**
     * Initialize iCSR
     */
    iCSR.init = function () {
        if (SP) {
            SP.SOD.executeFunc("clienttemplates.js", "SPClientTemplates", function () {
                iTrace(1, 'initialized SharePoint clienttemplates.js');
            });
        } else {
            iCSR.traceerror('no SharePoint environment');
        }
        window.iC = iCSR;//shortcut for F12 console use, better not use it in code, iCSR is the only global variable to be used

        window.ic = iCSR.inspector;//ctx property inspector
    };
//endregion ---------------------------------------------------------------------------------------- iCSR.init
//region iCSR.Tokens ---------- proces strings with [token] markers ------------------------------- ### iCSR.Tokens
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
     * @param _tokenArray
     * @returns {*}
     */
    iCSR.Tokens.replacetoken = function (_tokenstring, _tokenconfig, _tokenArray) {
        var _tokenized = _tokenstring;
        if (_tokenized !== "" && _tokenized !== "." && _tokenized !== "iCSR") {//allways ignore these tokens
            if (_tokenconfig.hasOwnProperty(_tokenstring)) {
                _tokenized = _tokenconfig[_tokenstring]; // predefined tokens defined in .config object take precedence over token
                if (typeof _tokenized === 'function') {
                    //TODO: (normal) ?? do we want to allow script creation... cool to investigate how far this would lead
                }
                if (typeof _tokenized === 'object') {
                    iTrace(0, 'tokenobject:', _tokenstring, _tokenized);
                    iCSR.SP.showobjectsinstatus(_tokenized);
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
                var _object = _tokenstring.split('.');// CurrentItem.ID
                var _objectName = _object[0];
                if (_tokenconfig.hasOwnProperty(_objectName)) {
                    var _objectKey = _object[1];
                    _tokenized = _tokenconfig[_objectName][_objectKey];
                } else {
                    var strippedtoken = iCSR.Str.alphanumeric(_tokenstring);
                    if (strippedtoken === _tokenstring && _tokenArray.length !== 1) {//token is not declared yet
                        _tokenized = '[' + _tokenstring + ']';
                        iTrace(4, 'replacetoken UNTOUCHED: ', _tokenized);
                    }
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
            iCSR.tracewarning('empty _string in Token replace:', _string);
            return _string;
        }
        if (typeof _string === 'string') {
            _tokenconfig = _tokenconfig || this; //tokens defined in optional .bind(config)
            var _tokenArray;//working array breaking string into tokens
            var tokencount = 1;//count how many tokens are in the array, to break out of the loop when all work is done
            var loop;
            for (loop = 0; loop < 10; loop++) {//too lazy to develop recursive code
                _tokenArray = iCSR.Tokens.StringToTokenArray(_string, '[]');//make array
                if (_tokenArray.length > 1 || _tokenArray.length === 1 && _tokenArray[0].length < iCSR.Tokens.maxtokenstringlength) {
                    _tokenArray = _tokenArray.map(function (token) {
                        var _replacedtoken = iCSR.Tokens.replacetoken(token, _tokenconfig, _tokenArray);
                        if (_replacedtoken === '') {
                        }
                        return _replacedtoken;
                    });// jshint ignore:line
                }
                _string = _tokenArray.join('');//make it one string again
                if (_tokenArray.length === tokencount) break;//exit loop if no more tokens need to be replaced
                tokencount = _tokenArray.length;
            }
            iTrace(3, 'replacetokens', '(' + typeof _string + ') _tokenArray in ', loop, 'iterations', {
                "string": _string,
                "array": _tokenArray
            });
        }
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
        iTrace(2, 'callfunction:', silent ? '(silent)' : '', _functionname, '(', _parameters, ')');
        var tokenfunctionResult;
        if (iCSR.Tokens.hasfunction(_functionname)) {
            try {
                var tokenfunction = iCSR.Tokens.functions[_functionname];
                iTrace(1, 'call: ', _functionname, '(', _parameters, ')\n\t', tokenfunction);
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
//region iCSR.Str ------------- String utility functions ------------------------------------------ ### iCSR.Str
    iCSR.Str.nowordbreak = function (_string) { //replaces space with nonbreakingspaces
        _string = _string || '';
        return _string.replace(/ /gi, '&nbsp;');
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
//region iCSR.Date ------------ DateTime utility functions ---------------------------------------- ### iCSR.Date
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
//region iCSR.fn -------------- utility functions --------------------------------------------------### iCSR.fn
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
            if (colorObject.indexOf('[') > -1) colorObject = iCSR.Tokens.replace(colorObject, iCSR.CFG.color);
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
            bindconfig = bindconfig.hasOwnProperty('FieldType') ? {} : bindconfig;                  // if scope is the ctx object create a empty object
            bindconfig.trace > 0 ? iCSR.traceon(bindconfig.trace) : iCSR.traceoff(iCSR.tracelevel); // turn on tracelevel if defined in Template config
            mergeConfig(initialconfig); //defaultsetting
            mergeConfig(bindconfig); //overwrite default settings
            if (iCSR.hasOwnProperty('Interactive')) {                                               // global configuration options overruling config
                config.interactive = iCSR.Interactive;
            }
            if (ctx) {//SharePoint specific configuration
                config.CurrentItem = ctx.CurrentItem;
                config.CurrentFieldSchema = ctx.CurrentFieldSchema;//cleanup!
                ['Name', 'DisplayName', 'RealFieldName', 'FieldType', 'counter', 'Choices'].forEach(function (property) {//Get Relevant properties from CurrentFieldSchema
                    config[property] = ctx.CurrentFieldSchema[property];
                });
                config.ID = ctx.CurrentItem.ID;
                config.iid = GenerateIID(ctx);
                if (ctx.CurrentItem.hasOwnProperty(config.Name)) {
                    config.value = ctx.CurrentItem[config.Name];
                } else {
                    config.value = ctx.CurrentItem[config.RealFieldName];
                }
                config.itemid = 'iCSR_' + ctx.wpq + '_' + config.ID;
            } else {
                config.ID = 'no ctx';
                config.iid = false;
                config.value = 'no ctx value';
            }
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
            config.colors = iCSR.fn.extractcolors(config.colors, config.Choices);

            return (config);
        }
        catch
            (e) {
            iCSR.traceerror('getconfig error', e, key, '\nsuccesfull config declarations:', config);
        }
    };
    /**
     * pre-Process all configurations (global, Template, custom) into one configuration for a Template
     * @param config
     * @returns {*}
     */
    iCSR.fn.setconfigTemplate = function (config) {//TODO (high) refactor getconfigtemplate
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
        config.template = template;
        return template;//also return a copy because the Template function uses a local var (for now)
    };

    iCSR.fn.getFunctionName = function (fn) {
        var f = typeof fn === 'function';
        var s = f && ((fn.name && ['', fn.name]) || fn.toString().match(/function ([^\(]+)/));
        return (!f && 'not a function') || (s && s[1] || 'anonymous');
    };
//endregion --------------------------------------------------------------------------------------- iCSR.fn
//region iCSR.CSS ------------- CSS operations -----------------------------------------------------### iCSR.CSS
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
                if (CSS.hasOwnProperty(key)) {
                    var rule = iCSR.Tokens.replace(CSS[key], config);
                    rules.push(rule);
                    if (traceCSS) iTrace(2, 'CSS: ', key, rule);
                }
            }
            iCSR.CSS.addStylesheetWithRules(config.templateid, rules, true);
            iTrace(1, 'CSS:', CSS);
        } else {
            iCSR.traceerror('Missing CSS config.templates:', CSS);
        }
        return CSS;
    };

//endregion --------------------------------------------------------------------------------------- iCSR.CSS
//region iCSR.SP -------------- SharePoint interactions using JSOM / REST --------------------------### iCSR.SP
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
                var status;
                iCSR.SP.SPStatuscount++;
                if (iCSR.SP.SPStatuscount === 10) {
                    status = Status.addStatus('iCSR', 'Too many errors', false);
                    Status.setStatusPriColor(status, 'red');
                } else if (iCSR.SP.SPStatuscount < 10) {
                    status = Status.addStatus(title || 'iCSR Demo', text, first || false);
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
    iCSR.SP.showobjectsinstatus = function (obj) {
        //Object.keys(obj).forEach(function (key) {
        //    iCSR.SPStatus((typeof obj[key] === 'string' ? obj[key] : '{object}'), 'yellow', key);
        //});
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
//region iCSR.DOM ------------- Generic DOM functions (SharePoint DOM structure, ids etc.)--------- ### iCSR.DOM

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
        helplinks += "<a href='https://github.com/365CSI/iCSR/blob/master/CSR-5-minute-quickstart.md' target='_new'>iCSR Quickstart</a>";
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
            if (iCSR[_fieldname]) return iCSR[_fieldname].call(this, ctx);
            var warning = 'No Template for: iCSR.' + _fieldname;
            iCSR.tracewarning(warning, '(' + _fieldtype + ')');
            iCSR.SPStatus(warning, 'yellow', 'iCSR:', false, true);
        } catch (e) {
            console.error(e);
            iCSR.SPStatus(e.message, 'red', 'iCSR error:', false, true);
        }
    };
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

    iCSR.overrides = function (overrides) {
        // default iCSR overrides to be used as: SPClientTemplates.TemplateManager.RegisterTemplateOverrides( iCSR.overrides );
        overrides = overrides || {
                Templates: {}
            };
        overrides.Templates.Fields = {};
        overrides.Templates.Fields.Priority = {
            View: iCSR.Me
            //View: iCSR.Me.bind({template:'kpi4',colors:"red,orange,green"})
            //View: iCSR.Me.bind({template:'svgcircle(15)',coalors:"lightcoral,orange,lightgreen"})
        };
        overrides.Templates.Fields.DueDate = {
            View: iCSR.Me//Planner//.bind({ranges:'lightcoral,-5,pink,-1,orange,0,lightgreen,5,lightgreen'})
        };
        overrides.Templates.Fields.Status = {
            View: iCSR.Me//.bind({fonatsize: "11px"})
        };
        overrides.Templates.Fields.PercentComplete = {
            View: iCSR.Me//.bind({barcaolor: '[msBlue]'})
        };
        return (overrides);
    };//iCSR.overrides
    if (iCSR.hasOwnProperty('_DEMO')) iCSR.DOM.footer();
//    iCSR.init();
    iCSR.TemplateManager.registerdefaultTemplates();
    SP.SOD.notifyScriptLoadedAndExecuteWaitingJobs('iCSR');
})
(window);