/**********************************************************************************************************************************
 * iCSR.js - Office365/SharePoint (CSR) Client Side Rendering JavaScript programming framework/support library
 * http://iCSR.gitbub.io
 * license: MIT
 */
(function (global, document) {
    global.iCSR = {
        _LICENSE:"<a rel='license' href='http://creativecommons.org/licenses/by/4.0/'><img alt='Creative Commons License' style='border-width:0' src='https://i.creativecommons.org/l/by/4.0/88x31.png' /></a><br /><span xmlns:dct='http://purl.org/dc/terms/' property='dct:title'>iCSR.js</span> by <a xmlns:cc='http://creativecommons.org/ns#' href='https://365CSI.nl' property='cc:attributionName' rel='cc:attributionURL'>365CSI</a> is licensed under a <a rel='license' href='http://creativecommons.org/licenses/by/4.0/'>Creative Commons Attribution 4.0 International License</a>.<br />Based on a work at <a xmlns:dct='http://purl.org/dc/terms/' href='http://iCSR.github.io' rel='dct:source'>http://iCSR.github.io</a>",
        _VERSION: '1.5',
        _Templates: [],              // Array of Registered iCSR.[name] Templates
        _DEMO: true,
        ReloadCSSforeveryItem: true,
        TemplateManager: {          // Manages all default and custom Templates
        },
        Items: {},                  // Store all ListItems configurations by Fieldname
        SP: {},                     // SP-SharePoint related functions
        fn: {},                     // generic support functions
        Control: {},                // controllers created with new () - for use in OnPostRender functions
        Str: {},                    // String functions because .prototyping is not 100% safe
        Date: {},                   // DateTime functions (saves from loading momentJS)
        Array: {},
        Object: {},                 // Object functions
        CSS: {},                    // CSS storage and actions
        Tokens: {                   // String functions and Custom function declarations for handling [token] in Strings
            functions: {}           // namespace for special function replacing tokens like: output='[svgcircle(20)]'
        },
        DOM: {                      // DOM management functions, get elements, hide elements, wait(elementid)
            fn: {},
            Control: {}
        },
        Color: {                    // Color related code
            _CONTRAST: true,                            // auto correct text contrast color when coloring TD or all TDs in TR
            _CONTRASTDARK: 'inherit',                   // default SharePoint UI is dark text on white background
            _CONTRASTLIGHT: 'gainsboro',                // default light text contrast color
            _MISSING: 'beige/red/1px dashed red',       // default colors for missing colordefinition
            msYellow: '#FFB700',
            msRed: '#F02401',
            msBlue: '#219DFD',
            msGreen: '#77BC00'
        },
        CFG: {                      // configuration options for all Templates
            tracing: true
        },
        interactive: true           // by default all Templates are interactive (or overriden in Template own config)
    };
    /******************************************************************************************************************
     * How to use/read/change this file iCSR.js
     *
     * iCSR.js was written to be used by both entry-level CSR(JavaScript) users and more advanced developers
     *
     * Github
     * - please use Github for questions, feature requests
     * if you make changes please Fork the source on GitHub and make a Pull Request
     *
     * Source Code File layout
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

//region inline JSHINT settings for other IDEs
    /*global document,window,navigator,setTimeout,event,console*/
    /*global SP,SPClientTemplates,_spPageContextInfo*/
    /*global ClientPivotControl,RenderHeaderTemplate,RegisterModuleInit*/
    /*global GenerateIIDForListItem, GetAncestor, AJAXRefreshView,ctx,GenerateIID,GetDaysAfterToday,_spYield*/
    /*jshint -W069*/ //allow ["notation"]
    /*jshint -W030*/ //allow anonymous function
//endregion

//region Global overrides ----- SharePoint core.js is not loaded yet ------------------------------ ### Global Functions
    /******************************************************************************************************************
     * Get Ancestor up in the DOM tree - SharePoint overloads this in (loaded later) core.js
     * @param _element
     * @param tagType
     * @returns {*}
     * @constructor
     */
    window.GetAncestor = function (_element, tagType) {
        while (_element !== null && _element.tagName !== tagType) _element = _element.parentNode;
        return _element;
    };

    /**
     *
     */
    var iCSR = global.iCSR,
        _$TemplateManager = iCSR.TemplateManager,
        _$Tokens = iCSR.Tokens,
        _$Object = iCSR.Object,
        _$CSS = iCSR.CSS,
        _$DOM = iCSR.DOM,
        _emptyString = '';
    //        justst to be sure, in case iCSR s minified or hosted in another Namespace
    window['iCSR'] = iCSR;// jshint ignore:line

    /**
     * iCSR global functions for uglifyJS
     * @param _obj
     * @param _something
     * @returns {boolean}
     */
    function _$is(_obj, _something) {
        return typeof _obj === _something;
    }

    function _$isObject(_obj) {
        return _$is(_obj, 'object');
    }

    function _$isNumber(_obj) {
        return _$is(_obj, 'number');
    }

    function _$isString(_obj) {
        return _$is(_obj, 'string');
    }

    function _$isFunction(_obj) {
        return _$is(_obj, 'function');
    }

    function _$isUndefined(_obj) {
        return typeof _obj === 'undefined' || _obj === 'undefined';
    }

    function _$hasProperty(_obj, key) {
        return (_$isObject(_obj) && _obj.hasOwnProperty(key));
    }

    function _$getElementById(id) {
        return document.getElementById(id);
    }

//endregion --------------------------------------------------------------------------------------- Global Functions
//region iCSR.info & iCSR.trace-------------------------------------------------------------------- ### iCSR.info
    /******************************************************************************************************************
     * Tracing to the F12 developers console
     * a cleanup, refactor and documentation is on the wish list
     * for now select the region and press ctrl -
     */

    iCSR._traceheader = function (_clearconsole) {
        if (_clearconsole) console.clear();
        console.info('%c iCSR.js - ' + iCSR._VERSION + ' ', 'background:#005AA9;color:#FCD500;font-weight:bold;font-size:20px;');
    };
    iCSR.trace = function (tracelevel, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15) {//yes, could use arguments array
        var p1 = _emptyString;
        if (_$isString(tracelevel)) {
            tracelevel = 0;
            p1 = tracelevel;

        }
        var tracelevelcolors = [];
        var background = 'background';
        tracelevelcolors.push("background:#005AA9;color:#FCD500;font-weight:bold;");//0
        tracelevelcolors.push("background:green");//1
        tracelevelcolors.push("background:lightgreen");//2
        tracelevelcolors.push("background:lightcoral;");//3
        tracelevelcolors.push("background:indianred;");//4
        tracelevelcolors.push("background:red;");//5
        var tracelevelcolor = tracelevelcolors[tracelevel];
        if (tracelevel === 0) {
            p1 = p1 + p2;
            p2 = _emptyString;
        }

        if (iCSR.CFG.ErrorCount < 1) {
            if (iCSR.CFG.tracing && console && iCSR.tracelevel >= tracelevel) {
                console.info('%c iCSR ' + '%c ' + tracelevel + ' ' + p1 + _emptyString, 'background:#005AA9;color:#FCD500;font-weight:bold;', tracelevelcolor, p2 || _emptyString, p3 || _emptyString, p4 || _emptyString, p5 || _emptyString, p6 || _emptyString, p7 || _emptyString, p8 || _emptyString, p9 || _emptyString, p10 || _emptyString, p11 || _emptyString, p12 || _emptyString, p13 || _emptyString, p14 || _emptyString, p15 || _emptyString);
            }
        }
    };

    iCSR.traceend = function (tracelevel, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15) {
        iCSR.CFG.ErrorCount++;
        iTrace(tracelevel, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15);
    };
    iCSR.traceerror = function (p1, p2, p3, p4, p5, p6, p7, p8) {
        iCSR.CFG.ErrorCount++;
        if (console) console.error('%c iCSR ' + p1, 'background:lightcoral;color:black;', p2 || _emptyString, p3 || _emptyString, p4 || _emptyString, p5 || _emptyString, p6 || _emptyString, p7 || _emptyString, p8 || _emptyString);
    };
    iCSR.tracewarning = function (p1, p2, p3, p4, p5, p6, p7, p8) {
        var showwarning = true;
        if (_$isNumber(p1)) showwarning = p1 <= iCSR.tracelevel;
        if (console && showwarning) console.warn('%c iCSR:' + p1, 'background:orange;color:brown', p2 || _emptyString, p3 || _emptyString, p4 || _emptyString, p5 || _emptyString, p6 || _emptyString, p7 || _emptyString, p8 || _emptyString);
    };
//iCSR.tracelevel = 0; //1 to 3 for more and more detailed console tracing
    iCSR.traceon = function (_setlevel, _clearconsole) {
        if (_clearconsole) iCSR._traceheader(_clearconsole);
        if (_$isUndefined(_setlevel))_setlevel = 1;
        iCSR.tracelevel = _setlevel || 0; //default tracelevel
        iCSR.CFG.tracing = true; //extra information in the F12 Developer console
        iCSR.CFG.ErrorCount = 0;
        iTrace(0, 'iCSR trace level ' + iCSR.tracelevel + ' - template initialized - ' + new Date());
        return true;
    };
    iCSR.traceoff = function (_setlevel) {
        iCSR.CFG.tracing = _setlevel ? iCSR.traceon(_setlevel) : false; //disable tracing
    };
    iCSR.catch = function (e, _functionname, functionreference) { //generic try/catch error reporting
        // Compare as objects
        if (e.constructor === SyntaxError) {
            iCSR.traceerror(_functionname, 'programming error!', functionreference); // There's something wrong with your code, bro
        }
        // Get the error type as a string for reporting and storage
        iCSR.traceerror(_functionname, e.constructor.name, functionreference, e); // SyntaxError
    };


    //global reference to trace, makes it easy to comment them all with // so they are deleted in when file is minified
    var iTrace = iCSR.trace;
    var iTraceWarning = iCSR.tracewarning;
    window.iTrace = iCSR.trace;
    window.iTraceWarning = iCSR.tracewarning;

//endregion ---------------------------------------------------------------------------------------- ### iCSR.info
//region --- iCSR._RegisterDefaultTemplates -------------------------------------------------------- ### iCSR._RegisterDefaultTemplates
    /******************************************************************************************************************
     * One function to register all default iCSR Template: DueDate, PercentComplete, Priority, Planner
     *
     * for detailed documentation on Templates see github: http://iCSR.github.io
     *
     */
    iCSR._RegisterDefaultTemplates = function () {
//region --- iCSR.ExampleTemplate------------------------------------------------------------------- ### iCSR.ExampleTemplate
        /******************************************************************************************************************
         * Basic iCSR Template explaining the iCSR concepts
         * You can copy paste this RegisterTemplate function in your Cisar or other editor and continue with it
         */
        iCSR.Template('Example', function () { // the name will make the template available as: View:iCSR.iCSRexample
                /******************************************************************************************************************
                 * On execution the function gets the scope set to its iCSR template configuration (see iCSR configuration below)
                 * This configuration is a cumulative of: (see function iCSR.fn.get_configTemplate()
                 *  1 : default iCSR configuration (see TemplateManager)
                 *  2 : default Template configuration (declared below)
                 *  3 : bound scope confuration (View:iCSR.Example.bind({ colors:"pink,orange,lightblue" })
                 *  (so configuration set in the 3 bound scope overwrites any previous property value)
                 *
                 *  - the configuration includes all major Item values
                 *      - .Name     =   ctx.CurrentFieldSchema.Name
                 *      - .value    =   ctx.CurrentItem[ctx.CurrentFieldSchema.Name]
                 *      for complete list see http://iCSR.github.io
                 *
                 * ctx is also available inside the iCSR function, but just like in vanilla CSR: it is a Global object!
                 *
                 * All configuration values can be used as [token] replacements
                 *
                 * */
                var example = this;                             // pointer so the code below is easier to read
                /******************************************************************************************************************
                 * output is required, this is the iCSR html sent back to SharePoint
                 * before SharePoint displays it in the Browser, iCSR will expand all [token] declarations
                 * with the values from the current scope
                 */
                example.color = example.colors[1];             // .colors is declared in configuration
                example.location = "World";                     // new declaration, .location is a [token] in .prefix (see configuration below)
                example.output = "<div style='background:[color];'>[prefix] This is item: [value]</div>";
            },//function
            {//config
                colors: "red,yellow,blue",                      // default colors, overruled with: View:iCSR.Example.bind({ colors:"pink,orange,lightblue" }
                                                                // iCSR will convert this string into an Array of colors!!
                prefix: "Hello [location]!!!"
            }
            //config
        );//RegisterTemplate

        /**
         * Skeletton iCSR Template you can copy/paste
         */
        //iCSR.Template('Example', function () {
        //        var example = this;
        //        example.output = "<div style='background:[color];'>[value]</div>";
        //    },//function
        //    {//config
        //        color: "yellow"
        //    }//config
        //);//RegisterTemplate

//endregion --------------------------------------------------------------------------------------- iCSR.ExampleTemplate
//region --- iCSR.Status --------------------------------------------------------------------------- ### iCSR.Status
        /**
         * Color the default (internal fieldname) Status (Task List) with colors
         */

        iCSR.Template('Status', function () {
                var status = this;
                status.color = status.colors[status.value];
                if (status.value === "Waiting on someone else") status.value = "Waiting";
                status.value = iCSR.Str.nobreak(status.value);
                status.output = status.style.container;
            },//function
            {//config
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
                divClass: 'iCSR_Status_Container',
                Styles: {
                    default: {
                        container: "<div class='[divClass]' style='background:[color];color:[textcolor]'>&nbsp;[value]&nbsp;</div>",
                        CSS: {
                            container: ".[divClass] {font-size:[fontsize];height:[height];text-align:center;[padding]}"
                        }
                    },
                    colortext: {
                        container: "<div class='[divClass]' style='color:[color]'>&nbsp;[value]&nbsp;</div>",
                        CSS: { //object of strings with tokenized CSS definitions
                            container: ".[divClass] {font-size:[fontsize];}"
                        }
                    },
                    block: {
                        container: "<div class='[divClass]'><div style='float:left;background:[color];width:[width]'>&nbsp;</div>&nbsp;[value]&nbsp;</div>",
                        CSS: { //object of strings with tokenized CSS definitions
                            container: ".[divClass] {font-size:[fontsize];}"
                        }
                    }
                }
            }//config
        );//RegisterTemplate
//endregion --------------------------------------------------------------------------------------- iCSR.Status
//region --- iCSR.DueDate -------------------------------------------------------------------------- ### iCSR.DueDate
        //noinspection HtmlUnknownAttribute
        /**
         * Calculate days past or before DueDate and color
         */

//noinspection HtmlUnknownAttribute
        iCSR.Template('DueDate', function () {
                var duedate = this;
                if (typeof duedate.days !== 'number') {
                    duedate.output = duedate.datepicknodate;
                    return;
                }
                if (!duedate.interactive) {
                    //duedate.input="[datepicker_chrome]";//duedate.input='[datepicker]';
                    duedate.datepicker = _emptyString;
                }
                duedate.ranges = iCSR.Color.extract(duedate.ranges);//make sure it is an array: color,days,color,days
                var colornr = 0;
                while (Number(duedate.ranges[colornr + 1]) < duedate.days) colornr += 2; //loop to find color

                duedate.color = duedate.ranges[colornr];

                if (duedate.days < 0) {
                    duedate.label = duedate.labelPast;
                } else if (duedate.days === 0) {
                    duedate.absdays = '';
                    duedate.label = duedate.labelToday;
                } else if (duedate.days > 0) {
                    duedate.label = duedate.labelFuture;
                }
            },//function
            {//config
                allowGroupHeader: false,
                allowGridMode: true,
                ranges: '#f55,-21,#f7a,-14,#fab,-7,#fda,0,#cf9,7,#9fa',
                labelNodate: 'No Date',
                labelToday: 'today',
                labelFuture: '[absdays] days left',
                labelPast: '[absdays] days past',
                onclick: "onclick='{event.stopPropagation();}'",
                onchange: "onchange=\"iCSR.SP.UpdateItem(this,'[ID]','[Name]',new Date(this.value))\" ",
                width: "150px",
                mindate: "2000-12-31",
                datepicker_chrome: "[absdays] [label] <input type='date' min='[mindate]' [onclick] [onchange] value='[datepickervalue]' style='background:[color]'>",
                //interactive for non Chrome browser
                onclickSubtract: "onclick=\"iCSR.SP.UpdateItem(this,'[ID]','[Name]',iCSR.Date.add('[value]',-1))\" ",
                onclickAdd: "onclick=\"iCSR.SP.UpdateItem(this,'[ID]','[Name]',iCSR.Date.add('[value]',1))\" ",
                nextday: "next day",
                previousday: "previous day",
                setpreviousday: "<DIV class='[divClass]update [divClass]yesterday' [onclickSubtract]> [previousday] </DIV>",
                setnextday: "<DIV class='[divClass]update [divClass]tomorrow' [onclickAdd]> [nextday] </DIV>",
                datepicker: "<DIV class='iCSRdatepicker'>[setpreviousday] [setnextday]</DIV>",
                datepicknodate: "<div onclick=\"iCSR.SP.UpdateItem(this,'[ID]','[Name]',iCSR.Date.add(false,0))\" >[labelNodate]</div>",
                //non-interactive
                datedisplay: "<DIV class='iCSRdaycount'>[label]</DIV><DIV class='iCSRdate'>[value]</DIV>[datepicker]",
                divClass: 'iCSR_DueDate_Container',
                Styles: {
                    default: {
                        container: "<div class='[divClass]' style='background:[color]'>[datedisplay][[onDOMload]]</div>",
                        CSS: {
                            container: ".[divClass] {width:[width];color:[textcolor];height:[height];padding:-2px 2px 0px 2px}",
                            daycount: ".iCSRdaycount {position:relative;float:left;}",
                            date: ".iCSRdate {position:relative;float:right;}",
                            datepicker: ".iCSRdatepicker {position:relative;z-index:3;width:100%;height:[height]}",
                            dayselect: ".[divClass]tomorrow,.[divClass]yesterday {display:block;font-size:14px;position:absolute;width:60%}",
                            yesterday: ".[divClass]yesterday {left:0%}",
                            tomorrow: ".[divClass]tomorrow {right:0%;text-align:right}",
                            update: ".[divClass]update {width:20px;height:[height];font-weight:bold;opacity:0}",
                            updatehover: ".[divClass]update:hover {color:white;font-weight:bold;opacity:1;cursor:pointer;background:grey}",
                            input: ".[divClass]>input {width:125px;border:none;margin-top:-4px;}"
                        }
                    }
                }
            }//config
        );//RegisterTemplate
//endregion ---------------------------------------------------------------------------------------- iCSR.DueDate
//region --- iCSR.Priority ------------------------------------------------------------------------- ### iCSR.Priority
        //noinspection BadExpressionStatementJS,HtmlUnknownTarget
        /**
         * color the (1) High, (2) Medium (3) Low by color
         * should be localized safe because it extracts the CurrentFieldSchemaChoices (this is done in the default getconfig)
         */
        iCSR.Template('Priority', function () {
                var prio = this,
                    currentchoice = 0;
                var htmlparts = prio.Choices.map(function (choice, nr) {  // process all Choices and built the html for each
                    prio.nr = String(nr);
                    prio.choice = choice; // store so it can be used in Styles
                    prio.color = prio.colors[choice];
                    prio.click = '';
                    if (prio.value === choice) {
                        currentchoice = nr;
                        prio.classname = prio.Classcurrent;
                        prio.label = prio.shortlabel;
                    } else {
                        prio.click = prio.clickupdate;
                        prio.classname = prio.Classchoice;
                        prio.label = '&nbsp;&nbsp;';
                    }
                    if (!prio.interactive) prio.classname += ' NonInteractive';// add CSS class for non-interactive Template
                    return prio.$replacetokens(prio.style.item);               // config settings are changed INside the loop, so replace tokens for every item
                });
                if (prio.interactive && htmlparts[currentchoice].indexOf('onclick') > -1) {        // is there on onclick handler
                    prio.choices = htmlparts;
                } else {
                    prio.choices = htmlparts[currentchoice];
                }
            },//function
            {//config
                colors: "[msRed]/black,[msYellow],[msGreen]",//Microsoft colors
                width: '110px', //total width
                widthCurrent: '50%',
                widthChoice: '15px', //width of the non Current Choice options
                divClass: 'iCSRpriority_Container',
                Classcurrent: 'iCSRpriority_Current',
                Classchoice: 'iCSRpriority_Choice',
                clickupdate: "iCSR.SP.UpdateItem(this,'[ID]','[Name]','[choice]');", //ID,Name,value
                layouts: '/_layouts/15/images/',
                style: 'iCSRbar',//default Styles.nnn
                Styles: {
                    default: {
                        container: "<div class='[divClass]'>[choices]</div>",
                        item: "<span class=\"[classname]\" style=\"color:[color]\" onclick=\"[click]\">[label]</span>",
                        CSS: {
                            container: ".[divClass] {}",
                            containerDiv: ".[divClass]>div {position:relative;float:left;}",
                            choice: ".[Classchoice] {cursor:pointer;opacity:.2}",
                            choicehover: ".[Classchoice]:hover {opacity:1;border-color:black}"
                        }
                    },
                    iCSRbar: {
                        item: "<div class=\"[classname]\" style=\"background:[color]\" onclick=\"[click]\">[label]</div>",
                        CSS: { //object of strings with tokenized CSS definitions
                            container: ".[divClass] {width:[width];}",
                            containerDiv: ".[divClass]>div {position:relative;float:left;display:inline;border:1px solid grey}",
                            currenttext: ".[Classcurrent] {font-size:[fontsize];color:[textcolor]}",
                            currentlabel: ".[Classcurrent] {width:[widthCurrent];text-align:center;padding:2px;}",
                            currentnoninteractive: ".[Classcurrent].NonInteractive {width:100%}",
                            choice: ".[Classchoice] {width:[widthChoice];cursor:pointer;opacity:.4}",
                            choicehover: ".[Classchoice]:hover {opacity:1;border-color:black}"
                        }
                    },
                    kpi1: {
                        container: "<div class='[divClass]'>[choices]</div>",
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
                }//Styles
            }//config
        );//RegisterTemplate
        /** IDE ignore definitions in String (escaped double quotes to keep onclick working and img src references which IDE can't recognize*/
//endregion iCSR.Priority -------------------------------------------------------------------------- ### iCSR.Priority

//x

//region --- iCSR.PercentComplete ------------------------------------------------------------------ ### iCSR.PercentComplete
        //noinspection HtmlUnknownAttribute
        /**
         * show a percentage bar
         * 3 available predefined Styles:
         *                              default
         *                              progress (HTML5 Progress)
         *                              range (slider)
         */
        iCSR.Template('PercentComplete', function () {
                var progress = this;
                var bars = [100, 90, 80, 70, 60, 50, 40, 30, 20, 10];
                progress.bars = bars.map(function (percentage, nr) {
                    progress.nr = String(nr);                                           // standard practice use nr for items in a loop, so it can be used as token [nr]
                    progress.percentage = percentage;                                   // make percentage available as token [percentage]
                    progress.label = percentage;
                    progress.click = '';                                                // no click
                    progress.barclass = "pastProgress";                                 // classes
                    if (percentage > progress.valuenr) {                                // progress can be set for higher values
                        progress.click = progress.onclick;                              // add onclick handler
                        progress.updatevalue = percentage / 100;                        // SharePoint expects 0 to 1 values
                        progress.barclass = "newProgress";                              // classes
                    } else if (percentage === progress.valuenr) {                       // current value
                        progress.barclass = "currentProgress";
                    }
                    return progress.$replacetokens(progress.style.item);                // config settings are changed INside the loop, so replace tokens for every item
                });
                if (progress.valuenr > 0) {                                             // add reset to 0 option
                    progress.updatevalue = 0;
                    //noinspection HtmlUnknownAttribute
                    progress.bars.push("<div class='resetProgress' [onclick]>[resettext]</div>");
                }
                progress.output = progress.style.container;                             // output container definition with [bars]
            },//function
            {//config
                background: "lightgrey",
                scalecolor: "grey",
                scalesize: "75%",
                barcolor: "#0072C6",//default SharePoint blue
                color: "beige",
                colorhover: "beige",
                barcolorhover: "green",
                onclick: "onclick=\"iCSR.SP.UpdateItem(this,'[ID]','[Name]','[updatevalue]')\" ",
                percentsign: "<span style='display:inline-block;text-align:right;font-size:70%'>&nbsp;%</span>",
                rangecolor: "inherit",
                rangelabelcolor: "inherit",
                resettext: " reset to 0 ",
                rangelabel: "<span style='color:[rangelabelcolor];display:inline-block;text-align:right;width:20px'>[valuenr]</span>[percentsign]",
                onchange: " onchange=\"iCSR.SP.UpdateItem(this,'[ID]','[Name]',String(Number(this.value)/100) )\" ",
                oninput: " oninput=\"this.nextSibling.innerHTML=this.value;\" ",
                width: "160px",
                height: "15px",
                rangeheight: "24px",
                CSSinset: "border-radius:1px;box-shadow: 0 2px 5px rgba(0, 0, 0, 0.25) inset;",
                divClass: "pbar",
                Styles: {
                    default: {
                        container: "<div id='[templateid]' class='[divClass]'>[bars]</div>",
                        item: "<div class='[barclass]' style='width:[percentage]%' [click]>[label]</div>",
                        CSS: {
                            container: ".[divClass] {width:[width];height:[height];position:relative;background:[background]}",
                            scale: ".[divClass] {font-family:arial;font-size:11px;color:[scalecolor]}",
                            bar: ".[divClass]>div {position:absolute;text-align:right;font-size:[scalesize];height:100%;}",
                            barscale: ".[divClass]>div {border-right:1px solid #aaa;}",
                            hover: ".[divClass]>div:not(.currentProgress):hover{color:[colorhover];font-size:100%;background:[barcolorhover];z-index:4;cursor:pointer;opacity:.8}",
                            hoverbefore: ".[divClass]>div:not(.currentProgress):hover:before{content:'►';font-weight:bold}",
                            currentpercent: ".[divClass]>div:hover:after,.[divClass] .currentProgress:after{content:'%'}",
                            current: ".[divClass] .currentProgress{font-size:100%;z-index:3}",
                            barcolor: ".[divClass] .currentProgress{background:[barcolor];color:[color];[CSSinset]}",
                            reset: ".[divClass] .resetProgress{z-index:3;width:10%;height:[height];overflow:hidden;border-right:0px;color:transparent;padding:0 3px}",
                            resethover: ".[divClass] .resetProgress:hover{width:auto}"
                        }
                    },
                    progress: {
                        container: "<div style='white-space:nowrap'><progress class='[divClass]' value='[valuenr]' max='100'></progress> [value]</div>",
                        CSS: {
                            container: ".[divClass] {height:[height];background:[background];color:[barcolor]}",
                            bar: ".[divClass]::-webkit-progress-value {background:[barcolor];[CSSinset]}",
                            inset: ".[divClass]::-webkit-progress-bar {background:[background];[CSSinset]}",
                            animwk: "@-webkit-keyframes animate-stripes {100% {background-position: -100px 0px;}}",
                            anim: "@keyframes animate-stripes {100% {background-position: -200px 0px;}}",
                            animation1: ".[divClass]::-webkit-progress-bar {-webkit-animation: animate-stripes 5s linear infinite;}",
                            animation2: ".[divClass]::-webkit-progress-bar {animation: animate-stripes 5s linear infinite;}"
                        }
                    },
                    range: {
                        container: "<div style='white-space:nowrap;background:[rangecolor];height:[rangeheight];margin-top:-5px'><input id='[id]' type='range' [oninput] [onchange] min='0' value='[valuenr]' max='100' step=10>[rangelabel]</div>",
                        CSS: {
                            container: ".[divClass] {height:[height];background:[background]}",
                            inset: ".[divClass]::-webkit-progress-bar {background:#eee;border-radius:2px;box-shadow: 0 2px 5px rgba(0, 0, 0, 0.25) inset;}",
                            animwk: "@-webkit-keyframes animate-stripes {100% {background-position: -100px 0px;}}",
                            anim: "@keyframes animate-stripes {100% {background-position: -200px 0px;}}",
                            animation1: ".[divClass]::-webkit-progress-bar {-webkit-animation: animate-stripes 5s linear infinite;}",
                            animation2: ".[divClass]::-webkit-progress-bar {animation: animate-stripes 5s linear infinite;}"
                        }
                    }
                }//Styles
            }//config
        );//RegisterTemplate
//endregion --------------------------------------------------------------------------------------- iCSR.PercentComplete
//region --- iCSR.Planner -------------------------------------------------------------------------- ### iCSR.Planner
        /**
         * For a DateTime field color the field by past/future days with 4 Microsoft Planner colors
         */

//endregion --------------------------------------------------------------------------------------- iCSR.Planner

    }
    ;//iCSR._RegisterDefaultTemplates
//endregion --------------------------------------------------------------------------------------- iCSR._RegisterDefaultTemplates
//region iCSR.TemplateManager - register CSR Templates with function and configurations------------ ### iCSR.TemplateManager
    /******************************************************************************************************************
     * Code level: ADVANCED
     *
     * Manages all iCSR Templates
     *
     */
    /**
     * Create a new iCSR Template
     * @param _templateIDname
     * @param _templatefunction
     * @param _templateconfig
     * @constructor
     */
    _$TemplateManager.CreateTemplate = function (_templateIDname, _templatefunction, _templateconfig) {
        iTraceWarning('Created iCSR Template: iCSR.' + _templateIDname);
        _templateconfig.templateid = _templateIDname;
        _templateconfig.templateCSSid = 'CSS_' + _templateIDname;
        iCSR[_templateIDname] = function (ctx) {                        // create a named function in the global iCSR object
            if (_$hasProperty(ctx, 'CurrentFieldSchema')) {
                // this code gets executed for every call from the CSR template
                iTrace(2, 'Execute iCSR.' + _templateIDname);
                var _config = iCSR.fn._get_configTemplate(ctx, _templateconfig, this); // built one NEW config object from the 3 sources,'this is 'iCSR.Me.bind({OBJECT}) OR ctx.CurrentFieldSchema
                _config.id = _config.templateid + '_' + _config.ID;
                _$TemplateManager._injectconfigTemplateFunctions(_config); // attach with bound scope: setcolor() , $replacetokens()

                if (ctx && ctx.inGridMode && !_config.allowGridMode) {
                    ctx.ListSchema.Field.AllowGridEditing = false;
                    return _config.value;
                }
                if (iCSR.SP.isGroupHeader(ctx) && _config.allowGroupHeader) {
                    return _config.value;
                }
                iCSR.fn._preprocessTemplate(_config);                         // extract the template from the config settings
                _$CSS._appendTemplateCSS(_config.style.CSS, _config);       // inject all the CSS for this template into the current page
                iCSR[_templateIDname].Rows.push(_config);
                iCSR[_templateIDname].executeTemplate.call(_config, ctx);    // ==> execute the actual template function with _config as 'this' scope and ctx as first parameter
                _$TemplateManager._postprocessTemplateOutput(_config);// validate output
                return _config.output;                                       // return the HTML back to SharePoint CSR calling code
            } else {
                iTrace(2, 'Returning function REFERENCE for:' + _templateIDname);
                return iCSR[_templateIDname].bind(ctx);                     // return function REFERENCE with optional {} configuration
            }
        };
    };
    /******************************************************************************************************************
     * iCSR.Me executes all (registered) templates with one statement, matching by fieldname
     * @param ctx
     * @returns {*}
     * @constructor
     */
    iCSR.Me = function (ctx) {
        try {
            if (_$hasProperty(ctx, 'view')) {
                if (ctx.CurrentFieldSchema !== null) {                              // called from a SharePoint Template?
                    var _fieldtype = ctx.CurrentFieldSchema.FieldType;
                    var _fieldname = ctx.CurrentFieldSchema.RealFieldName;                          // get the fieldname eg: Priority
                    //console.log(_fieldname,'\ttype:\t',_fieldtype ,ctx.CurrentFieldSchema);
                    if (iCSR.$hasTemplate(_fieldname)) {                                            // if there is a: iCSR.Priority function
                        return iCSR[_fieldname].call(this, ctx);                                    // call the function, 'this' can be the .bind() scope
                    }
                    var warning = 'No Template for: iCSR.' + _fieldname;
                    iTraceWarning(warning, '(' + _fieldtype + ')');
                    iCSR.SPStatus(warning, 'yellow', 'iCSR:', false, true);
                } else {
                    if (ctx.ListSchema !== null) {                              // called from a SharePoint Template?
                        var _overrides = _overrides || {};
                        _$Object._ensure_object_key_value(_overrides, 'Templates', {});
                        _$Object._ensure_object_key_value(_overrides.Templates, 'Fields', {});
                        ctx.ListSchema.Field.forEach(function (_field) {
                            if (iCSR.$hasTemplate(_field.RealFieldName)) {
                                //use an existing declaration or add a new
                                _$Object._ensure_object_key_value(_overrides.Templates.Fields, _field.RealFieldName, {});
                                //use an existing View declaration or add a new reference to iCSR.Me
                                _$Object._ensure_object_key_value(_overrides.Templates.Fields[_field.RealFieldName], 'View', iCSR.Me);
                            }
                        });
                        return _overrides;
                    }
                }
            } else {                                                                            // ctx parameter is NOT a SharePoint object, called as function
                /**
                 * iCSR.Me was called as function iCSR() and not declared as reference
                 * return a reference with the (optional) config parameter as scope
                 * Proper usage is: View:iCSR.Me.bind({config})
                 * But this way   : View:iCSR.Me({config})
                 * is allowed too
                 */
                iTrace(3, 'CSR Function Reference declared as Function call.');
                return iCSR.Me.bind(ctx);
            }
        } catch (e) {
            iCSR.traceerror(e);
            iCSR.SPStatus(e.message, 'red', 'iCSR error:', false, true);
        }
    };
    /**
     * add or overwrite existing Template function
     *
     * Do NOT bind the _templateconfig to the function because the user wants to .bind() custom configuration
     *
     * @param _templateIDname
     * @param _templatefunction
     * @constructor
     */

    _$TemplateManager.RegisterFunction = function (_templateIDname, _templatefunction) {
        var _prefix = 'New ';
        if (iCSR.$hasTemplate(_templateIDname, true)) {                 // silent check for function existence in iCSR scope
            _prefix = _emptyString;
        }
        iTrace(1, _prefix + 'RegisterFunction', _templateIDname);
        iCSR[_templateIDname].executeTemplate = _templatefunction;      // create a function reference so it can be executed inside the Template function
    };
    /******************************************************************************************************************
     * Main function to Register one iCSR Template
     * @param _templateIDname
     * @param _templatefunction
     * @param _templateconfig
     * @constructor
     */
    _$TemplateManager.RegisterTemplate = function (_templateIDname, _templatefunction, _templateconfig) {
        _templateIDname = _$TemplateManager._validateTemplateName(_templateIDname);           //validate input
        _templatefunction = _$TemplateManager._validateTemplateFunction(_templatefunction);   //validate input
        _templateconfig = _$TemplateManager._validateTemplateConfiguration(_templateconfig);  //validate input
        iTrace(0, '_$TemplateManager.RegisterTemplate', _templateIDname, {templateconfig: _templateconfig});
        //var _createNewTemplate = !iCSR.$hasTemplate(_templateIDname, true);
        var _createNewTemplate = true;//while editting in Cisar always create new Template
        if (_createNewTemplate) {//true=silent fail
            _$TemplateManager.CreateTemplate(_templateIDname, _templatefunction, _templateconfig);
            iCSR[_templateIDname].configuration = _templateconfig;          // extra property on this function itself so the ViewConfiguration can get to it
            iCSR[_templateIDname].Rows = [];                                // storage for all Items that use this template, TODO: multiple use of one Template in the same row
        }
        _$TemplateManager.RegisterFunction(_templateIDname, _templatefunction, _templateconfig);

        iCSR[_templateIDname].$style = function () {//_configKey, _value) {
            var _config = iCSR[_templateIDname].configuration;                   // pointer to configuration because 'this' points to the function itself
            _$Object.list(_config.Styles, _config.templateid + ' predefined Styles:');
        };
        iCSR[_templateIDname].$CSS = function () {//_configKey, _value) {
            var _config = iCSR[_templateIDname].configuration;                   // pointer to configuration because 'this' points to the function itself
            _$CSS.listRules(_config.templateCSSid);
        };
        iCSR[_templateIDname].$Rows = function () {//_configKey, _value) {
            var _config = iCSR[_templateIDname];                   // pointer to configuration because 'this' points to the function itself
            iTraceWarning(_config.Rows.length, 'Rows in this template', _config.Rows);
            _$Object.list(_config.Rows[0], _config.Rows[0].id);
        };
        iCSR[_templateIDname].$config = function (_configKey, _value) {
            var _title = 'iCSR.' + _templateIDname + ' tokens (excluding the tokens created by each listitem)';
            var _config = iCSR[_templateIDname].configuration;                   // pointer to configuration because 'this' points to the function itself
            var _listconfig = false;
            if (_$isUndefined(_configKey)) {
                _listconfig = true;
                _value = _config;
            } else {
                _value = _$Object.gettersetter(_config, _configKey, _value);
                _listconfig = _$isUndefined(_value);
            }
            if (_listconfig) {
                _$Object.list(_config, _title);
                if (_configKey) iTraceWarning('Missing configuration key, you used: ' + _title + '.$config', '(', _configKey, ',', _value, ')');
            }
            return _value;
        };
        iCSR.defineProperty('ic' + _templateIDname + '_config', window, iCSR[_templateIDname].$config);
        iCSR.defineProperty('ic' + _templateIDname + '_styles', window, iCSR[_templateIDname].$style);
        iCSR._Templates.push(_templateIDname);
    };
    //noinspection JSDuplicatedDeclaration
    iCSR.Template = _$TemplateManager.RegisterTemplate; // jshint ignore:line
    /**
     *
     * @param _templateIDname
     * @param _silent
     * @returns {boolean}
     */
    _$TemplateManager.hasTemplate = function (_templateIDname, _silent) {
        var _hasTemplate = _$hasProperty(iCSR, _templateIDname);
        if (!_hasTemplate && !_silent) {
            iTraceWarning('There is no Template:', _templateIDname);
        }
        return _hasTemplate;
    };
    iCSR.$hasTemplate = _$TemplateManager.hasTemplate;

    /**
     * return an allowed templateIDname
     * @param _templateIDname
     * @returns {*}
     */
    _$TemplateManager._validateTemplateName = function (_templateIDname) {
        return _templateIDname;
    };
    _$TemplateManager._validateTemplateFunction = function (_templatefunction) {
        return _templatefunction;
    };
    _$TemplateManager._postprocessTemplateOutput = function (_config) {
        //functions executed when an Item HTML is displayed
        _config.$ensuretoken('onDOMloadFunctions', []);
        if (iCSR.tracingcolors) console.error('post1', _config.combocolor);
        var _escapedstr = "backgroundColor:'[combocolor]'";
        if (_config.rowcolor) _config.onDOMloadFunctions.push("{iCSR.DOM.style(GetAncestor(this,'TR'),{" + _escapedstr + "})}");
        if (_config.cellcolor) _config.onDOMloadFunctions.push("{iCSR.DOM.style(GetAncestor(this,'TD'),{" + _escapedstr + "})}");
        _config.$ensuretoken('onDOMload', "<[blankIMG] onload={[onDOMloadFunctions]}>");

        //final processing for all tokens
        _config.output = _config.$replacetokens(_config.output);// proces the HTML one more time for tokens
        if (iCSR.tracingcolors) console.error('post2', _config.color, _config.textcolor, _config.combocolor, _config.output);

        iTrace(1, 'ID:', _config.ID, _config.templateid, 'output:', iCSR.tracelevel < 3 ? {
            output: _config.output,
            config: _config
        } : _config.output);
    };
    _$TemplateManager._injectconfigTemplateFunctions = function (_config) {
        _config.setcolor = function (tag, color, column) {//todo fix offset of column nr in sharepoint Views with select column
            var elementid = this.iid;
            color = color || this.color;
            column = column || this.counter;
            tag = tag || 'TD';
            _$DOM.wait(elementid, function () {// color TD cell or TR row
                var TR = _$getElementById(elementid);
                if (tag === 'TD') {
                    var TD = TR.cells[column]; //current column
                } else {
                    TR.style.backgroundColor = color;
                }
            }.bind(this), 10);
        }.bind(_config);
        /**
         * The config object inside the Template gets methods/functions with a bound scope
         * that way the function is available inside the template AND works on its OWN configuration
         * @type {function(this:*)}
         */
        _config.$replacetokens = _$Tokens.replace.bind(_config);            // define a bound function so Tokens.replace executes on config without the need for passing it as parameter
        _config.$ensuretoken = _$Tokens.ensureTokenexists.bind(_config);    // define a bound function so Tokens.ensureTokenexists function
    };
    /**
     * Default configuration for all Templates, major [tokens] are declared here, thus available for every Template a user creates
     * @returns {*|{divClass: string}}
     * @param _config
     */
    _$TemplateManager._validateTemplateConfiguration = function (_config) {
        _config = _config || {                  // default config if no config with RegisterTemplate
                divClass: '[templateid]'
            };
        //noinspection HtmlUnknownTarget
        var _defaults = {
            'Styles': {
                default: {                                      // default template if no template with RegisterTemplate
                    container: "<div class='[divClass]' style='background:[color];color:[textcolor]'>&nbsp;[value]&nbsp;[onDOMload]</div>",
                    CSS: {
                        container: ".[divClass] {}"             // Backgroundcolored Status label - default for all custom additions
                    }
                }
            },
            textcolor: 'contrast',
            fontsize: '11px',
            height: '20px',
            //default colors
            msYellow: iCSR.Color.msYellow,
            msRed: iCSR.Color.msRed,
            msBlue: iCSR.Color.msBlue,
            msGreen: iCSR.Color.msGreen,
            colors: "[msYellow],[msRed],[msBlue],[msGreen]",
            gradient7redgreen: ["indianRed", "lightCoral", "Pink", "lightGoldenrodYellow", "lightGreen", "mediumSeaGreen", "limeGreen"],
            //links to edit and display forms
            EditLabel: "Edit",
            EditLink: "<a href='[urlEdit]' title='Edit [Name]'>[EditLabel]</a>",
            //layouts images
            layouts: "/_layouts/images/"
        };
        Object.keys(_defaults).forEach(function (key) {
            _$Object._ensure_object_key_value(_config, key, _defaults[key]);
        });
        var _layoutsimages = "edititem,loading16,loading,opendb,Progress,star,TXT16";
        iCSR.Array.ensure(_layoutsimages).forEach(function (key) {
            _$Object._ensure_object_key_value(_config, key, "[layouts]img" + key + ".gif");
        });

        _config.blankIMG = "img src='/_layouts/images/blank.gif' ";
        // use the base64 encoded image by default, this causes NO network call
        _config.blankIMG = "img src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7' ";

        _config.output = _config.Styles.default.container;      // default output for all Templates, so a Template works without output being declared
        return _config;
    };
//endregion --------------------------------------------------------------------------------------- iCSR TemplateManager
//region iCSR.Init -------------------------------------------------------------------------------- ### iCSR.init
    /******************************************************************************************************************
     * Initialize iCSR
     */
    iCSR.init = function () {
        if (SP) {
            iCSR._traceheader(false);
            SP.SOD.executeFunc("clienttemplates.js", "SPClientTemplates", function () {
                console.warn('initialized SharePoint clienttemplates.js');
            });
        } else {
            iCSR.traceerror('no SharePoint environment');
        }
    };
//endregion ---------------------------------------------------------------------------------------- iCSR.init
//region iCSR.Tokens ---------- proces strings with [token] markers ------------------------------- ### iCSR.Tokens
    /******************************************************************************************************************
     * Code level: ADVANCED
     *
     * Processes all iCSR [tokens] in Strings
     *
     */
    /******************************************************************************************************************
     * Strings may contain [token] tokens to be replaced by a corresponding config.[token] value     *
     *                                                                                               *
     * config.firstword ='Hello';                                                                    *
     * config.location='[firstword] World';                                                          *
     * _$Tokens.replace( '[location]!' );   ==>  'Hello World!'                                   *
     *                                                                                               *
     * Known issues:  FIXED! WITH VERSION 1.5 RECURSIVE REPLACE FUNCTION
     * Nested [[token]] does not work, creates '[token',']' array                                    *
     *                                                                                               *
     * */
    /******************************************************************************************************************
     * Convert one String to an array, split on specified token indicator [] or () or whatever
     * "Hello [location]" -> 'Hello','location',
     *
     * ** With the new 1.5 recursivereplace of tokens this function is only called for functions like:
     * "svgcircle(20)" -> 'svgcircle','20'
     *
     * @param _tokenstring
     * @param _tokenidentifier
     * @returns {string[]|*|Array}
     */
    _$Tokens.fromStr = function (_tokenstring, _tokenidentifier) {
        var _tokenized = _tokenstring;
        if (_$isString(_tokenized)) {
            var _regexArray = ['(.+?)'];                                                            // match any wordlength
            _tokenidentifier = _tokenidentifier || '[]';                                            // default token is [tokenname]
            var _halflength = parseInt(_tokenidentifier.length / 2);                                // split _tokenindentifier in 2 parts (ready for identiefiers like ##tokenname##)
            _tokenidentifier = _tokenidentifier.match(new RegExp('.{1,' + _halflength + '}', 'g')); // split identifier in chunck size
            if (_tokenidentifier.length === 2) {
                _regexArray.unshift('\\' + _tokenidentifier[0]);                                    // add escaped leading identifier
                _regexArray.push('\\' + _tokenidentifier[1]);                                       // add second escaped identifier
                _tokenized = _tokenstring.split(new RegExp(_regexArray.join(_emptyString), 'g'));
                iTrace(4, '_$Tokens.fromStr with: ', _tokenidentifier, _tokenstring, _tokenized);
            } else {
                iCSR.traceerror('invalid _tokenidentifier', _tokenidentifier);
            }
        } else {
            iTraceWarning('_$Tokens.fromStr with: ', _tokenstring);
        }
        return _tokenized;
    };
    /******************************************************************************************************************
     *
     * @param _tokenstring
     * @param _tokenconfig
     * @param _islasttoken
     * @returns {*}
     */
    _$Tokens.replacetoken = function (_tokenstring, _tokenconfig, _islasttoken) {
        var _tokenized = _tokenstring;
        if (_tokenized !== _emptyString && _tokenized !== "." && _tokenized !== "iCSR") {   // always ignore these tokens
            if (_$hasProperty(_tokenconfig, _tokenstring)) {                                // is the [_tokenstring] defined in the Template config?
                _tokenized = _tokenconfig[_tokenstring];                                    // predefined tokens defined in .config object take precedence over token
                if (_$Tokens.hasfunction(_tokenstring)) {
                    _tokenized = _$Tokens.functions[_tokenstring].call(_tokenconfig, _tokenized);
                }
                if (_$isFunction(_tokenized)) {                                             // undeveloped option
                    //TODO: (normal) allow script creation... cool to investigate how far this would lead
                } else if (_$isObject(_tokenized)) {                                               // is the result an Object or Array?
                    if (Array.isArray(_tokenized)) {                                        // Arrays are (most likely) a result from an HTML building function
                        _tokenized = _tokenized.join(_emptyString);                         // So return them as concatenated String
                    } else {
                        //TODO: (normal) ?? do we want to allow script creation... cool to investigate how far this would lead
                    }
                }
            }
            if (_$Tokens.hasfunction(_tokenized)) {
                var _functionDef = _$Tokens.fromStr(_tokenstring, '()'),//token functions like: svgcircle(20) ==> ['svgcircle','20']
                    _functionname = _functionDef[0],
                    _parameters = _functionDef[1];
                iTrace(1, 'call: ', _functionname, '(', _parameters, ')');
                var _tokenfunctionResult = _$Tokens.functions[_functionname].call(_tokenconfig, _parameters);//TODO: check svcircle operation
                if (_$isString(_tokenfunctionResult)) {
                    iCSR.traceerror('Token function must return a String, called:', _functionname, _parameters);
                }
            }
            if (_tokenstring === _tokenized) {//nothing was changed
                var _object = _tokenstring.split('.');// CurrentItem.ID
                var _objectName = _object[0];
                if (_$hasProperty(_tokenconfig, _objectName)) {
                    var _objectKey = _object[1];
                    _tokenized = _tokenconfig[_objectName][_objectKey];
                } else {
                    if (iCSR.Str.alphanumeric(_tokenstring) === _tokenstring && _islasttoken) {//token is not declared yet
                        _tokenized = '[' + _tokenstring + ']';
                        iTrace(4, 'replacetoken UNTOUCHED: ', _tokenized);
                    }
                }
            } else {
                if (_tokenized) iTrace(3, 'replacetoken:', _tokenstring, '\n==>', _tokenized);
            }
        }
        return _tokenized;
    };
    /******************************************************************************************************************
     * replace 'Hello [location]!' with propertyvalue from _tokenconfig {location:'World'}  => 'Hello World!'
     * The functions loops to de-token any nested token definitions eg: location="from [countryname]"
     *
     * @param _string
     * @param _tokenconfig
     * @returns {*}
     */
    _$Tokens._recursivereplace = function (_string, _tokenconfig) {
        var _recursecount = 0;// safe guard against endless loops
        var _previousreplacedtoken = '';

        function _recursivereplacetokens(_strpart) {
            _recursecount++;
            if (_recursecount > 1000) {
                return "**RECURSION LIMIT**";
            } // safeguard against any of my stupid recursion programming mistakes
            for (var i = 0; i < _strpart.length; i++) {                     // loop all letters in this string
                var _char = _strpart[i];
                var _token = _strpart.substr(0, i);
                var _remainder = _strpart.slice(i + 1);
                var escape = _strpart[i - 1] === '\\';//todo: fix some patterns that don't escape well: blue[red]green][color]
                if (escape) {
                    _strpart = _token.slice(0, i - 1) + _char + _remainder;
                    _char = false;
                }
                if (!escape && _char === "]") {
                    var _replacedtoken = _emptyString;
                    if (_token === '?') {
                        if (_tokenconfig.templateid) {
                            _$Object.list(_tokenconfig, 'Available tokens for: ' + _tokenconfig.templateid);
                        }
                    } else {
                        _previousreplacedtoken = _token;
                        _replacedtoken = _$Tokens.replacetoken(_token, _tokenconfig, false);  // _islasttoken=false
                    }
                    if (_replacedtoken === _token) {//nothing changed
                        _strpart = _token + _remainder;
                    } else {
                        return _recursivereplacetokens(_replacedtoken + _remainder);
                    }
                }
                if (_char === "[") {
                    var _replacer = _recursivereplacetokens(_remainder);
                    _strpart = _token + _replacer;
                }
            }
            return _strpart;
        }

        return _recursivereplacetokens(_string);
    };
    _$Tokens.replace = function (_string, _tokenconfig) {
        _tokenconfig = _tokenconfig || this;                                // tokens defined in optional .bind(config) for each Template function

        //var _recursivereplace = true;
        ////new v1.5 [token] replace code using recursion, the old code could not handle: blue[[colorname]]green
        //if (_recursivereplace) {
        return _$Tokens._recursivereplace(_string, _tokenconfig);
        //}
        //if (!_string) {
        //    iTraceWarning('empty _string in Token replace:', _string);
        //    return _string;
        //}
        //if (_$isString(_string)) {
        //
        //    //old [token] replace code using a loop
        //    var _tokenArray;                                                    // working array breaking string into tokens
        //    var _tokencount = 1;                                                 // count how many tokens are in the array,
        //    var loop;                                                           // to break out of the loop when all work is done
        //    for (loop = 0; loop < 10; loop++) {                                 // too lazy to develop recursive code
        //        _tokenArray = _$Tokens.fromStr(_string, '[]');    // make array of string 'Hello [location]' => ['Hello ','location']
        //        var _tokenCount = _tokenArray.length;
        //        var _multipleTokens = _tokenCount > 1;
        //        var _onevalidToken = _tokenCount === 1 && (_tokenArray[0].length < 15);//Todo: cleanup
        //        if (_multipleTokens || _onevalidToken) {
        //            _tokenArray = _tokenArray.map(function (token) {
        //                var _replacedtoken = token;
        //                if (token === '?') {
        //                    if (_tokenconfig.templateid) {
        //                        _$Object.list(_tokenconfig, 'Available tokens for: ' + _tokenconfig.templateid);
        //                    }
        //                    _replacedtoken = _emptyString;
        //                } else {
        //                    _replacedtoken = _$Tokens.replacetoken(token, _tokenconfig, _tokenArray.length === 1);
        //                }
        //                return _replacedtoken;
        //            });// jshint ignore:line
        //        }
        //        _string = _tokenArray.join(_emptyString);//make it one string again
        //        if (_tokenArray.length === _tokencount) break;//exit loop if no more tokens need to be replaced
        //        _tokencount = _tokenArray.length;
        //    }
        //    iTrace(3, '_$Tokens.replace', '(' + typeof _string + ') _tokenArray in ', loop, 'iterations', {
        //        "string": _string,
        //        "array": _tokenArray
        //    });
        //}
        //return _string;
    };
    /**
     * check if a token exists, or create it with default value
     * @param _token
     * @param _tokendefault
     */
    _$Tokens.ensureTokenexists = function (_token, _tokendefault) {
        return _$Object._ensure_object_key_value(this, _token, _tokendefault);// 'this' is the bound config scope
    };
    /******************************************************************************************************************
     *
     * @param _circleSize
     * @param _circleColor
     * @returns {*}
     */
    _$Tokens.functions.svgcircle = function (_circleSize, _circleColor) {
        _circleColor = _circleColor || '[color]';//token is replaced later with correct color
        var _radius = _circleSize / 2;
        var _html = "<svg height=" + _circleSize + " width=" + _circleSize + ">";
        _html += "<circle cx=" + _radius + " cy=" + _radius + " r=" + _radius + " fill='" + _circleColor + "'/>";
        _html += "</svg>";
        return _html;
    };
    _$Tokens.functions.layoutsimage = function (_imagename) {// layoutsimage('star')
        //noinspection HtmlUnknownTarget
        return "<img src='/layouts/images/" + iCSR.Str.alphanumeric(_imagename) + ".gif'/>";
    };

    /******************************************************************************************************************
     *
     * @param _functionname
     * @returns {boolean}
     */
    _$Tokens.hasfunction = function (_functionname) {
        var _hasFunction = false;
        if (_$isString(_functionname)) {
            _functionname = _functionname.split('(')[0];
            if (_$hasProperty(_$Tokens.functions, _functionname)) {
                _hasFunction = true;
            }
        }
        return _hasFunction;
    };
//endregion --------------------------------------------------------------------------------------- iCSR.Tokens
//region iCSR.Str ------------- String utility functions ------------------------------------------ ### iCSR.Str
    /******************************************************************************************************************
     * Code level: MEDIUM
     *
     * Generic string functions
     *
     */
    iCSR.Str.nobreak = function (_string) { //replaces space with nonbreakingspaces
        _string = _string || _emptyString;
        return _string.replace(/ /gi, '&nbsp;');
    };
    iCSR.Str.alphanumeric = function (_string, _replacer) {//replace all non a-z and 0-9 characters
        return _string.replace(/[^a-z0-9+]+/gi, _replacer || _emptyString);
    };
    iCSR.Str.number = function (_string, _default) { //extract FIRST number from string or return _default
        if (!_$isString(_string)) return _string;
        var _value = _string.match(/\d+/);
        if (_value) return _value[0];
        return _default;
    };
    iCSR.Str.label = function (value) {// (1) Label => Label
        //TODO make generic wih regex to process [n] Label and (1)Label return Object {nr:nr,label:label}
        var _valuemarker = ') ',
            label = value && value.indexOf(_valuemarker) > 0 ? value.split(_valuemarker)[1] : value;
        return (label);
    };
//endregion --------------------------------------------------------------------------------------- iCSR.Str
//region iCSR.Date ------------ DateTime utility functions ---------------------------------------- ### iCSR.Date
    /******************************************************************************************************************
     * Code level: MEDIUM
     *
     * Generic Date functions (saves from using momentJS
     *
     */

    /******************************************************************************************************************
     * Returns a property array
     * @returns {{yyyy: number, MM: number, dd: number, hh: number, mm: number, ss: number}}
     * @param _date
     */
    iCSR.Date.object = function (_date) {
        if (_$isString(_date)) _date = new Date(_date);
        _date = _date || new Date();//today
        _date = {
            "yyyy": _date.getFullYear(),
            "MM": _date.getMonth() + 1,//months in JavaScript are zero based
            "dd": _date.getDate(),
            "hh": _date.getHours(),
            "mm": _date.getMinutes(),
            "ss": _date.getSeconds()
        };
        _date.yy = String(_date.yyyy).substring(2);
        return _date;
    };
    /******************************************************************************************************************
     * Adds/substracts days from a given date (ignores time value)
     * @param _date
     * @param _numberOfDays
     * @param _numberOfMonths
     * @param _numberOfYears
     * @returns {Date}
     */
    iCSR.Date.add = function (_date, _numberOfDays, _numberOfMonths, _numberOfYears) {
        _date = _date || new Date();//today
        _date = iCSR.Date.object(_date);
        return new Date(
            _date.yyyy + (_numberOfYears ? _numberOfYears : 0),
            _date.MM + (_numberOfMonths ? _numberOfMonths : 0) - 1,//months in JavaScript are zero based
            _date.dd + (_numberOfDays ? _numberOfDays : 0),
            _date.hh,
            _date.mm,
            _date.ss
        );
    };
    /******************************************************************************************************************
     * Formats a date as string: iCSR.Date.format( new Date() , "yyyy-MM-dd" )  =>  "2016-2-1"
     *
     * TODO dates/months need leading zeros
     *
     * @param _date
     * @param _datestring
     * @returns {*|string}
     */
    iCSR.Date.format = function (_date, _datestring) {
        var isSP = true;
        _datestring = _datestring || "yyyy-MM-dd";
        _date = _date || new Date();                                          // today
        if (isSP) {
            return String.format("{0:" + _datestring + "}", _date);           // use SharePoint default function if it exists
        }
        _date = iCSR.Date.object(_date);
        for (var _datekey in _date) {
            //noinspection JSUnfilteredForInLoop
            if (_$hasProperty(_date, _datekey)) {
                //noinspection JSUnfilteredForInLoop
                var replacekey = new RegExp(_datekey, 'g');
                //noinspection JSUnfilteredForInLoop
                _datestring = _datestring.replace(replacekey, _date[_datekey]);
            }
        }
        return _datestring;
    };
    /**
     *
     */
    iCSR.Date.diff = function (_date, _seconddate) {
        _date = new Date(_date);                                        // make sure strings are converted to a Date value
        if (_date instanceof Date && !isNaN(_date.valueOf())) {             // is it a valid Date?
            return GetDaysAfterToday(_date, _seconddate || new Date());
        }
        iTrace(4, 'Incorrect Date conversion from:', _date);
        return false;                                                       // return false for incorrect dates
    };

//endregion --------------------------------------------------------------------------------------- iCSR.Date
//region iCSR.Array ----------- Array utility functions --------------------------------------------### iCSR.Array
    /**
     * Make sure everything is an Array (covert strings to Array)
     * @param _array
     * @param _separator
     * @returns {*}
     */
    iCSR.Array.ensure = function (_array, _separator) {
        _separator = _separator || ',';
        if (_$isString(_array)) {
            if (_array === _emptyString) return [];               // return empty array for empty string
            _array = _array.split(_separator);
        }
        return _array;
    };

//endregion --------------------------------------------------------------------------------------- iCSR.Array
//region iCSR.Object ---------- Object utility functions -------------------------------------------### iCSR.object
//noinspection JSUnusedGlobalSymbols
    /**
     * major Object functionality copied from jQuery, refactored because no IE8,9 support is required
     *
     * Todo: use same extend but refactored slightly different?? https://gist.github.com/jonjaques/3036701
     */
    _$Object = {
        isFunction: function (_obj) {
            return _obj !== null && typeof _obj === "function";
        },
        isArray: function (_obj) {
            //noinspection JSTypeOfValues
            return _obj !== null && typeof _obj === "array"; // jshint ignore:line
        },
        isWindow: function (_obj) {
            return _obj !== null && _obj === _obj.window;
        },
        isNumeric: function (_obj) {
            return !isNaN(parseFloat(_obj)) && isFinite(_obj);
        },
        type: function (_obj) {
            if (_obj === null) {
                return String(_obj);
            }
            return typeof _obj;
        },
        isPlainObject: function (_obj) {
            // Must be an Object.
            // Because of IE, we also have to check the presence of the constructor property.
            // Make sure that DOM nodes and window _objects don't pass through, as well
            if (!_obj || _$Object.type(_obj) !== "object" || _obj.nodeType || _$Object.isWindow(_obj)) {
                return false;
            }
            try {
                // Not own constructor property must be Object
                if (_obj.constructor) {
                    return false;
                }
            } catch (e) {
                // IE8,9 Will throw exceptions on certain host objects #9897
                return false;
            }
            // Own properties are enumerated firstly, so to speed up,
            // if last one is own, then all properties are own.
            var _key;
            for (_key in _obj) {
            }
            return _key === undefined;
        },
        isEmpty: function (_obj) {
            return Object.keys(_obj).lenght <= 0;
        },
        extend: function () {
            var src, copyIsArray, copy, name, options, clone,
                target = arguments[0] || {},
                i = 1,
                length = arguments.length,
                deep = false;
            if (typeof target === "boolean") {                                  // Handle a deep copy situation
                deep = target;
                i = 2;                                                          // skip the boolean and the target
            }
            if (typeof target !== "object" && !_$Object.isFunction(target)) {     // Handle case when target is a string or something (possible in deep copy)
                target = {};
            }
            if (length === i) {                                                 // extend iCSR.Object itself if only one argument is passed
                target = this;
                --i;
            }
            for (; i < length; i++) {
                if (( options = arguments[i] ) !== null) {                       // Only deal with non-null/undefined values
                    for (name in options) {                                     // Extend the base object
                        //noinspection JSUnfilteredForInLoop
                        if (_$hasProperty(options, name)) {
                            //noinspection JSUnfilteredForInLoop
                            src = target[name];
                            //noinspection JSUnfilteredForInLoop
                            copy = options[name];
                            if (target === copy) {                                  // Prevent never-ending loop
                                continue;
                            }
                            // Recurse if we're merging plain objects or arrays
                            if (deep && copy && ( _$Object.isPlainObject(copy) || ( copyIsArray = _$Object.isArray(copy) ) )) {
                                if (copyIsArray) {
                                    copyIsArray = false;
                                    clone = src && _$Object.isArray(src) ? src : [];
                                } else {
                                    clone = src && _$Object.isPlainObject(src) ? src : {};
                                }
                                //noinspection JSUnfilteredForInLoop
                                target[name] = _$Object.extend(deep, clone, copy);// Never move original objects, clone them
                            } else if (copy !== undefined) {                        // Don't bring in undefined values
                                //noinspection JSUnfilteredForInLoop
                                target[name] = copy;
                            }
                        }
                    }
                }
            }
            return target;                                                      // Return the modified object
        }
    };
    /**
     * extends an Object only with the given keys, if _keys is undeclared it uses all keys from _objsource (same as .extend)
     * @param _objdestination
     * @param _objsource
     * @param _keys
     */
    _$Object.extendbyname = function (_objdestination, _objsource, _keys) {
        _keys = _keys || Object.keys(_objsource);
        _keys = iCSR.Array.ensure(_keys);
        var _newsource = {};
        _keys.forEach(function (_key) {
            if (_$hasProperty(_objsource, _key)) {
                _newsource[_key] = _objsource[_key];
            } else {
                _newsource[_key] = "undefined";
                iTraceWarning(3, 'Missing:', _key, ' in:', _objsource);
            }
        });
        _$Object.extend(_objdestination, _newsource);
    };
    /**
     * generic getter/setter function for Objects
     * @param _obj
     * @param _configKey
     * @param _value
     * @returns {*}
     */
    _$Object.gettersetter = function (_obj, _configKey, _value) {
        var _current = _obj[_configKey];
        if (_$isUndefined(_value)) {
            return _current;
        }
        if (_$hasProperty(_obj, _configKey)) {
            _obj[_configKey] = _value;
        }
        return _obj[_configKey];
    };
    /**
     * Ensures an Object has a property, if it doesn't exist it is created with the _defaultValue
     * @param _obj
     * @param _key
     * @param _defaultvalue
     * @returns {*}
     */
    _$Object._ensure_object_key_value = function (_obj, _key, _defaultvalue) {
        if (_$hasProperty(_obj, _key)) {
            _defaultvalue = _obj[_key];
        } else {
            _obj[_key] = _defaultvalue;
        }
        return _defaultvalue;
    };
    /**
     * List all obj keys and values in the console
     * @param _obj
     * @param _title
     * @param _showtitleasfooter
     */
    _$Object.list = function (_obj, _title, _showtitleasfooter) {
        if (_obj) {
            _showtitleasfooter = _showtitleasfooter || _title;
            iTraceWarning('Object Inspector:', _title || _emptyString);
            if (_$Object.isEmpty(_obj)) {
                iTraceWarning('Empty object');
            } else {
                Object.keys(_obj).forEach(function (key, nr) {
                    console.log(nr, key, _obj[key]);
                });
            }
            iTraceWarning('Object Inspector:', _showtitleasfooter || _emptyString);
        }
    };
//endregion --------------------------------------------------------------------------------------- iCSR.Object
//region iCSR.fn -------------- utility functions --------------------------------------------------### iCSR.fn
    /******************************************************************************************************************
     * Code level: MEDIUM
     *
     * Generic iCSR utility functions
     *
     */
    /**
     * sets config values based on the FieldType
     * @param ctx
     * @param _config
     */
    iCSR.fn._get_configFrom_Colors = function (ctx, _config) { //  config is reference to the config object, so no need for return statements
        if (_$isUndefined(_config.colors) || _config.colors === '') {
            iTraceWarning('Empty .colors');
        } else {
            //var _colors = String(_config.colors);
            _config.colors = _$Tokens.replace(_config.colors, _config);                                     // substitute predefined colors with colorvalues
            _config.colors = iCSR.Color.extract(_config.colors, _config.Choices);
        }
    };
    iCSR.fn._get_configFrom_FieldType = function (ctx, _config) { //  config is reference to the config object, so no need for return statements
        if (_config.FieldType === 'DateTime') {
            var _Date = new Date(_config.value);
            _config.days = iCSR.Date.diff(_config.value);                           // SharePoint function
            _config.datepickervalue = iCSR.Date.format(_Date, 'yyyy-MM-dd');        // yyyy-MM-dd format for HTML5 datepickers
            _config.absdays = Math.abs(_config.days);                               // -2 to 2
            _config.Monthname = String.format('MMMM', _Date);                       // TODO present proper formatted date values

            _config.emptydate = isNaN(_config.days);
            if (_config.emptydate) {                                                // if days was not a Number, reset values
                _config.days = false;
                _config.absdays = false;
            }
        }
    };
    /**
     * Extract config properties from ctx object (including: CurrentItem, CurrentFieldSchema
     * @param ctx
     * @param _config
     */
    iCSR.fn._get_configFrom_ctx = function (ctx, _config) { //  config is reference to the config object, so no need for return statements
        if (ctx) {//SharePoint specific configuration
            _$Object.extendbyname(_config, ctx.CurrentFieldSchema, "Name,DisplayName,RealFieldName,FieldType,counter,Choices");
//            var _getfromCurrentItem = "outlineLevel,ContentType,ContentTypeId,Created,Modified,ID,PermMask,Title,DueDate,PercentComplete,Priority";

            _$Object._ensure_object_key_value(_config, 'Item', ctx.CurrentItem);


            _config.ID = ctx.CurrentItem.ID;
            _config.iid = GenerateIID(ctx);
            if (_$hasProperty(ctx.CurrentItem, _config.Name)) {
                _config.value = ctx.CurrentItem[_config.Name];
            } else {
                _config.value = ctx.CurrentItem[_config.RealFieldName];
            }
            _config.itemid = 'iCSR_' + ctx.wpq + '_' + _config.ID;
            _config.daysCreated = iCSR.Date.diff(ctx.Created);
            _config.daysModified = iCSR.Date.diff(ctx.Modified);
            //urls
            _config.urlEdit = ctx.editFormUrl + "&ID=" + _config.ID;
            _config.urlDisplay = ctx.displayFormUrl + "&ID=" + _config.ID;

        } else {
            _config.ID = 'no ctx';
            _config.iid = false;
            _config.value = 'no ctx value';
        }
    };
    iCSR.fn._get_configFrom_pageContextInfo = function (_config) { //  config is reference to the config object, so no need for return statements
        var _pageContext = window['_spPageContextInfo'];// wrap in string so uglify/minity & obfuscate do not change it
        if (_pageContext) {//SharePoint specific configuration
            _$Object.extendbyname(_config, _pageContext, "userId,userLoginName,webPermMask,pageListId,isSiteAdmin,hasManageWebPermissions,siteAbsoluteUrl,serverRequestPath");
        }
        _config.urlList = _pageContext.serverRequestPath.replace(/[^\/]*$/gi, '');
    };
    /***********************************************************************************************
     * Builts the whole configuration Object for a Template
     * from:
     *                              1 - iCSR default configuration
     *                              2 - Template configuration
     *                              3 - .bind() configuration
     *                              4 - ctx object
     * @param ctx
     * @param _initialTemplateConfig
     * @param _bindTemplateConfig
     * @returns {{}}
     */
    iCSR.fn._get_configTemplate = function (ctx, _initialTemplateConfig, _bindTemplateConfig) {
        var _config = {                                                                              // default value at beginning of Object so they are displayed first
            templateid: _emptyString,
            ID: 0,
            Name: 'none',
            value: false,
            valuenr: false,
            label: false,
            shortlabel: false,
            id: 0,
            itemid: 'none',
            color: 'poep',
            textcolor: 'pies',
            colors: _emptyString
        };
        try {
            _bindTemplateConfig = _$hasProperty(_bindTemplateConfig, 'FieldType') ? {} : _bindTemplateConfig;                  // if scope is the ctx object create a empty object
            _$Object.extend(_config, _initialTemplateConfig);                                               // merge all objects into config object
            _$Object.extend(_config, _bindTemplateConfig);                                                  // merge all objects into config object
            if (_$hasProperty(iCSR, 'interactive')) {                                                       // global configuration options overruling config
                _config.interactive = iCSR.interactive;                                                     // global configuration options overruling config
                if (_$hasProperty(_bindTemplateConfig, 'interactive')) {
                    _config.interactive = _bindTemplateConfig.interactive;                                  // setting in bind config overrules global setting
                }
            }
            iCSR.fn._get_configFrom_ctx(ctx, _config);                                                      // ctx object passed for every Field
            iCSR.fn._get_configFrom_pageContextInfo(_config);                                               // extract info from _spPageContextInfo object

            _config.valuenr = Number(iCSR.Str.number(_config.value, false));
            _config.shortlabel = _config.valuenr ? iCSR.Str.label(_config.value) : _config.value;           //if a valuenr then shorten it
            _config.label = _config.shortlabel;//todo replace shortlabel with label token
            _config.nonbreaklabel = iCSR.Str.nobreak(_config.shortlabel);
            _config.emptystring = _config.value === _emptyString;
            iCSR.fn._get_configFrom_FieldType(ctx, _config);
            iCSR.fn._get_configFrom_Colors(ctx, _config);
            return _config;                                                                                 // return this new object
        }
        catch (e) {
            iCSR.traceerror('_get_configTemplate error', e, '\nsuccesfull config declarations:', _config);
        }
    };
    /******************************************************************************************************************
     * pre-Process all configurations (global, Template, custom) into one configuration for a Template
     * @param _config
     * @returns {*}
     */
    iCSR.fn._preprocessTemplate = function (_config) {//TODO (high) refactor _preprocessTemplate, proper documentation
        iTrace(3, '_preprocessTemplate', {output: _config.style});
        var _ispredefinedtemplate = _$hasProperty(_config.Styles, _config.style);
        var _templatestyle = _config.Styles.default;//start with default template

        if (_ispredefinedtemplate) {
            var _customtemplate = _config.Styles[_config.style];//overwrite with _customtemplate
            _$Object.extend(_templatestyle, _customtemplate);
        } else {
            if (_config.style) _templatestyle.item = _$Tokens.replace(_config.style);
            //_templatestyle.item = "<div class='[classname]' onclick=\\"[click]\\">" + _config.style + "</div>";
        }
        _config.style = _templatestyle;
        return _templatestyle;//also return a copy because the Template function uses a local var (for now)
    };


//region code under development ********************************************************************
    /**
     * Full screen settings from core.js
     */
//SetFullScreenMode(true);//not available yet when CSR runs
//_ToggleFullScreenMode();
//GetCookie('WSS_FullScreenMode');
    /******************************************************************************************************************
     * TODO: (high) refactor, store all Items from View
     */
    iCSR.fn.addItem = function (_config) {
        var _key = _config.Name;
        if (!_$hasProperty(iCSR.Items, _key)) {//init Array
            iCSR.Items[_key] = [];
        }
        iCSR.Items[_key].push(_config.value);
    };
    /******************************************************************************************************************
     * fixate the header of the SharePoint Table
     */
    iCSR.fn.fixedListViewHeader = function () { //create fixed header with scrolling body
        //  document.querySelectorAll("tr[class*='ms-viewheadertr']");
    };
//
//if (ctx.CurrentItem[ctx.CurrentFieldSchema.Name] === _emptyString)
//    return ["<img ",
//        " src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7' ",
//        " onload={GetAncestor(this,'TR').style.display='none'}",
//        ">"].join(_emptyString);

//endregion development code

//endregion --------------------------------------------------------------------------------------- iCSR.fn
//region iCSR.CSS ------------- CSS operations -----------------------------------------------------### iCSR.CSS
    /*
     resources:
     http://www.cssscript.com/animated-progress-indicators-with-vanilla-javascript-and-css/
     */
    //_$CSS.sheets = {};//TODO: more interactie CSS processing/changes; refactor to new iCSR.CSS.sheet();
    /******************************************************************************************************************
     *
     * @param id
     * @returns {Element}
     */
    _$CSS.appendHEADstyle = function (id) {
        var _styleEl = document.createElement("STYLE");
        _styleEl.id = id; // _styleEl.setAttribute("media", "only screen and (max-width : 1024px)")
        _styleEl.appendChild(document.createTextNode(_emptyString)); // WebKit hack :(
        document.head.appendChild(_styleEl);
        iTrace(2, 'added stylesheet', _styleEl.id);
        return _styleEl;
    };
    /******************************************************************************************************************
     * insert one CSS rule to an existing element
     * @param rule
     * @param _element
     */
    _$CSS.insertRuleinStyleSheet = function (_element, rule) {
        //TODO: _element=_element||this;//to bind(_element)
        if (_element) {
            try {
                _element.sheet.insertRule(rule, 0);
            } catch (e) {
                iTraceWarning(1, 'ignoring CSS definition:', rule);
            }
        } else {
            iCSR.traceerror('Not a STYLE sheet', _element);
        }
    };
    /******************************************************************************************************************
     * append (create) StyleSheet and insert array of Rules
     * @param id - DOM element id
     * @param rules - Array of strings
     */
    _$CSS.addStyleRules = function (id, rules) {
        try {
            var _styleEl = _$getElementById(id); //get existing stylesheet
            if (iCSR.ReloadCSSforeveryItem || !_styleEl) { //attach style only once
                if (iCSR.ReloadCSSforeveryItem && _styleEl) {
                    _$DOM.remove(_styleEl);
                }
                _styleEl = _$CSS.appendHEADstyle(id);
                rules.forEach(function (rule) {
                    _$CSS.insertRuleinStyleSheet(_styleEl, rule);
                });
            }
        }
        catch
            (e) {
            iCSR.catch(e, '_$CSS.addStyleRules', id, rules);
        }
    };

    /******************************************************************************************************************
     * Append CSS from Template config definition to the page
     * @param CSS
     * @param _config
     * @returns {*}
     */
    _$CSS._appendTemplateCSS = function (CSS, _config) {
        var rules = _config.rules || [];
        CSS = CSS || false;

        if (_$isString(CSS)) {//CSS is a reference to a CSS definition in _config.Styles
            CSS = _config.Styles[CSS];
        }
        if (CSS) {
            Object.keys(CSS).forEach(function (key) {
                rules.push(_$Tokens.replace(CSS[key], _config));
            });
            _$CSS.addStyleRules(_config.templateCSSid, rules, true);
            iTrace(2, 'CSS:', CSS);
        } else {
            iCSR.traceerror('Missing CSS _config.Styles:', CSS);
        }
        return CSS;
    };

    _$CSS.listRules = function (_templateCSSid) {
        var _rulesArray = [];
        var _styleEl = _$getElementById(_templateCSSid); //get existing stylesheet
        if (_styleEl) {
            var _rules = _styleEl.sheet.cssRules;
            iTraceWarning("CSS Rules for: ", _templateCSSid);
            Object.keys(_rules).forEach(function (_rulenr) {
                var _rule = _rules[_rulenr];
                console.log(_rulenr, _rule.cssText);
                _rulesArray.push(_rule.cssText);
            });
        } else {
            iTraceWarning("There is no CSS STYLE definition for:", _templateCSSid);
        }
        return _rulesArray;
    };
//endregion --------------------------------------------------------------------------------------- iCSR.CSS
//region iCSR.SP -------------- SharePoint interactions using JSOM / REST --------------------------### iCSR.SP
//TODO: (high) How does this compare with SPUtility https://sputility.codeplex.com/ (last update feb 2015)

    iCSR.SP.SPStatuscount = 0;
    iCSR.SPStatus = function (_text, color, _title, first, _permanent) {
        SP.SOD.executeFunc("sp.js", "SP.ClientContext", function () {
            var _SPUIStatus = SP.UI.Status;
            if (!_text || color === 0) {
                _SPUIStatus.removeAllStatus(true);
            }
            if (_text) {
                var _SPStatusID;
                iCSR.SP.SPStatuscount++;
                if (iCSR.SP.SPStatuscount === 10) {
                    _SPStatusID = _SPUIStatus.addStatus('iCSR', 'Too many errors', false);
                    _SPUIStatus.setStatusPriColor(_SPStatusID, 'red');
                } else if (iCSR.SP.SPStatuscount < 10) {
                    _SPStatusID = _SPUIStatus.addStatus(_title || 'iCSR Demo', _text, first || false);
                    _SPUIStatus.setStatusPriColor(_SPStatusID, color || 'yellow');
                    if (!_permanent) {
                        window.setTimeout(function () {
                            iCSR.SP.SPStatuscount--;
                            _SPUIStatus.removeStatus(_SPStatusID);
                        }, 5000);
                    }
                }

            }
        });
    };
//SOD functions
//https://msdn.microsoft.com/en-us/library/office/ff408081(v=office.14).aspx

    /******************************************************************************************************************
     *
     * @param listID
     * @param ID
     * @param fieldname
     * @param value
     * @param successFunc
     * @param errorFunc
     */
    iCSR.SP.UpdateListItem = function (listID, ID, fieldname, value, successFunc, errorFunc) {
        //TODO: (high) make it work with other (site) context
        //TODO: spinner on save
        var e = event;
        e && e.preventDefault();                                                    // cancel all clicks bubbling up in the done
        e && e.stopPropagation();
        listID = listID || SP.ListOperation.Selection.getSelectedList();                    // use the current list if none declared
        var context = SP.ClientContext.get_current();
        var web = context.get_web();
        var list = web.get_lists().getById(listID);
        var item = list.getItemById(ID);
        context.load(item);
        //todo: value = String(value);//make sure we are writing string values
        item.set_item(fieldname, value);
        item.update();
        successFunc = successFunc || function () {
                iTrace(1, 'success SP.UpdateListItem', ID, fieldname, value);
                iCSR.SP.refreshView();
            };
        errorFunc = errorFunc || function () {
                iCSR.traceerror('Error Updating');
            };
        context.executeQueryAsync(successFunc, errorFunc);
    };
    /**
     *
     * @param element (this)
     * @param ID
     * @param fieldname
     * @param value
     * @constructor
     */
    iCSR.SP.UpdateItem = function (element, ID, fieldname, value) {
        GetAncestor(element, 'TD').style.opacity = '.1';                            // dim the element, will be redrawn after save by SharePoint
        iCSR.SP.UpdateListItem(false, ID, fieldname, value);
    };
    /******************************************************************************************************************
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
                iCSR.SP.refreshView();
            },
            function (s, a) {
                iCSR.traceerror(a.get_message());
            }
        );
    };

    /******************************************************************************************************************
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

    /******************************************************************************************************************
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
        if (ctx) return _$hasProperty(ctx.CurrentItem, ctx.CurrentFieldSchema.Name + '.COUNT.group');
    };

//endregion --------------------------------------------------------------------------------------- iCSR.SP
//region iCSR.Color ----------- Generic Color functions ------------------------------------------- ### iCSR.Color
    /**
     * proces [color] token string "background/color/color", set configuration from it, return background
     * @param _color
     * @returns {*}
     */
    _$Tokens.functions.color = function (_color) {
        var _config = this;
        if (_$isNumber(_color)) _color = _config.colors[_color];
        var _colors = iCSR.Color._getcolorObject(_color, _config.textcolor);            // background: , textcolor: , border:
        _config.combocolor = _color;                                                    // store original 'green/red' color for coloring TR, TD use
        _config.color = _colors.background;                                             // [color] = backgroundcolor
        if (iCSR.tracingcolors)console.info('color1:', _color, _colors, _config.color, _config.textcolor);
        if (_colors.textcolor === 'contrast') {                                         // if explicit request for contrast ( #FAFAFA/contrast ) go get it
            var _contrastcolor = iCSR.Color.contrastcolor(_config.color);                // not using 2nd parameter _element, so this only works for #xxxxx colors!
            if (_contrastcolor) _colors.textcolor = _contrastcolor;
            if (iCSR.tracingcolors)console.info('color:', _colors);
        }
        _config.textcolor = _colors.textcolor;
        if (_colors.textcolor !== 'inherit') {
            if (iCSR.tracingcolors)console.error(_config.output);//TODO check of textcolor is allready in the container
            // extend container definition "background:[color]" to "background:[color];color:[textcolor]"
            _colors.background = _colors.background + ";color:" + _config.textcolor + ";";
        }
        if (iCSR.tracingcolors)console.info('color2:', _color, _colors, _config.color, _config.textcolor);//x
        return _colors.background;                                                      // return (first) color
    };

    /**
     * from string "color1/color2/border" create object: {background:color1 , textcolor:color2 , border:border}
     * @param _string
     * @param _textcolor
     * @returns {{background: *, textcolor: *, border: *}}
     * @private
     */
    iCSR.Color._getcolorObject = function (_string, _textcolor) {
        if (!_$isString(_string)) _string = iCSR.Color._MISSING;    // make sure we are working on strings
        var _colors = _string.split('/');                           // _MISSING: 'beige/red/1px dashed red'
        if (iCSR.tracingcolors)console.error('getcolorObject1', _string, _colors.length, _colors, _textcolor);
        if (_colors[1]) {                                           // if color2 defined
            _textcolor = _colors[1];                                // use that as textcolor
        } else if (!_textcolor) {                                   // if no textcolor at all
            _textcolor = 'inherit';                                 // valid CSS name
        }
        if (iCSR.tracingcolors)console.error('getcolorObject2', _string, _colors.length, _colors, _textcolor);
        return {
            background: _colors[0],     // string
            textcolor: _textcolor,      // strign
            border: _colors[2]          // string or undefined
        };
    };
    /**
     * Get the contrast color, optional _element to get the RGB value from a names HTML color
     * @param _color
     * @param _element
     * @returns {boolean}
     */
    iCSR.Color.contrastcolor = function (_color, _element) {
        var _elementcolor = _color;
        var _contrastcolor = false;
        if (_element && _elementcolor[0] !== '#') {                             // not a #color notation
            _elementcolor = window.getComputedStyle(_element).backgroundColor;  // get RGB value from element
            if (_elementcolor === 'rgb(240, 36, 1)') _elementcolor = '#000';    // correct  msRed color contrast
            if (_elementcolor === 'rgba(0, 0, 0, 0)') {
                if (_color !== 'none' && _color !== 'transparent') {
                    _elementcolor = false; // incorrect conversion detected
                }
            }
        }
        if (_elementcolor) {
            _contrastcolor = iCSR.Color[iCSR.Color.contrast(_elementcolor)];    // contrast returns '_CONTRASTDARK' or '_CONTRASTLIGHT'
            if (iCSR.tracingcolors)console.error('.contrast', _color, _elementcolor, _contrastcolor);
        }
        return _contrastcolor || false;                                                  // no contrast found, then return false
    };
    /******************************************************************************************************************
     * return a (choices) named value color object from a String or Array or Object
     * @returns {*}
     * @param _colorObject
     * @param _choices
     *
     */
    iCSR.Color.extract = function (_colorObject, _choices) {
        _choices = _choices || false;
        if (_choices === 'undefined')_choices = false;
        if (iCSR.tracingcolors)        console.error('extract', _colorObject, _choices);
        if (_$isString(_colorObject) && !_$isUndefined(_colorObject)) {
            //if (_choices !== 'undefined') {
            var _colors = _colorObject.split(',');                  // split "red,green,blue" into array
            if (!_choices) {                          // if no _choices defined
                _colorObject = _colors;                             // return the color Array
            } else {                                                // _choices defined:
                _colorObject = {};                                  // built color object
                for (var n = 0; n < _choices.length; n++) {         // each choice
                    var _choice = _choices[n],
                        _color = _colors[n];                        // gets a color
                    if (!_color) _color = 'beige';                  // if there is no color, default is beige
                    _colorObject[_choice] = _color;                 // set the choicecolor in the object
                }
            }
            //TODO proces _colorObject when it is an Array, check Choices names
        }
        return _colorObject;
    };
    // getColorContrast
    //     Return suggested contrast color (dark or light) for the color (hex/rgba) given.
    //     Takes advantage of YIQ: https://en.wikipedia.org/wiki/YIQ
    //         dark = background is light, use dark colors for text, images, etc..
    //         light = background is dark, use light colors for text, images, etc..
    //     Inspired by: http://24ways.org/2010/calculating-color-contrast/
    //
    // @param color string A valid hex or rgb value, examples:
    //                         #000, #000000, 000, 000000
    //                         rgb(255, 255, 255), rgba(255, 255, 255),
    //                         rgba(255, 255, 255, 1)
    // @return      string dark|light
    iCSR.Color.contrast = function (color) {
        if (color === undefined || color === "") {
            return null;
        }
        var rgbExp = /^rgba?[\s+]?\(\s*(([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5]))\s*,\s*([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\s*,\s*([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\s*,?(?:\s*([\d.]+))?\s*\)?\s*/im,
            hexExp = /^(?:#)|([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/igm,
            rgb = color.match(rgbExp),
            hex = color.match(hexExp),
            r,
            g,
            b,
            yiq;
        if (rgb) {
            r = parseInt(rgb[1], 10);
            g = parseInt(rgb[2], 10);
            b = parseInt(rgb[3], 10);
        } else if (hex) {
            if (hex.length > 1) {
                hex = hex[1];
            } else {
                hex = hex[0];
            }
            if (hex.length === 3) {
                hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
            }
            r = parseInt(hex.substr(0, 2), 16);
            g = parseInt(hex.substr(2, 2), 16);
            b = parseInt(hex.substr(4, 2), 16);
        } else {
            return null;
        }
        yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        //console.info('contrast:', rgb, r, g, b, hex, '=', yiq);
        return (yiq >= 128) ? '_CONTRASTDARK' : '_CONTRASTLIGHT';
    };
    /**
     * color an element with _getColorObject properties
     * @param _element
     * @param _colors
     */
    iCSR.Color.cell = function (_element, _colors) {
        _element.style.backgroundColor = _colors.background;
        _element.style.color = _colors.textcolor;
        if (!_colors.textcolor) _colors.border = '1px dashed red';  // if textcolor is false from a contrastcolor call, mark the cell
        if (_colors.border) _element.style.border = _colors.border;
    };
    /**
     * Color a whole TR row with _getColorObject values
     * @param _element
     * @param _colors
     */
    iCSR.Color.row = function (_element, _colors) {             // Color all elements inside the TR row
        var i, _elements = _element.getElementsByTagName('a');
        for (i = 0; i < _elements.length; i++) {
            _elements[i].style.color = _colors.textcolor;
        }
        _elements = _element.getElementsByTagName('td');        // all cells in the TR
        for (i = 0; i < _elements.length; i++) {
            iCSR.Color.cell(_elements[i], _colors);
        }
    };
//endregion --------------------------------------------------------------------------------------- iCSR.Color
//region iCSR.DOM ------------- Generic DOM functions (SharePoint DOM structure, ids etc.)--------- ### iCSR.DOM
    /**
     * style an element with { key:property } options
     * @param _element
     * @param _options
     */
    iCSR.DOM.style = function (_element, _options) {// TODO: proces _options STRING : "background-color:red,color:blue"
        Object.keys(_options).forEach(function (_key) {                                             // get keys
            var _property = _options[_key];                                                         // get property

            if (_key === 'backgroundColor') {
                var _colors = iCSR.Color._getcolorObject(_property);                                // background: , textcolor: , border:
                _element.style.backgroundColor = _colors.background;                                // set the background color because:
                if (iCSR.tracingcolors)console.info('.style1:', _element.tagName, _colors);
                window.setTimeout(function () {                                                     // we need a short DOM time out so the rgb color can be extracted (converting colorname to rgb)
                    if (iCSR.Color._CONTRAST) {
                        _colors.textcolor = iCSR.Color.contrastcolor(_colors.background, _element); // now get the contrastcolor from _element
                    }
                    if (iCSR.tracingcolors)console.info('.style2:', _element.tagName, _colors);
                    if (_element.tagName === 'TD') {                                                // color TD cell or whole row
                        iCSR.Color.cell(_element, _colors);
                    } else {
                        iCSR.Color.row(_element, _colors);
                    }
                }, 10);
            } else {
                _element.style[_key] = _property;       // set style property
            }
        });
    };
    /******************************************************************************************************************
     * Wait for a DOM elemet to exist in the document
     * @param id
     * @param _callback
     * @param _yieldtime
     */
    _$DOM.wait = function (id, _callback, _yieldtime) {         //  Wait for a DOM element with id to exist, then execute _callback function
        //_yieldtime is not a fix millesonds but decreases by 1 millesecond on every loop, so 1000 milliseconds to start with runs for some time!
        var _element = _$getElementById(id);
        if (_element) {                                         // if the _element exists, execute _callback by putting it at end of the event queue; not using '_callback(element)'
            setTimeout(_callback.bind(null, _element), 0);
        } else {
            if (_yieldtime < 0) {                               // if done waiting then something is wrong
                iCSR.traceerror('_$DOM.wait failed:', id);
            } else {                                            // we're getting less and less patient.. is that element there yet?
                setTimeout(_$DOM.wait.bind(null, id, _callback, _yieldtime - 1), _yieldtime || 100);
            }
        }
    };

    /**
     * Create a DOM element
     * @param _parentelement
     * @param _html
     * @param _elementType
     * @param _className
     * @returns {XML|Node}
     */
    _$DOM.appendHTML = function (_parentelement, _html, _elementType, _className) {
        var _element = document.createElement(_elementType || 'DIV');
        _element.innerHTML = _html;
        _element.className = _className || _emptyString;
        return _parentelement.appendChild(_element);
    };
    /******************************************************************************************************************
     * Delete a DOM element
     * @param _element
     */
    _$DOM.remove = function (_element) {
        if (_$isString(_element)) _element = _$getElementById(_element); // convert string name to proper element
        _element.parentNode.removeChild(_element);
    };

    _$DOM.footer = function (message) {//TODO use for iCSR messaging
        message = message || "Download iCSR.js from iCSR.github.io ► the iCSR.js file you linked to is for demo use only! ( version: " + iCSR._VERSION + " )";
        var demoCSS = ["body::after{color:#FCD500;background:#005AA9;content:'" + message + "';position:fixed;bottom:30px;width:100%;left:0px;font-size:16px;text-align:center;}",
            ".iCSRlogo {position:fixed;bottom:50px;left:30px;width:96px;height:96px;z-index:1}",
            ".helplinks {width:300px}"
        ];
        _$CSS.addStyleRules('iCSR', demoCSS);
        var helplinks = "<h3>Support Links:</h3>";
        helplinks += "<a href='https://github.com/365CSI/iCSR/blob/master/CSR-5-minute-quickstart.md' target='_new'>iCSR Quickstart</a>";
        helplinks += "<br><a href='http://iCSR.github.io' target='_new'>iCSR on GitHub</a>";
        helplinks += "<br><a href='http://davidbau.com/colors/' target='_new'>HTML colornames</a>";
        helplinks = "<div class='helplinks'>" + helplinks + "</div>";
        var html = "<table><tr><td><img src='https://365csi.nl/iCSR/ipcountlogo'></td><td valign='top'>" + helplinks + "</td></tr></table>";//referenced image counts how many request are made
        _$DOM.wait('contentRow', function () {
            _$DOM.appendHTML(document.body, html, 'DIV', 'iCSRlogo');
        }, 50);
    };
//endregion --------------------------------------------------------------------------------------- iCSR.DOM
//region iCSR.Controllers ------------------------------------------------------------------------- ### iCSR.Controllers (OnPostRender)

//region iCSR.Control.table--------------------------------------------------------------------- ### iCSR.Control.table
    /******************************************************************************************************************
     * Usage: in OnPostRender
     * new _$DOM.Control.attachAllOption( 'Colors' );
     *
     * @param fieldname
     * @param allLabel
     */
    iCSR.Control.attachAllOption = function (fieldname, allLabel) {
        allLabel = allLabel || 'All ' + fieldname;
        var self = this,
            allid = "selectAll_" + fieldname,
            allinput = _$getElementById(allid);
        this.elements = document.querySelectorAll('input[id^=' + fieldname + '][id*="MultiChoiceOption"]');
        this.options = [].map.call(this.elements, function (_element) { //make array of DOM node objects
            return _element;
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
        allinput = _$getElementById(allid);
        allinput.addEventListener("click", this.selectall);
    };

    /******************************************************************************************************************
     *  iCSR CONTROL:table - start definition*****************************************************************
     *
     * @param ctx
     */
    iCSR.Control.table = function (ctx) {
        ctx = ctx || window.ctx;
        var tableControl = this;
        tableControl.table = _$getElementById(ctx.clvp.tab.id);
        tableControl.columnNumbers = {};
        tableControl.columns = {};
        tableControl.columnNames = ctx.ListSchema.Field.map(function (field) {
            tableControl.columnNumbers[field.Name] = field.counter;
            tableControl.columns[field.Name] = {
                counter: field.counter,
                hidden: false
            };
            return field.Name;
        });

        function getColumnArray(columns) {
            columns = _$isObject(columns) ? columns : [columns]; //make sure it is an array
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
            //var table = _$getElementById(ctx.clvp.tab.id);
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
    /******************************************************************************************************************
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
                var TR = _$getElementById(GenerateIIDForListItem(ctx, item));
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
        _$getElementById('CSRListViewControlDiv' + ctx.wpq).appendChild(button);
        button.click(); //first init hide duplicates
    };
//endregion

//endregion --------------------------------------------------------------------------------------- iCSR.Control

//region ----- ctx object inspector can be used from the F12 console - type 'ic' in the console ---- ### ctx object inspector
    /******************************************************************************************************************
     * @param _obj
     * @param fieldnames
     */
    iCSR.Object.info = function (_obj, fieldnames) {
        var fields = {};
        _obj.forEach(function (field) {
            var fieldinfo = {};
            (fieldnames || 'nofieldnames').split(',').forEach(function (prop) {
                var _text = field[prop];
                if (prop === 'Name' && iCSR.$hasTemplate(_text, true)) _text += ' ==> iCSR.Me';
                fieldinfo[prop] = _text;
            });
            fields[field.counter] = fieldinfo;
        });
        return fields;
    };
    iCSR.defineProperty = function (_name, _obj, _function) {
        _obj = _obj || window;
        if (!_$hasProperty(_obj, _name)) {
            Object.defineProperty(_obj, String(_name), {
                //configurable: true,
                get: _function
            });
        }
    };
    if (!window.icCTX) {
        Object.defineProperty(window, 'icCTX', {
            //configurable: true,
            get: function () {
                if (ctx) return console.table(iCSR.Object.info(ctx.ListSchema.Field, "DisplayName,Name,RealFieldName,FieldType"));
                return _emptyString;
            }
        });
    }
    if (!window.icTemplates) {
        Object.defineProperty(window, 'icTemplates', {
            //configurable: true,
            get: function () {
                return iCSR._Templates;
            }
        });
    }
    if (!window.cls) {
        Object.defineProperty(window, 'cls', {
            configurable: true,
            get: function () {
                console.clear();
                return _emptyString;
            }
        });
    }
//endregion ---------------------------------------------------------------------------------------- ctx object inspector

//region --- default iCSR _overrides to be used as: SPClientTemplates.TemplateManager.RegisterTemplateOverrides( iCSR._overrides );
    iCSR.overrides = function (_overrides) {
        _overrides = _overrides || {};
        _$Object._ensure_object_key_value(_overrides, 'Templates', {});
        _$Object._ensure_object_key_value(_overrides.Templates, 'Fields', {});

        _overrides.Templates.Fields.Priority = {
            View: iCSR.Me
            //View: iCSR.Me.bind({style:'kpi4',colors:"red,orange,green"})
            //View: iCSR.Me.bind({style:'svgcircle(15)',coalors:"lightcoral,orange,lightgreen"})
        };
        _overrides.Templates.Fields.DueDate = {
            View: iCSR.Me//Planner//.bind({ranges:'lightcoral,-5,pink,-1,orange,0,lightgreen,5,lightgreen'})
        };
        _overrides.Templates.Fields.Status = {
            View: iCSR.Me//.bind({fonatsize: "11px"})
        };
        _overrides.Templates.Fields.PercentComplete = {
            View: iCSR.Me//.bind({barcaolor: '[msBlue]'})
        };
        return _overrides;
    };
//endregion

    if (_$hasProperty(iCSR, '_DEMO')) _$DOM.footer();
    iCSR.init();
    iCSR._RegisterDefaultTemplates();                              // RegisterTemplate: DueDate, Status, PercentComplete, Priority, Planner
    SP.SOD.notifyScriptLoadedAndExecuteWaitingJobs('iCSR');
})
(window, document);