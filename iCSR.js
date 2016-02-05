/******************************************************************************************************************
 * iCSR.js - Office365/SharePoint (CSR) Client Side Rendering JavaScript programming framework/support library
 * http://iCSR.gitbub.io
 * license: MIT
 */
(function (global) {
    global.iCSR = global.iCSR || {};//One Namespace for all iCSR functionality
    var iCSR = global.iCSR;
    window.iCSR = iCSR;//just to be sure, in case iCSR is hosted in another Namespace
    Object.defineProperties(iCSR, {
        _VERSION: {
            value: '1.2', writable: false
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
    function GetAncestor(_element, tagType) {
        while (_element !== null && _element.tagName !== tagType) _element = _element.parentNode;
        return _element;
    }

//endregion --------------------------------------------------------------------------------------- Global Functions
//region iCSR Namespaces -------------------------------------------------------------------------- ### iCSR Namespaces
    /******************************************************************************************************************
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
    iCSR.Object = iCSR.Object || {};                    // Object functions
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
    /******************************************************************************************************************
     * Tracing to the F12 developers console
     * a cleanup, refactor and documentation is on the wish list
     * for now select the region and press ctrl -
     */

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

    iCSR.traceend = function (tracelevel, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15) {
        iCSR.CFG.errorcount++;
        iTrace(tracelevel, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15);
    };
    iCSR.traceerror = function (p1, p2, p3, p4, p5, p6, p7, p8) {
        iCSR.CFG.errorcount++;
        if (console) console.error('%c iCSR ' + p1, 'background:lightcoral;color:black;', p2 || '', p3 || '', p4 || '', p5 || '', p6 || '', p7 || '', p8 || '');
    };
    iCSR.tracewarning = function (p1, p2, p3, p4, p5, p6, p7, p8) {
        var showwarning = true;
        if (typeof p1 === 'number') showwarning = p1 <= iCSR.tracelevel;
        if (console && showwarning) console.warn('%c iCSR:' + p1, 'background:orange;color:brown', p2 || '', p3 || '', p4 || '', p5 || '', p6 || '', p7 || '', p8 || '');
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


    //global reference to trace, makes it easy to comment them all with // so they are deleted in when file is minified
    var iTrace = iCSR.trace;
    var iTraceWarning = iCSR.tracewarning;
    //window.iTrace = iCSR.trace;

//endregion ---------------------------------------------------------------------------------------- ### iCSR.info
//region --- iCSR.RegisterDefaultTemplates -------------------------------------------------------- ### iCSR.RegisterDefaultTemplates
    /******************************************************************************************************************
     * One function to register all default iCSR Template: DueDate, PercentComplete, Priority, Planner
     *
     * for detailed documentation on Templates see github: http://iCSR.github.io
     *
     */
    iCSR.RegisterDefaultTemplates = function () {
//region --- iCSR.ExampleTemplate------------------------------------------------------------------- ### iCSR.ExampleTemplate
        /******************************************************************************************************************
         * Basic iCSR Template explaining the iCSR concepts
         * You can copy paste this RegisterTemplate function in your Cisar or other editor and continue with it
         */
        iCSR.RegisterTemplate('Example', function () { // the name will make the template available as: View:iCSR.iCSRexample
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
        iCSR.RegisterTemplate('Example', function () {
                var example = this;
                example.output = "<div style='background:[color];'>[value]</div>";
            },//function
            {//config
                color: "yellow"
            }//config
        );//RegisterTemplate

//endregion --------------------------------------------------------------------------------------- iCSR.ExampleTemplate
//region --- iCSR.Status --------------------------------------------------------------------------- ### iCSR.Status
        /**
         * Color the default (internal fieldname) Status (Task List) with colors
         */

        iCSR.RegisterTemplate('Status', function () {
                var status = this;
                status.color = status.colors[status.value];
                if (status.value === "Waiting on someone else") status.value = "Waiting";
                status.value = iCSR.Str.nowordbreak(status.value);
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
                interactive: iCSR.CFG.interactive || true,
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
        iCSR.RegisterTemplate('DueDate', function () {
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
                    duedate.output = duedate.style.container;
                } else {
                    duedate.output = duedate.datepicknodate;
                }
            },//function
            {//config
                allowGroupHeader: false,
                allowGridMode: true,
                ranges: '#f55,-21,#f7a,-14,#fab,-7,#fda,0,#cf9,7,#9fa',
                label_nodate: 'No Date',
                label_future: 'days left',
                label_past: 'days past',
                onclick: "onclick='{event.stopPropagation();}'",
                onchange: "onchange=\"iCSR.SP.UpdateItem(this,'[ID]','[Name]',new Date(this.value))\" ",
                textcolor: 'inherit',
                width: "150px",
                interactive: iCSR.CFG.interactive || false,
                datepicker_chrome: "[absdays] [label] <input type='date' min='2000-12-31' [onclick] [onchange] value='[datepickervalue]' style='background-color:[color]'>",
                //interactive for non Chrome browser
                onclickSubtract: "onclick=\"iCSR.SP.UpdateItem(this,'[ID]','[Name]',iCSR.Date.add('[value]',-1))\" ",
                onclickAdd: "onclick=\"iCSR.SP.UpdateItem(this,'[ID]','[Name]',iCSR.Date.add('[value]',1))\" ",
                nextday: "next day",
                previousday: "previous day",
                setpreviousday: "<DIV class='[divClass]update [divClass]yesterday' [onclickSubtract]> [previousday] </DIV>",
                setnextday: "<DIV class='[divClass]update [divClass]tomorrow' [onclickAdd]> [nextday] </DIV>",
                datepicker: "<DIV class='iCSRdatepicker'>[setpreviousday] [setnextday]</DIV>",
                datepicknodate: "<div onclick=\"iCSR.SP.UpdateItem(this,'[ID]','[Name]',iCSR.Date.add(false,0))\" >[label_nodate]</div>",
                //non-interactive
                input: "<DIV class='iCSRdaycount'>[absdays] [label]</DIV><DIV class='iCSRdate'>[value]</DIV>[datepicker]",
                divClass: 'iCSR_DueDate_Container',
                Styles: {
                    default: {
                        container: "<div class='[divClass]' style='background-color:[color]'>[input][colorTR]</div>",
                        CSS: {
                            container: ".[divClass] {width:[width];color:[textcolor];height:[height];padding:-2px 2px 0px 2px;}",
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
        /**
         * color the (1) High, (2) Medium (3) Low by color
         * should be localized safe because it extracts the CurrentFieldSchemaChoices (this is done in the default getconfig)
         */
//noinspection BadExpressionStatementJS,HtmlUnknownTarget
        /** IDE ignore definitions in String (escaped double quotes to keep onclick working and img src references which IDE can't recognize*/
        iCSR.RegisterTemplate('Priority', function () {
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
                if (htmlparts[currentchoice].indexOf('onclick') > -1) {        // is there on onclick handler
                    prio.choices = htmlparts;
                } else {
                    prio.choices = htmlparts[currentchoice];
                }
                prio.output = prio.style.container;
            },//function
            {//config
                colors: "[msRed],[msYellow],[msGreen]",//Microsoft colors
                interactive: iCSR.CFG.interactive || true,
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
                        item: "<div class=\"[classname]\" style=\"background-color:[color]\" onclick=\"[click]\">[label]</div>",
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
//endregion iCSR.Priority -------------------------------------------------------------------------- ### iCSR.Priority
//region --- iCSR.PercentComplete ------------------------------------------------------------------ ### iCSR.PercentComplete
        //noinspection HtmlUnknownAttribute
        /**
         * show a percentage bar
         * 3 available predefined Styles:
         *                              default
         *                              progress (HTML5 Progress)
         *                              range (slider)
         */
        iCSR.RegisterTemplate('PercentComplete', function () {
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
                            container: ".[divClass] {width:[width];height:[height];position:relative;background-color:[background]}",
                            scale: ".[divClass] {font-family:arial;font-size:11px;color:[scalecolor]}",
                            bar: ".[divClass]>div {position:absolute;text-align:right;font-size:[scalesize];height:100%;}",
                            barscale: ".[divClass]>div {border-right:1px solid #aaa;}",
                            hover: ".[divClass]>div:not(.currentProgress):hover{color:[colorhover];font-size:100%;background:[barcolorhover];z-index:4;cursor:pointer;opacity:.8}",
                            hoverbefore: ".[divClass]>div:not(.currentProgress):hover:before{content:'►';font-weight:bold}",
                            currentpercent: ".[divClass]>div:hover:after,.[divClass] .currentProgress:after{content:'%'}",
                            current: ".[divClass] .currentProgress{font-size:100%;z-index:3}",
                            barcolor: ".[divClass] .currentProgress{background-color:[barcolor];color:[color];[CSSinset]}",
                            reset: ".[divClass] .resetProgress{z-index:3;width:10%;height:[height];overflow:hidden;border-right:0px;color:transparent;padding:0 3px}",
                            resethover: ".[divClass] .resetProgress:hover{width:auto}"
                        }
                    },
                    progress: {
                        container: "<div style='white-space:nowrap'><progress class='[divClass]' value='[valuenr]' max='100'></progress> [value]</div>",
                        CSS: {
                            container: ".[divClass] {height:[height];background-color:[background];color:[barcolor]}",
                            bar: ".[divClass]::-webkit-progress-value {background-color:[barcolor];[CSSinset]}",
                            inset: ".[divClass]::-webkit-progress-bar {background-color:[background];[CSSinset]}",
                            animwk: "@-webkit-keyframes animate-stripes {100% {background-position: -100px 0px;}}",
                            anim: "@keyframes animate-stripes {100% {background-position: -200px 0px;}}",
                            animation1: ".[divClass]::-webkit-progress-bar {-webkit-animation: animate-stripes 5s linear infinite;}",
                            animation2: ".[divClass]::-webkit-progress-bar {animation: animate-stripes 5s linear infinite;}"
                        }
                    },
                    range: {
                        container: "<div style='white-space:nowrap;background:[rangecolor];height:[rangeheight];margin-top:-5px'><input id='[id]' type='range' [oninput] [onchange] min='0' value='[valuenr]' max='100' step=10>[rangelabel]</div>",
                        CSS: {
                            container: ".[divClass] {height:[height];background-color:[background]}",
                            inset: ".[divClass]::-webkit-progress-bar {background-color:#eee;border-radius:2px;box-shadow: 0 2px 5px rgba(0, 0, 0, 0.25) inset;}",
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

        iCSR.RegisterTemplate('Planner', function () {
                var planner = this;
                if (!planner.hasOwnProperty('Status')) planner.Status = 'Not Started';
                if (planner.Status === planner.states[0]) {
                    planner.state = 0;                                          // Not Started
                } else if (planner.Status === planner.states[3]) {
                    planner.state = 3;                                          // Late
                } else if (planner.days < 0) {
                    planner.state = 1;                                          // Completed
                } else {
                    planner.state = 2;                                          // In progress
                }
                planner.color = planner.colors[planner.state];
                planner.textcolor = planner.textcolors[planner.state];
                planner.output = "<div style='background:[color];color:[textcolor];padding:0 2px'>[label][ic]</div>";
            },//function
            {//config
                required: ['Status'],
                colors: iCSR.CFG.color.msYellowRedBlueGreen,                    // Microsoft colors: yellow,red,blue,green
                textcolors: ['slate', 'lightgrey', 'slate', 'slate'],           // softer textcolor for 4 background colors
                states: ['Not Started', 'Late', 'In progress', 'Completed']     // default states on Task List (Not Started and Completed MUST match localized Choice values)
            }//config
        );//RegisterTemplate
//endregion --------------------------------------------------------------------------------------- iCSR.Planner

    }
    ;//iCSR.RegisterDefaultTemplates
//endregion --------------------------------------------------------------------------------------- iCSR.RegisterDefaultTemplates
//region iCSR.TemplateManager - register CSR Templates with function and configurations------------ ### iCSR.TemplateManager
    /******************************************************************************************************************
     * Code level: ADVANCED
     *
     * Manages all iCSR Templates
     *
     */

    iCSR.TemplateManager = iCSR.TemplateManager || {};              // TemplateManager Namespace, functions defined in here are public
    /**
     * Create a new iCSR Template
     * @param _templateIDname
     * @param _templatefunction
     * @param _templateconfig
     * @constructor
     */
    iCSR.TemplateManager.CreateTemplate = function (_templateIDname, _templatefunction, _templateconfig) {
        iTraceWarning('Created iCSR Template: iCSR.' + _templateIDname);
        _templateconfig.templateid = _templateIDname;
        _templateconfig.templateCSSid = 'CSS_' + _templateIDname;
        iCSR[_templateIDname] = function (ctx) {                        // create a named function in the global iCSR object
            if (ctx && ctx.hasOwnProperty('CurrentFieldSchema')) {
                iTrace(2, 'Executing iCSR.' + _templateIDname);
                var config = iCSR.fn.get_configTemplate(ctx, _templateconfig, this); // built one NEW config object from the 3 sources,'this is 'iCSR.Me.bind({OBJECT}) OR ctx.CurrentFieldSchema
                config.id = config.templateid + '_' + config.ID;
                if (ctx && ctx.inGridMode && !config.allowGridMode) {
                    ctx.ListSchema.Field.AllowGridEditing = false;
                    return config.value;
                }
                if (iCSR.SP.isGroupHeader(ctx) && config.allowGroupHeader) {
                    return config.value;
                }
                if (config.disabled) {
                    console.error('disabled', this);
                    return config.value;
                }
                iCSR.fn.set_configTemplate(config);                         // extract the template from the config settings
                iCSR.CSS.appendTemplateCSS(config.style.CSS, config);       // inject all the CSS for this template into the current page
                iCSR.TemplateManager.injectconfigTemplateFunctions(config); // attach with bound scope: setcolor() , $replacetokens()
                iCSR[_templateIDname].executeTemplate.call(config, ctx);    // ==> execute the actual template function
                iCSR.TemplateManager.validateTemplate(config);              // validate output
                iCSR.TemplateManager.validateTemplateoutput(config);
                return config.output;                                       // return the HTML back to SharePoint CSR calling code
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
            if (ctx && ctx.hasOwnProperty('CurrentFieldSchema')) {                              // called from a SharePoint Template?
                var _fieldtype = ctx.CurrentFieldSchema.FieldType;
                var _fieldname = ctx.CurrentFieldSchema.RealFieldName;                          // get the fieldname eg: Priority
                //console.log(_fieldname,'\ttype:\t',_fieldtype ,ctx.CurrentFieldSchema);
                if (iCSR.$hasTemplate(_fieldname)) {                                            // if there is a: iCSR.Priority function
                    return iCSR[_fieldname].call(this, ctx);                                    // call the function, 'this' can be the .bind() scope
                }
                var warning = 'No Template for: iCSR.' + _fieldname;
                iTraceWarning(warning, '(' + _fieldtype + ')');
                iCSR.SPStatus(warning, 'yellow', 'iCSR:', false, true);
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
            console.error(e);
            iCSR.SPStatus(e.message, 'red', 'iCSR error:', false, true);
        }
    };
    /**
     * todo: fix disabling of Templates
     * @param _templateIDnames
     * @param _disabledstate
     */
    iCSR.disable = function (_templateIDnames, _disabledstate) {
        if (typeof _templateIDnames === 'string') _templateIDnames = [_templateIDnames];
        _templateIDnames.forEach(function (_templateIDname) {
            if (iCSR.$hasTemplate(_templateIDname)) {
                iCSR[_templateIDname].configuration.disabled = _disabledstate;
            }
        });
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
    iCSR.TemplateManager.RegisterFunction = function (_templateIDname, _templatefunction) {
        var _prefix = 'New ';
        if (iCSR.$hasTemplate(_templateIDname, true)) {                 // silent check for function existence in iCSR scope
            _prefix = '';
        }
        iTrace(1, _prefix + 'RegisterFunction', _templateIDname);
        iCSR[_templateIDname].executeTemplate = _templatefunction;      // create a function reference so it can be executed inside the Template function
    };
    iCSR.RegisterFunction = iCSR.TemplateManager.RegisterFunction;      // shortcut

    /******************************************************************************************************************
     * Main function to Register one iCSR Template
     * @param _templateIDname
     * @param _templatefunction
     * @param _templateconfig
     * @constructor
     */
    iCSR.TemplateManager.RegisterTemplate = function (_templateIDname, _templatefunction, _templateconfig) {
        _templateIDname = iCSR.TemplateManager.validateTemplateName(_templateIDname);           //validate input
        _templatefunction = iCSR.TemplateManager.validateTemplateFunction(_templatefunction);   //validate input
        _templateconfig = iCSR.TemplateManager.validateTemplateConfiguration(_templateconfig);  //validate input
        iTrace(0, 'iCSR.TemplateManager.RegisterTemplate', _templateIDname, '\n_templateconfig:', _templateconfig);
        if (!iCSR.$hasTemplate(_templateIDname, true)) {
            iCSR.TemplateManager.CreateTemplate(_templateIDname, _templatefunction, _templateconfig);
            iCSR[_templateIDname].configuration = _templateconfig;          // extra property on this function itself so the ViewConfiguration can get to it
        }
        iCSR.TemplateManager.RegisterFunction(_templateIDname, _templatefunction, _templateconfig);

        iCSR[_templateIDname].$style = function () {//_configKey, _value) {
            var config = iCSR[_templateIDname].configuration;                   // pointer to configuration because 'this' points to the function itself
            iCSR.Object.listinconsole(config.Styles, config.templateid + ' Styles');
        };
        iCSR[_templateIDname].$CSS = function () {//_configKey, _value) {
            var config = iCSR[_templateIDname].configuration;                   // pointer to configuration because 'this' points to the function itself
            iCSR.CSS.listRules(config.templateCSSid);
        };
        iCSR[_templateIDname].$config = function (_configKey, _value) {
            var _title = 'iCSR.' + _templateIDname;
            var config = iCSR[_templateIDname].configuration;                   // pointer to configuration because 'this' points to the function itself
            var _listconfig = false;
            if (typeof _configKey === 'undefined') {
                _listconfig = true;
                _value = config;
            } else {
                _value = iCSR.Object.gettersetter(config, _configKey, _value);
                _listconfig = (typeof _value === 'undefined');
            }
            if (_listconfig) {
                iCSR.Object.listinconsole(config, _title);
                if (_configKey) iTraceWarning('Missing configuration key, you used: ' + _title + '.$config', '(', _configKey, ',', _value, ')');
            }
            return _value;
        };
    };
    iCSR.RegisterTemplate = iCSR.TemplateManager.RegisterTemplate;      // shorthand for use in CSR files
    /**
     *
     * @param _templateIDname
     * @param _silent
     * @returns {boolean}
     */
    iCSR.TemplateManager.hasTemplate = function (_templateIDname, _silent) {
        var _hasTemplate = iCSR.hasOwnProperty(_templateIDname);
        if (!_hasTemplate && !_silent) {
            iTraceWarning('There is no Template:', _templateIDname);
        }
        return _hasTemplate;
    };
    iCSR.$hasTemplate = iCSR.TemplateManager.hasTemplate;

    /**
     * return an allowed templateIDname
     * @param _templateIDname
     * @returns {*}
     */
    iCSR.TemplateManager.validateTemplateName = function (_templateIDname) {
        return _templateIDname;
    };
    iCSR.TemplateManager.validateTemplateFunction = function (_templatefunction) {
        return _templatefunction;
    };
    iCSR.TemplateManager.validateTemplate = function (config) {
        if (!config)console.error('config\n', config);
        return true;
    };
    iCSR.TemplateManager.validateTemplateoutput = function (config) {
        if (config.output) {
            config.output = config.$replacetokens(config.output);// proces the HTML one more time for tokens
            iTrace(1, config.templateid, 'output HTML:\n\t', config.output);
        } else {
            iCSR.traceerror(config.templateid + ' template has no output\n', config);
            config.output = config.value;
        }
    };
    iCSR.TemplateManager.injectconfigTemplateFunctions = function (config) {
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
        /**
         * The config object inside the Template gets a method/function with a bound scope
         * that way the function is available inside the template AND works on its OWN configuration
         * @type {function(this:*)}
         */
        config.$replacetokens = iCSR.Tokens.replace.bind(config);    // define a bound function so Tokens.replace executes on config without the need for passing it as parameter
    };
    /**
     * Default configuration for all Templates, major [tokens] are declared here, thus available for every Template a user creates
     * @param _templateconfig
     * @returns {*|{divClass: string}}
     */
    iCSR.TemplateManager.validateTemplateConfiguration = function (_templateconfig) {
        _templateconfig = _templateconfig || {                  // default config if no config with RegisterTemplate
                divClass: '[templateid]'
            };
        if (!_templateconfig.hasOwnProperty('Styles')) {     // default template if no template with RegisterTemplate
            _templateconfig.Styles = {
                default: {
                    container: "<div class='[divClass]' style='background:[color];color:[textcolor]'>&nbsp;[value]&nbsp;</div>",
                    CSS: {
                        container: ".[divClass] {}"//Backgroundcolored Status label - default for all custom additions
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
        // use the base64 encoded image by default, this causes NO network call
        _templateconfig.blankIMG = "img src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7' ";
        //noinspection HtmlUnknownAttribute
        _templateconfig.colorTD = "<[blankIMG] onload={GetAncestor(this,'TD').style.backgroundColor='[color]'}>";
        _templateconfig.colorTR = "<[blankIMG] onload={GetAncestor(this,'TR').style.backgroundColor='[color]'}>";

        _templateconfig.output = _templateconfig.Styles.default.container;      // default output for all Templates, so a Template works without output being declared
        return _templateconfig;
    };
//endregion --------------------------------------------------------------------------------------- iCSR TemplateManager
//region iCSR.Init -------------------------------------------------------------------------------- ### iCSR.init
    /******************************************************************************************************************
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
     * iCSR.Tokens.replace( '[location]!' );   ==>  'Hello World!'                                   *
     *                                                                                               *
     * Known issues:  FIXED! WITH VERSION 1.5 RECURSIVE REPLACE FUNCTION
     * Nested [[token]] does not work, creates '[token',']' array                                    *
     *                                                                                               *
     * */
    iCSR.Tokens.functions = {};
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
            iTraceWarning('iCSR.Tokens.StringToTokenArray with: ', _tokenstring);
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
    iCSR.Tokens.replacetoken = function (_tokenstring, _tokenconfig, _islasttoken) {
        var _tokenized = _tokenstring;
        if (_tokenized !== '' && _tokenized !== "." && _tokenized !== "iCSR") {//allways ignore these tokens
            if (_tokenconfig.hasOwnProperty(_tokenstring)) {
                _tokenized = _tokenconfig[_tokenstring]; // predefined tokens defined in .config object take precedence over token
                if (typeof _tokenized === 'function') {
                    //TODO: (normal) ?? do we want to allow script creation... cool to investigate how far this would lead
                }
                if (typeof _tokenized === 'object') {
                    if (Array.isArray(_tokenized)) {                        // Arrays are (most likely) a result from an HTML building function
                        _tokenized = _tokenized.join('');                   // So return them as string
                    } else {
                        iTrace(0, 'tokenobject:', _tokenstring, _tokenized);
                        iCSR.SP.showobjectsinstatus(_tokenized);
                        //TODO: (normal) ?? do we want to allow script creation... cool to investigate how far this would lead
                    }
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
                    if (strippedtoken === _tokenstring && _islasttoken) {//token is not declared yet
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
    /******************************************************************************************************************
     * replace 'Hello [location]!' with propertyvalue from _tokenconfig {location:'World'}  => 'Hello World!'
     * The functions loops to de-token any nested token definitions eg: location="from [countryname]"
     *
     * @param _string
     * @param _tokenconfig
     * @returns {*}
     */
    iCSR.Tokens.recursivereplace = function (_string, _tokenconfig) {
        var recursecount = 0;//safe guard against endless loops

        function recursivereplacetokens(str) {
            recursecount++;
            if (recursecount > 50) return "stop";
            for (var i = 0; i < str.length; i++) {
                var char = str[i];
                var _token = str.substr(0, i);
                var remainder = str.slice(i + 1);
                var escape = str[i - 1] === '\\';//todo: fix some patterns that don't escape well: blue[red]green][color]
                if (escape) {
                    str = _token.slice(0, i - 1) + char + remainder;
                    char = false;
                }
                if (!escape && char === "]") {
                    var _replacedtoken = '';
                    if (_token === '?') {
                        if (_tokenconfig.templateid) {
                            iCSR.Object.listinconsole(_tokenconfig, 'Available tokens for: ' + _tokenconfig.templateid);
                        }
                    } else {
                        _replacedtoken = iCSR.Tokens.replacetoken(_token, _tokenconfig, false);  // _islasttoken=false
                    }
                    if (_replacedtoken === _token) {//nothing changed
                        str = _token + remainder;
                    } else {
                        return recursivereplacetokens(_replacedtoken + remainder);
                    }
                }
                if (char === "[") {
                    var replacer = recursivereplacetokens(remainder);
                    str = _token + replacer;
                }
            }
            return str;
        }

        return recursivereplacetokens(_string);
    };
    iCSR.Tokens.replace = function (_string, _tokenconfig) {
        if (!_string) {
            iTraceWarning('empty _string in Token replace:', _string);
            return _string;
        }
        if (typeof _string === 'string') {
            _tokenconfig = _tokenconfig || this;                                // tokens defined in optional .bind(config) for each Template function

            var recursivereplace = true;
            //new v1.5 [token] replace code using recursion, the old code could not handle: blue[[colorname]]green
            if (recursivereplace) {
                return iCSR.Tokens.recursivereplace(_string, _tokenconfig);
            }

            //old [token] replace code using a loop
            var _tokenArray;                                                    // working array breaking string into tokens
            var tokencount = 1;                                                 // count how many tokens are in the array,
            var loop;                                                           // to break out of the loop when all work is done
            for (loop = 0; loop < 10; loop++) {                                 // too lazy to develop recursive code
                _tokenArray = iCSR.Tokens.StringToTokenArray(_string, '[]');    // make array of string 'Hello [location]' => ['Hello ','location']
                var _tokenCount = _tokenArray.length;
                var _multipleTokens = _tokenCount > 1;
                var _onevalidToken = _tokenCount === 1 && (_tokenArray[0].length < 15);//Todo: cleanup
                if (_multipleTokens || _onevalidToken) {
                    _tokenArray = _tokenArray.map(function (token) {
                        var _replacedtoken = token;
                        if (token === '?') {
                            if (_tokenconfig.templateid) {
                                iCSR.Object.listinconsole(_tokenconfig, 'Available tokens for: ' + _tokenconfig.templateid);
                            }
                            _replacedtoken = '';
                        } else {
                            _replacedtoken = iCSR.Tokens.replacetoken(token, _tokenconfig, _tokenArray.length === 1);
                        }
                        return _replacedtoken;
                    });// jshint ignore:line
                }
                _string = _tokenArray.join('');//make it one string again
                if (_tokenArray.length === tokencount) break;//exit loop if no more tokens need to be replaced
                tokencount = _tokenArray.length;
            }
            iTrace(3, 'iCSR.Tokens.replace', '(' + typeof _string + ') _tokenArray in ', loop, 'iterations', {
                "string": _string,
                "array": _tokenArray
            });
        }
        return _string;
    };
    /******************************************************************************************************************
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
    /******************************************************************************************************************
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
    /******************************************************************************************************************
     * [Tokens] can execute (predefined) functions
     * example: [svgcircle(20)] returns the HTML/SVG code for a circle
     * results must be strings
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
                if (typeof tokenfunction !== 'string') {
                    iCSR.traceerror('Token function must return a String, called:', _functionname, _parameters);
                }
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
    /******************************************************************************************************************
     * Code level: MEDIUM
     *
     * Generic string functions
     *
     */
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
    /******************************************************************************************************************
     * Code level: MEDIUM
     *
     * Generic Date functions (saves from using momentJS
     *
     */

    /******************************************************************************************************************
     * Returns a property array
     * @param date
     * @returns {{yyyy: number, MM: number, dd: number, hh: number, mm: number, ss: number}}
     */
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
    /******************************************************************************************************************
     * Adds/substracts days from a given date (ignores time value)
     * @param date
     * @param numberOfDays
     * @param numberOfMonths
     * @param numberOfYears
     * @returns {Date}
     */
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
    /******************************************************************************************************************
     * Formats a date as string: iCSR.Date.format( new Date() , "yyyy-MM-dd" )  =>  "2016-2-1"
     *
     * TODO dates/months need leading zeros
     *
     * @param date
     * @param datestring
     * @returns {*|string}
     */
    iCSR.Date.format = function (date, datestring) {
        var isSP = true;
        datestring = datestring || "yyyy-MM-dd";
        date = date || new Date();                                          // today
        if (isSP) {
            return String.format("{0:" + datestring + "}", date);           // use SharePoint default function if it exists
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
    /**
     *
     */
    iCSR.Date.daysDifference = function (_date, _seconddate) {
        var _Date = new Date(_date);                                        // make sure strings are converted to a Date value
        if (_Date instanceof Date && !isNaN(_Date.valueOf())) {             // is it a valid Date?
            if (!_seconddate) _seconddate = new Date();                     // Today
            return GetDaysAfterToday(_Date, _seconddate);
        }
        iTrace(4, 'Incorrect Date conversion from:', _date);
        return false;                                                       // return false for incorrect dates
    };

//endregion --------------------------------------------------------------------------------------- iCSR.Date
//region iCSR.Array ----------- Array utility functions --------------------------------------------### iCSR.Array
    iCSR.Array = iCSR.Array || {};
    /**
     * Make sure everything is an Array (covert strings to Array)
     * @param _array
     * @param _separator
     * @returns {*}
     */
    iCSR.Array.ensure = function (_array, _separator) {
        _separator = _separator || ',';
        if (typeof _array === 'string') {
            if (_array === '') return [];               // return empty array for empty string
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

    iCSR.Object = {
        isFunction: function (obj) {
            return obj !== null && typeof obj === "function";
        },
        isArray: function (obj) {
            //noinspection JSTypeOfValues
            return obj !== null && typeof obj === "array"; // jshint ignore:line
        },
        isWindow: function (obj) {
            return obj !== null && obj === obj.window;
        },
        isNumeric: function (obj) {
            return !isNaN(parseFloat(obj)) && isFinite(obj);
        },
        type: function (obj) {
            if (obj === null) {
                return String(obj);
            }
            return typeof obj;
        },
        isPlainObject: function (obj) {
            // Must be an Object.
            // Because of IE, we also have to check the presence of the constructor property.
            // Make sure that DOM nodes and window objects don't pass through, as well
            if (!obj || iCSR.Object.type(obj) !== "object" || obj.nodeType || iCSR.Object.isWindow(obj)) {
                return false;
            }
            try {
                // Not own constructor property must be Object
                if (obj.constructor) {
                    return false;
                }
            } catch (e) {
                // IE8,9 Will throw exceptions on certain host objects #9897
                return false;
            }
            // Own properties are enumerated firstly, so to speed up,
            // if last one is own, then all properties are own.
            var key;
            for (key in obj) {
            }
            return key === undefined;
        },
        isEmptyObject: function (obj) {
            return Object.keys(obj).lenght <= 0;
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
            if (typeof target !== "object" && !iCSR.Object.isFunction(target)) {     // Handle case when target is a string or something (possible in deep copy)
                target = {};
            }
            if (length === i) {                                                 // extend iCSR.Object itself if only one argument is passed
                target = this;
                --i;
            }
            for (; i < length; i++) {
                if (( options = arguments[i] ) !== null) {                       // Only deal with non-null/undefined values
                    for (name in options) {                                     // Extend the base object
                        if (options.hasOwnProperty(name)) {
                            src = target[name];
                            copy = options[name];
                            if (target === copy) {                                  // Prevent never-ending loop
                                continue;
                            }
                            // Recurse if we're merging plain objects or arrays
                            if (deep && copy && ( iCSR.Object.isPlainObject(copy) || ( copyIsArray = iCSR.Object.isArray(copy) ) )) {
                                if (copyIsArray) {
                                    copyIsArray = false;
                                    clone = src && iCSR.Object.isArray(src) ? src : [];
                                } else {
                                    clone = src && iCSR.Object.isPlainObject(src) ? src : {};
                                }
                                target[name] = iCSR.Object.extend(deep, clone, copy);// Never move original objects, clone them
                            } else if (copy !== undefined) {                        // Don't bring in undefined values
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
    iCSR.Object.extendbyname = function (_objdestination, _objsource, _keys) {
        _keys = _keys || Object.keys(_objsource);
        _keys = iCSR.Array.ensure(_keys);
        var _newsource = {};
        _keys.forEach(function (_key) {
            if (_objsource.hasOwnProperty(_key)) {
                _newsource[_key] = _objsource[_key];
            } else {
                _newsource[_key] = "undefined";
                iTraceWarning(1, 'Missing:', _key, ' in:', _objsource);
            }
        });
        iCSR.Object.extend(_objdestination, _newsource);
    };
    /**
     * generic getter/setter function for Objects
     * @param _obj
     * @param _configKey
     * @param _value
     * @returns {*}
     */
    iCSR.Object.gettersetter = function (_obj, _configKey, _value) {
        var _current = _obj[_configKey];
        if (typeof _value === 'undefined') {
            return _current;
        }
        if (_obj.hasOwnProperty(_configKey)) {
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
    iCSR.Object.ensure = function (_obj, _key, _defaultvalue) {
        if (_obj.hasOwnProperty(_key)) {
            _defaultvalue = _obj[_key];
        } else {
            _obj[_key] = _defaultvalue;
        }
        return _defaultvalue;
    };
    /**
     * List all obj keys and values in the console
     * @param obj
     * @param _title
     * @param _footer
     */
    iCSR.Object.listinconsole = function (obj, _title, _footer) {
        if (obj) {
            _footer = _footer || _title;
            iTraceWarning('Object Inspector:', _title || '');
            if (iCSR.Object.isEmptyObject(obj)) {
                iTraceWarning('Empty object');
            } else {
                Object.keys(obj).forEach(function (key, nr) {
                    console.log(nr, key, obj[key]);
                });
            }
            iTraceWarning('Object Inspector:', _footer || '');
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
    /******************************************************************************************************************
     * return a (choices) named value color object from a String or Array or Object
     * @returns {*}
     * @param _colorObject
     * @param _choices
     */
    iCSR.fn.extractcolors = function (_colorObject, _choices) {
        if (typeof _colorObject === 'string') {
            if (_colorObject.indexOf('[') > -1) _colorObject = iCSR.Tokens.replace(_colorObject, iCSR.CFG.color);
            var colors = _colorObject.split(',');
            if (_choices) {
                _colorObject = {};
                for (var n = 0; n < _choices.length; n++) {
                    var choice = _choices[n];
                    var color = colors[n];
                    if (!color) color = 'beige';//default color value
                    _colorObject[choice] = color;
                }
            } else {
                _colorObject = colors;
            }
            //TODO proces _colorObject when it is an Array, check Choices names
        }
        return _colorObject;
    };
    /**
     * sets config values based on the FieldType
     * @param ctx
     * @param config
     */
    iCSR.fn.get_configFrom_FieldType = function (ctx, config) { //  config is reference to the config object, so no need for return statements
        if (config.FieldType === 'DateTime') {
            var _Date = new Date(config.value);
            config.days = iCSR.Date.daysDifference(config.value);                             // SharePoint function
            config.datepickervalue = iCSR.Date.format(_Date, 'yyyy-MM-dd');     // yyyy-MM-dd format for HTML5 datepickers
            config.absdays = Math.abs(config.days);                             // -2 to 2
            if (isNaN(config.days)) {                                           // if days was not a Number, reset values
                config.days = false;
                config.absdays = false;
            }
        }
    };
    /**
     * Extract config properties from ctx object (including: CurrentItem, CurrentFieldSchema
     * @param ctx
     * @param config
     */
    iCSR.fn.get_configFrom_ctx = function (ctx, config) { //  config is reference to the config object, so no need for return statements
        if (ctx) {//SharePoint specific configuration
            iCSR.Object.extendbyname(config, ctx.CurrentFieldSchema, "Name,DisplayName,RealFieldName,FieldType,counter,Choices");
            iCSR.Object.extendbyname(config, ctx.CurrentItem, "outlineLevel,ContentType,ContentTypeId,Created,Modified,ID,PermMask,Title,DueDate,PercentComplete,Priority");

            config.ID = ctx.CurrentItem.ID;
            config.iid = GenerateIID(ctx);
            if (ctx.CurrentItem.hasOwnProperty(config.Name)) {
                config.value = ctx.CurrentItem[config.Name];
            } else {
                config.value = ctx.CurrentItem[config.RealFieldName];
            }
            config.itemid = 'iCSR_' + ctx.wpq + '_' + config.ID;
            config.daysCreated = iCSR.Date.daysDifference(ctx.Created);
            config.daysModified = iCSR.Date.daysDifference(ctx.Modified);
        } else {
            config.ID = 'no ctx';
            config.iid = false;
            config.value = 'no ctx value';
        }
    };
    /***********************************************************************************************
     * Builts the whole configuration Object for a Template
     * from:
     *                              1 - iCSR default configuration
     *                              2 - Template configuration
     *                              3 - .bind() configuration
     *                              4 - ctx object
     * @param ctx
     * @param initialconfig
     * @param bindconfig
     * @returns {{}}
     */
    iCSR.fn.get_configTemplate = function (ctx, initialconfig, bindconfig) {
        var config = {                                                                              // default value at beginning of Object so they are displayed first
            templateid: '',
            ID: 0,
            Name: 'none',
            value: false,
            valuenr: false,
            label: false,
            shortlabel: false,
            id: 0,
            itemid: 'none',
            color: 'pink',
            textcolor: 'red',
            colors: '',
            iCSRdesciption: 'All values below are configured by default, the Template or come from a .bind({}) declaration'
        };
        try {
            bindconfig = bindconfig.hasOwnProperty('FieldType') ? {} : bindconfig;                  // if scope is the ctx object create a empty object
            bindconfig.trace > 0 ? iCSR.traceon(bindconfig.trace) : iCSR.traceoff(iCSR.tracelevel); // turn on tracelevel if defined in Template config
            config.iCSRdescription_templateconfig = 'configuration from RegisterTemplate:';
            iCSR.Object.extend(config, initialconfig);                                              // merge all objects into config object
            config.iCSRdescription_bindconfig = 'configuration add from .bind({}):';
            iCSR.Object.extend(config, bindconfig);                                                 // merge all objects into config object
            if (iCSR.hasOwnProperty('Interactive')) {                                               // global configuration options overruling config
                config.interactive = iCSR.Interactive;
            }
            config.iCSRdescription_ctx = 'configuration from SharePoint ctx global object:';
            iCSR.fn.get_configFrom_ctx(ctx, config);
            config.valuenr = Number(iCSR.Str.toNumber(config.value, false));
            config.shortlabel = config.valuenr ? iCSR.Str.label(config.value) : config.value; //if a valuenr then shorten it
            config.label = config.shortlabel;//todo replace shortlabel with label token
            config.nonbreaklabel = iCSR.Str.nowordbreak(config.shortlabel);
            config.emptystring = config.value === '';
            config.iCSRdescription_FieldType = 'configuration from SharePoint FieldType:';
            iCSR.fn.get_configFrom_FieldType(ctx, config);
            config.colors = iCSR.fn.extractcolors(config.colors, config.Choices);
            return config;
        }
        catch
            (e) {
            iCSR.traceerror('get_configTemplate error', e, '\nsuccesfull config declarations:', config);
        }
    };
    /******************************************************************************************************************
     * pre-Process all configurations (global, Template, custom) into one configuration for a Template
     * @param config
     * @returns {*}
     */
    iCSR.fn.set_configTemplate = function (config) {//TODO (high) refactor set_configTemplate
        iTrace(3, 'set_configTemplate', config.style);
        var ispredefinedtemplate = config.Styles.hasOwnProperty(config.style);
        var template = config.Styles.default;//start with default template

        if (ispredefinedtemplate) {
            var customtemplate = config.Styles[config.style];//overwrite with customtemplate
            for (var key in customtemplate) {
                if (customtemplate.hasOwnProperty(key)) template[key] = customtemplate[key];
            }
        } else {
            if (config.style) template.item = iCSR.Tokens.replace(config.style);
            //template.item = "<div class='[classname]' onclick=\\"[click]\\">" + config.style + "</div>";
        }
        config.style = template;
        return template;//also return a copy because the Template function uses a local var (for now)
    };


//region code under development ********************************************************************
    /**
     * Full screen settings from core.js
     */
//SetFullScreenMode(true);//not available yet when CSR runs
//_ToggleFullScreenMode();
//GetCookie('WSS_FullScreenMode');
    /******************************************************************************************************************
     *
     * @param fn
     * @returns {boolean|string|*|*[]|Array|{index: number, input: string}|*}
     */
    iCSR.fn.getFunctionName = function (fn) {
        var f = typeof fn === 'function';
        var s = f && ((fn.name && ['', fn.name]) || fn.toString().match(/function ([^\(]+)/));
        return (!f && 'not a function') || (s && s[1] || 'anonymous');
    };
    /******************************************************************************************************************
     * TODO: (high) refactor, store all Items from View
     */
    iCSR.fn.addItem = function (config) {
        var _key = config.Name;
        if (!iCSR.Items.hasOwnProperty(_key)) {//init Array
            iCSR.Items[_key] = [];
        }
        iCSR.Items[_key].push(config.value);
    };
    /******************************************************************************************************************
     * fixate the header of the SharePoint Table
     */
    iCSR.fn.fixedListViewHeader = function () { //create fixed header with scrolling body
        //  document.querySelectorAll("tr[class*='ms-viewheadertr']");
    };
//
//if (ctx.CurrentItem[ctx.CurrentFieldSchema.Name] === '')
//    return ["<img ",
//        " src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7' ",
//        " onload={GetAncestor(this,'TR').style.display='none'}",
//        ">"].join('');

//endregion development code

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
    /******************************************************************************************************************
     *
     * @param id
     * @returns {Element}
     */
    iCSR.CSS.appendStyleSheettoHEAD = function (id) {
        var _styleEl = document.createElement("STYLE");
        _styleEl.id = id; // _styleEl.setAttribute("media", "only screen and (max-width : 1024px)")
        _styleEl.appendChild(document.createTextNode('')); // WebKit hack :(
        document.head.appendChild(_styleEl);
        iTrace(2, 'added stylesheet', _styleEl.id);
        return _styleEl;
    };
    /******************************************************************************************************************
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
                iTraceWarning(1, 'ignoring CSS definition:', rule);
            }
        } else {
            iCSR.traceerror('Not a STYLE sheet', _element);
        }
    };
    /******************************************************************************************************************
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
    /******************************************************************************************************************
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

    /******************************************************************************************************************
     * Append CSS from Template config definition to the page
     * @param CSS
     * @param config
     * @param traceCSS
     * @returns {*}
     */
    iCSR.CSS.appendTemplateCSS = function (CSS, config, traceCSS) {
        var rules = config.rules || [];
        CSS = CSS || false;

        if (typeof CSS === 'string') {//CSS is a reference to a CSS definition in config.Styles
            CSS = config.Styles[CSS];
        }
        if (CSS) {
            for (var key in CSS) {
                if (CSS.hasOwnProperty(key)) {
                    var rule = iCSR.Tokens.replace(CSS[key], config);
                    rules.push(rule);
                    if (traceCSS) iTrace(2, 'CSS: ', key, rule);
                }
            }
            iCSR.CSS.addStylesheetWithRules(config.templateCSSid, rules, true);
            iTrace(1, 'CSS:', CSS);
        } else {
            iCSR.traceerror('Missing CSS config.Styles:', CSS);
        }
        return CSS;
    };

    iCSR.CSS.listRules = function (_templateCSSid) {
        var _rulesArray = [];
        var _styleEl = document.getElementById(_templateCSSid); //get existing stylesheet
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
        event && event.preventDefault();                                                    // cancel all clicks bubbling up in the done
        event && event.stopPropagation();
        listID = listID || SP.ListOperation.Selection.getSelectedList();                    // use the current list if none declared
        var context = SP.ClientContext.get_current();
        var web = context.get_web();
        var list = web.get_lists().getById(listID);
        var item = list.getItemById(ID);
        context.load(item);
        //todo: value = String(value);//make sure we are writing string values
        item.set_item(fieldname, value);
        item.update();
        iTrace(0, 'iCSR.SP.UpdateListItem', ID, fieldname, typeof value);
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
        if (ctx) return ctx.CurrentItem.hasOwnProperty(ctx.CurrentFieldSchema.Name + '.COUNT.group');
    };

//endregion --------------------------------------------------------------------------------------- iCSR.SP
//region iCSR.DOM ------------- Generic DOM functions (SharePoint DOM structure, ids etc.)--------- ### iCSR.DOM

    iCSR = iCSR || {};
    iCSR.DOM = {}; //namespace for SP related stuff
    iCSR.DOM.fn = {}; //namespace for SP related stuff
    iCSR.DOM.Control = {}; //namespace for SP related stuff

    /******************************************************************************************************************
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
    /******************************************************************************************************************
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
            iTraceWarning(1, 'deleteElement error:', _element);
        }
    };

    iCSR.DOM.footer = function (message) {//TODO use for iCSR messaging
        message = message || "Download iCSR.js from iCSR.github.io ► the iCSR.js file you linked to is for demo use only! ( version: " + iCSR._VERSION + " )";
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
    /******************************************************************************************************************
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
        allinput = document.getElementById(allid);
        allinput.addEventListener("click", this.selectall);
    };

//endregion --------------------------------------------------------------------------------------- iCSR.DOM
//region iCSR.Controllers ------------------------------------------------------------------------- ### iCSR.Controllers (OnPostRender)

//region iCSR.Control.table--------------------------------------------------------------------- ### iCSR.Control.table

    /******************************************************************************************************************
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
            return field.Name;
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

//region ----- ctx object inspector can be used from the F12 console - type 'ic' in the console ---- ### ctx object inspector
    /******************************************************************************************************************
     * @param ctx_object
     * @param fieldnames
     */
    iCSR.SP.getctxobjectinfo = function (ctx_object, fieldnames) {
        var fields = {};
        ctx_object.forEach(function (field) {
            var fieldinfo = {};
            fieldnames.split(',').forEach(function (prop) {
                var _text = field[prop];
                if (prop === 'Name' && iCSR.$hasTemplate(_text, true)) _text += ' ==> iCSR.Me';
                fieldinfo[prop] = _text;
            });
            fields[field.counter] = fieldinfo;
        });
        return fields;
    };
    if (!window.ic) {
        Object.defineProperty(window, 'ic', {
            configurable: true,
            get: function () {
                console.log(this, this.name);
                if (ctx) return console.table(iCSR.SP.getctxobjectinfo(ctx.ListSchema.Field, "DisplayName,Name,RealFieldName,FieldType"));
                return '';
            }
        });
    }
    if (!window.cls) {
        Object.defineProperty(window, 'cls', {
            configurable: true,
            get: function () {
                console.clear();
                return '';
            }
        });
    }
//endregion ---------------------------------------------------------------------------------------- ctx object inspector

//region --- default iCSR overrides to be used as: SPClientTemplates.TemplateManager.RegisterTemplateOverrides( iCSR.overrides );
    iCSR.overrides = function (overrides) {
        overrides = overrides || {
                Templates: {}
            };
        iCSR.Object.ensure(overrides, 'Templates', {});

        overrides.Templates.Fields = {};
        overrides.Templates.Fields.Priority = {
            View: iCSR.Me
            //View: iCSR.Me.bind({style:'kpi4',colors:"red,orange,green"})
            //View: iCSR.Me.bind({style:'svgcircle(15)',coalors:"lightcoral,orange,lightgreen"})
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
        return overrides;
    };
//endregion

    if (iCSR.hasOwnProperty('_DEMO')) iCSR.DOM.footer();
    iCSR.init();
    iCSR.RegisterDefaultTemplates();                              // RegisterTemplate: DueDate, Status, PercentComplete, Priority, Planner
    SP.SOD.notifyScriptLoadedAndExecuteWaitingJobs('iCSR');
})
(window);

