//region iCSR ---use CTRL +- in IDE to collapse regions---------------------------------------- ### iCSR.header
/*********************************************************************************************************************************
 * icsr.js - Office365/SharePoint (CSR) Client Side Rendering JavaScript programming framework/support library
 *
 * license: Creative Commons Attribution License - iCSR by 365CSI
 *          http://iCSR.github.io
 *
 * iCSR.js was written to be used by both entry-level CSR(JavaScript) users and more advanced developers
 *
 * please use Github for bug reports, feature requests
 * if you make changes please Fork the source on GitHub and make a Pull Request
 *
 * Please use SharePoint/StackOverflow for usage questions
 *
 * Source Code File layout
 * - (un)collapse regions with Ctrl(shift) + and - (available in decent IDEs like WebStorm or Visual Studio)
 *
 * in F12 Developers console
 * - use 'ic' to display ctx and iCSR object information
 *
 * JavaScript style notes
 * - I am sorry, I could NOT find any use for jQuery
 *
 */

/*global iCSR*/

/*global document,window,navigator,setTimeout,event,console*/

/*global Type,SP,SPClientTemplates,SPClientRenderer,_spPageContextInfo,PreventDefaultNavigation*/
/*global ClientPivotControl,RenderHeaderTemplate,RegisterModuleInit,RegisterBeginEndFunctions,asyncDeltaManager*/
/*global GenerateIIDForListItem, GetAncestor, AJAXRefreshView,ctx,GenerateIID,GetDaysAfterToday,_spYield,_v_dictSod,browseris*/
//endregion iCSR.header ----------------------------------------------------------------------- ### iCSR.header

Type.registerNamespace('iCSR'); // MUST register it the SharePoint way
(function (_window, document, iCSR) {
    /* globals will be removed by UglifyJS if unused in the minified code */
    var iCSRversion = "2.1a";
    var iCSRcolors = 'background:#005AA9;color:#FCD500;';
    var groupedConsole = 4;
    /* tracelevel in console, the higher the more output  */
    //console.groupCollapsed = console.group; /* uncomment for one long trace in console */
    var edittoken = '$edit';
//region Global overrides --------------------------------------------------------------------- ### Global Functions
    function $isString(source) {
        return typeof source === 'string';
    }

    function $has(source, search) {// ;
        if (typeof source === 'object') {
            return source.hasOwnProperty(search);
        } else if ($isString(source) && search.length > 0) {
            return source.indexOf(search) > -1;
        } else {
            return 0; // the (unneeded) else branch makes the minified file smaller because it minifies to a unary expression
        }
    }

    function $splitStrObj(source, splitter) {
        if ($isString(source)) {
            return source.split(splitter || ',');   // return array after split string
        } else if (typeof source === 'object') {
            return Object.keys(source);             // return array of object keys
        } else {
            return [];
        }
    }

    function extendObject(destination, source, keys) { // if keys as csv defined then set those, otherwise use the keys from the source
        $splitStrObj(keys || source).map(function (key) {
            if ($has(source, key)) {                                       // only required if keys are defined
                destination[key] = source[key];
            } else {
                if (groupedConsole > 5) console.warn('Undefined: ', key, ' in: ', source);
            }
        });
    }

    function defineProperty(_obj, _name, _function) {
        if (!$has(_obj, _name)) {
            Object.defineProperty(_obj, String(_name), {
                //configurable: true,
                get: _function
            });
        }
    }

    function $replacetokens(_string, _tokenconfig, tokenized) {//tokenized declared as var, saves 4 bytes
//v3          var convertJSON = !$isString(_string);
//v3          if (convertJSON) _string = JSON.stringify(_string);             // convert string to JSON object
        //todo can we use 'this' instead of parameter _tokenconfig?
        if (_string) {
            //todo convert object to string
            if (groupedConsole > 4) console.log('%creplacing:', iCSRcolors, _string);
            _tokenconfig = _tokenconfig || this;                           // tokens defined in optional .bind(config) for each Template function
            return $splitStrObj(_string, '|').map(function (token) {
                    tokenized = _tokenconfig[token];
                    if (groupedConsole > 6 && tokenized) console.log("\t%c" + token + " --> " + tokenized, 'background:lightblue;');
                    //if (iCSR[_tokenstring]) _tokenized = iCSR[_tokenstring].call(_tokenconfig, _tokenized);//todo call token functions
                    if (token === edittoken) {
                        tokenized = !!tokenized; // explicit true/false required because true/false as string is used in Template CSS definitions
                    }
                    if (Array.isArray(tokenized)) {  // Arrays are (most likely) a result from an HTML building function (see PercentComplete Template)
                        tokenized = tokenized.join('');
                    }
                    if ($has(tokenized, '|')) {                               // more token markers?
                        return $replacetokens(tokenized, _tokenconfig);       // RECURSIVE call
                    } else {
                        //if (typeof token === 'number') console.error('No token definition for:', _string, token, tokenized, typeof tokenized);
                        return tokenized || token;
                    }
                }
            ).join('');

        } else {// used because $replace is used to test form string value
            console.warn('$replace called with no string', _tokenconfig);
        }
    }

//endregion --------------------------------------------------------------------------------------- Global Functions

    iCSR.Template = function (templateIDname, templatefunction, templatecustomconfig) {
        if (groupedConsole) console.groupCollapsed('Register Template', templateIDname);
        var templateconfig = /* minimal default config settings for all Templates */ {
            $Styles: [{
                outerdiv: "<div class='|$CSSid|' style='background:|color|;color:|contrast|'> |value| |$colortag|</div>",
                CSS: [".|$CSSid|{}"] //required so new Templates
            }],
            $groupheader: /* if Template is allowed to display in GroupedHeader : */ 0,
            $grid: /* if Template is allowed in Grid Edit datasheet mode : */ 0,
            msYellow: /* Microsoft Planner color Yellow : */ '#FFB700',
            msRed: /* Microsoft Planner color Red    : */ '#F02401',
            msBlue: /* Microsoft Planner color Blue   : */ '#219DFD',
            msGreen: /* Microsoft Planner color Green  : */ '#77BC00',
            colortag: 'TD'     // by default color the Table Cell with config.color
        };
        templateconfig[edittoken] = true;// by default Templates can update SharePoint field values... Who? needs Forms?

        extendObject(templateconfig, templatecustomconfig);
        templateconfig.output = templateconfig.$Styles[0].outerdiv;      // default output for all Templates, so a Template works without output being declared

        if (groupedConsole) console.info('%cCreate Template: ' + templateIDname, iCSRcolors);
        iCSR[templateIDname] = function (ctx, CurrentFieldSchema, CurrentItem) {//, CurrentItem, ListSchema                        // create a named function in the global iCSR object
//region CreateTemplate function -------------------------------------------------------------- ### CreateTemplate function
            if (!$has(ctx, 'wpq')) {        // is this ctx the SharePoint ctx object?
                if (groupedConsole) console.info('Template ', templateIDname, ' called from CSR Template definition with (optional) {} configuration');
                /* Template function was called from CSR Template as Function **declaration** */
                /* return the function with (optional) iCSR declaration from first parameter */
                return iCSR[templateIDname].bind(ctx);
            } else {
                /* function was called by SharePoint, creates (CSR) HTML as config.output */
                // todo, do we know if called from a RefreshView? We could make the HTML static config.static=true
                if (groupedConsole) {
                    console.groupCollapsed('%ciCSR.' + templateIDname, iCSRcolors);
                    console.info('configuration:', templateconfig);
                }
//region CreateTemplate function -------------------------------------------------------------- ### CreateTemplate function INIT
//region CreateTemplate function -------------------------------------------------------------- ### CreateTemplate function config
                // all var declarations at top for better minification
                var element;
                var config = {};
                var Name = config.Name = CurrentFieldSchema.Name;
                var SPitemID = CurrentItem.ID;

                /* add Template configuration values */
                extendObject(config, templateconfig);
                /* overwrite/add user defined Template configuration values from ({ }) */
                extendObject(config, (this !== CurrentFieldSchema && this !== _window) ? this : {});

                //todo Once had a Field without Name, but can't recall when
                config.value = ($has(CurrentItem, Name)) ? CurrentItem[Name] : CurrentItem[CurrentFieldSchema.RealFieldName];
                //config.value = CurrentItem[Name];


                extendObject(config, {
                    valuenr: config.value.match(/\d+/) / 1,             // no number in value then 0

                    days: GetDaysAfterToday(new Date(config.value)),    // regardless if its a DateTime field, always calculate days

                    $CSSid: templateIDname,                             // default class for this template
                    id: templateIDname + SPitemID,                      // template identifier

                    ID: SPitemID,                                        // required for SPupdate
                    Item: CurrentItem

                    //version 3.0
                    //iid: GenerateIID(ctx),
                    //Created: GetDaysAfterToday(ctx.Created),
                    //Modified: GetDaysAfterToday(ctx.Modified),
                    //itemid: 'iCSR_' + ctx.wpq + '_' + SPitemID;
                });

                if (config.valuenr) {
                    config.label = $splitStrObj(config.value, ' ')[1];            // if a valuenr then get label after (n)
                } else {
                    config.label = config.value;
                }

                //todo move SOD to outside function, or use _spPageContextInfo.webPermMasks
                SP.SOD.executeFunc("sp.js", 'SP.ClientContext', function () {
                    if (!SP.PageContextInfo.get_webPermMasks().has(SP.PermissionKind.editListItems)) {  // if no editListItems rights
                        config[edittoken] = 0;
                    }
                });
//endregion ------------------------------------------------------------------------------------ ### CreateTempate function config
                // ******** edge cases when iCSR is not applied
                //ListSchema.Field.AllowGridEditing = false;//todo does this do anything?
                //todo allow iCSR in groupheaders
                if ((ctx.inGridMode && !config.$grid) || ($has(CurrentItem, Name + '.COUNT') && config.$groupheader)) return config.value;

                //todo one view display by id only // $has(ctx.viewCSR.config.views, ctx.view)
                if (window.view === ctx.view) return config.value;

                if (groupedConsole) console.warn('creating functions on this scope (template instance) with the correct "this" scope (configuration)');

                /* ==> attach methods so EACH Template ITEM function executes with its own config scope */
                config.$replace = $replacetokens.bind(config);

//endregion ------------------------------------------------------------------------------------ ### CreateTempate function INIT
//region CreateTemplate function -------------------------------------------------------------- ### CreateTemplate function PRE PROCES
                if (groupedConsole) console.groupCollapsed('%cprocessing colors and styles', iCSRcolors, config);

                if(!config.colors) config.colors="msRed|,|msYellow|,|msBlue|,|msGreen";
                if ($isString(config.colors)) { //todo looks alot like handling JSON object
                    if (groupedConsole)  console.info(templateIDname, config.colors);
                    config.colors = $splitStrObj($replacetokens(config.colors, config));   // convert string to array if required, first replacing is required
                }

                console.log((function () {        // EXCLUDE code from minified version
                    if (groupedConsole) {
                        var tracecolors = ['config.colors: '];
                        var colors = $splitStrObj(config.colors);
                        colors.map(function (color) {
                            tracecolors[0] += ' %c ' + color + ' ';                                 // display color and value in console
                            if (config.colors.hasOwnProperty(color)) color = config.colors[color];
                            tracecolors.push('background:' + color);
                        });
                        console.log.apply(console, tracecolors);
                        return "Processed colors";
                    }
                })());

                if (groupedConsole)  console.info('Creating CSS STYLES', config.id);

                config.style = config.$Styles[config.style || 0];            // get the user specified or first style definition

                /* Each Template adds (unnecessary) CSS STYLE tag */
                element = document.getElementById(config.id);
                if (element) {                                              // todo version 3.0 should respect global styles
                    element.parentNode.removeChild(element);                // todo, only for Cisar life editting is removal required ?
                }
                element = document.createElement('STYLE');
                element.id = config.id;
                document.head.appendChild(element);
                config.style.CSS.map(function (CSSrule) {               // proces all lines in the CSS definition, the key itself is ignored!
                    try {
                        CSSrule = $replacetokens(CSSrule, config);      // proces all [tokens] before inserting CSS in STYLE
                        element.sheet.insertRule(CSSrule, 0);
                    } catch (e) {
                        console.warn('CSS ignored', 'color:orangered', e);
                        console.log(CSSrule);
                    }
                });
                if (groupedConsole) console.groupEnd();//processing colors and styles
//endregion ------------------------------------------------------------------------------------ ### CreateTempate function PRE Process
                if (groupedConsole) console.groupCollapsed('%cProcessing (user) defined Template', iCSRcolors, templateIDname, config.id);

                /* ==> execute the actual template function with config as 'this' scope and ctx as first parameter */
                templatefunction.call(config, ctx);
                /* ==> the Function does NOT have a return value, all data is on the config object and now processed */

                if (groupedConsole) console.groupEnd();
//region CreateTemplate function -------------------------------------------------------------- ### CreateTemplate function POST Process
                if (groupedConsole) console.info('%cpost-processor', iCSRcolors);

                /* after the (user) template the config is post-processed */

                /* if color is a numbers, its an index number to the colors array */
                if (!$isString(config.color)) config.color = config.colors[config.color];
                /* contrasting textcolor */
                if (config.color === config.msRed) config.contrast = 'beige';

                /* color TD or TR, walk up the DOM to the specified |colortag| , the base64 image instead of blank.gif prevents network calls*/
                //noinspection HtmlUnknownTarget,BadExpressionStatementJS,CommaExpressionJS,UnnecessaryLabelJS
                config.$colortag = "<img onload=iCSR.$up(this,'|colortag|').style.background='|color|' src=data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7>";

                if (groupedConsole) console.groupCollapsed('returning output: (last token processing)', config.id);
                if (groupedConsole) console.log(config.output);

                /* final processing of remaining tokens */
                config.output = config.$replace(config.output);
                if (groupedConsole) console.log(config.output);

                if (groupedConsole) console.groupEnd();//last replace .output
                if (groupedConsole) console.groupEnd();
//endregion ------------------------------------------------------------------------------------ ### CreateTempate function POST Process
                /* return the HTML back to SharePoint CSR calling code */
                return config.output;

            }//if ($has(ctx, 'wpq'))
//endregion ------------------------------------------------------------------------------------ ### CreateTempate function
        };//end iCSR[templateIDname] function

        console.log((function () {        // EXCLUDE code from minified version
            iCSR[templateIDname].config = templateconfig;          // extra property on this function itself so the ViewConfiguration can get to it

            defineProperty(window, 'icctx', function () {
                console.clear();
                console.table(ctx.ListSchema.Field, ["DisplayName", "Name", "RealFieldName", "FieldType"]);
            });
            defineProperty(window, 'ic' + templateIDname, function () {
                function DOMrow(html) {
                    var element = document.createElement('DIV');
                    element.innerHTML = html;
                    document.getElementById('DeltaPlaceHolderMain').appendChild(element);
                }

                function logtokens(tokens) {
                    tokens.map(function (key) {
                        var color = (key[0] === '$' ? 'pink' : 'palegreen');
                        var keyHTML = templateconfig[key];
                        if ($isString(keyHTML)) keyHTML = keyHTML.replace(/</g, '&lt;');
                        DOMrow(String.format("<div style='margin-bottom:1px'><span style='padding-left:5px;background-color:{1};width:99px;display:inline-block'>{0}</span><span style='padding-left:5px;background-color:beige;'>{2}</span></div>", key, color, keyHTML));
                    });
                }

                DOMrow(String.format("<h1>iCSR.{0}</h1>", templateIDname));
                var tokens = $splitStrObj(templateconfig).sort();
                var safetokens = [];
                var bewaretokens = [];
                tokens.map(function (key) {
                    if (key[0] === '$') {
                        bewaretokens.push(key);
                    } else {
                        safetokens.push(key);
                    }
                });
                DOMrow(String.format("<b>You can safely change these tokens to configure the Template</b>"));
                logtokens(safetokens);
                DOMrow(String.format("<b>Be careful when changing these tokens!</b>"));
                logtokens(bewaretokens);
                DOMrow(String.format("<b>Remember: any variable you declare in Configuration or Function IS a token</b>"));
                return "Remember: any variable you declare in Configuration or Function IS a token";
            });
        })());

        if (groupedConsole) console.groupEnd();// end iCSR.Template
    };// end iCSR.Template

    iCSR.$up = function (me, tagType) {                         // is called from IMG onload events
        while (me.tagName !== tagType) me = me.parentNode;
        return me;
    };

    iCSR.$update = function (element, ID, fieldname, value) {
        //iCSR.$up(element, 'TD').style.opacity = 4 / 10;                      // dim the element, will be redrawn after save by SharePoint // jshint ignore:line // jshint ignore:line
        iCSR.$up(element, 'TD').innerHTML = 'saving...';                      // dim the element, will be redrawn after save by SharePoint // jshint ignore:line // jshint ignore:line
        PreventDefaultNavigation();
        var currentContext = new SP.ClientContext.get_current();
        var item = currentContext.get_web().get_lists().getById(SP.ListOperation.Selection.getSelectedList()).getItemById(ID);
        //console.info(element, ID, fieldname, value);
        item.set_item(fieldname, value);//no conversion to string here!
        item.update();
        iCSR.$X = 1;// used in external scripts to check the Status
        currentContext.executeQueryAsync(function () {
            iCSR.$X = 0;
            ctx.skipNextAnimation = 1;                            // !!!! this is the new ctx provided by SharePoint, do not declare a variable with name ctx
            AJAXRefreshView({
                currentCtx: ctx,
                csrAjaxRefresh: true // must be a true/false value!
            }, 1); //1=SP.UI.DialogResult.OK
        }, function () {
            iCSR.$X = 0;
            var err = arguments[1];
            var errcode = err.get_errorCode() / -1; // leading characters with absolute errCode
            var error;
            var errormessages = {
                2130575162: 'Validation',
                2130575339: 'Version'
            };
            if ($has(errormessages, errcode)) {
                error = errormessages[errcode];
            } else {
                error = err.get_message();
            }
//            iCSR.config=iCSRViewconfig;
            console.log((function () {        // EXCLUDE code from minified version
                try {// not all errors have these methods? Validation error has
                    error += ' (SP:' + err.get_errorDetails().get_itemFailure().get_message() + ') ';
                } catch (e) {
                }
                console.error(error.message, err);
                console.error('Error Updating', arguments);
            }));
            SP.UI.Status.addStatus('Update', String.format(error + ' conflict ({0}) {1}', ID, fieldname));
        });
    };
    iCSR.Me = function (iCSRViewconfig) {
        SP.SOD.executeFunc("clienttemplates.js", "SPClientTemplates", function () {
            function executeCSRfunction(templateFunction) {             // one function wrapper executes all CSR functions
                if (typeof iCSRViewconfig[templateFunction] === 'function') {
                    console.warn('executing CSR function: ', templateFunction);
                    iCSRViewconfig[templateFunction].call(this, ctx);   // call the the function with the correct scope
                }
            }

            var CSRtemplate = {                                     // built the CSR Object needed for SharePoint
                OnPreRender: function () {
                    executeCSRfunction('OnPreRender');
                },
                Templates: {},
                OnPostRender: function () {
                    executeCSRfunction('OnPostRender');
                }
            };

            function _ViewCSRinit() {
                extendObject(CSRtemplate.Templates, iCSRViewconfig, "View,Body,Group,Item,Header,Footer,Fields");
                SPClientTemplates.TemplateManager.RegisterTemplateOverrides(CSRtemplate);
            }

            RegisterModuleInit(SPClientRenderer.ReplaceUrlTokens(iCSRViewconfig.file), _ViewCSRinit);//.bind(CSRtemplate));            // prepare the init function with the correct this scope
            // in version 3.0 we will handle all CSR happenings
            //RegisterBeginEndFunctions(_ViewCSR.file, _ViewCSR.file, _ViewCSR.init.bind(_ViewCSR), _ViewCSR.endCSR.bind(_ViewCSR), _ViewCSR.loadCSR.bind(_ViewCSR));
            _ViewCSRinit();//non MDS activation
            if (groupedConsole) console.groupEnd();
        });
    };
//endregion ------------------------------------------------------------------------------------ ### iCSR.View

    console.group('%c iCSR.js - ' + iCSRversion + ' ', 'background:#005AA9;color:#FCD500;font-weight:bold;font-size:14px;');
    if (!groupedConsole) {
        console.groupEnd();
    }
    console.log((function () {        // EXCLUDE code from minified version
        /* ic commands available in the (Chrome) console */
        function contrastcolor(bgcolor) {// in rrggbb hex notation
            bgcolor = bgcolor.replace('#', '');
            var r = parseInt(bgcolor.substr(0, 2), 16),
                g = parseInt(bgcolor.substr(2, 2), 16),
                b = parseInt(bgcolor.substr(4, 2), 16);
            return (((r * 299) + (g * 587) + (b * 114)) / 1000 >= 128) ? 'inherit' : 'beige';
        }

        defineProperty(window, 'icColors', function () {
            //noinspection CssNoGenericFontName
            var H = "<DIV id=icColors style='z-index:99;background:beige;position:fixed;top:0;left:0;font-family:arial;font-weight:bold;width:870px'>";
            H += "<DIV onclick=this.parentNode.style.display='none'><h1>Click this title to close. Doubleclick colorname or #value to copy</h1></DIV>";
            var colornames = "white:ffffff,gainsboro:dcdcdc,silver:c0c0c0,darkgray:a9a9a9,gray:808080,dimgray:696969,black:000000,whitesmoke:f5f5f5,lightgray:d3d3d3,lightcoral:f08080,rosybrown:bc8f8f,indianred:cd5c5c,red:ff0000,maroon:800000,snow:fffafa,mistyrose:ffe4e1,salmon:fa8072,orangered:ff4500,chocolate:d2691e,brown:a52a2a,darkred:8b0000,seashell:fff5ee,peachpuff:ffdab9,tomato:ff6347,darkorange:ff8c00,peru:cd853f,firebrick:b22222,olive:808000,linen:faf0e6,bisque:ffe4c4,darksalmon:e9967a,orange:ffa500,goldenrod:daa520,sienna:a0522d,darkolivegreen:556b2f,oldlace:fdf5e6,antiquewhite:faebd7,coral:ff7f50,gold:ffd700,limegreen:32cd32,saddlebrown:8b4513,darkgreen:006400,floralwhite:fffaf0,navajowhite:ffdead,lightsalmon:ffa07a,darkkhaki:bdb76b,lime:00ff00,darkgoldenrod:b8860b,green:008000,cornsilk:fff8dc,blanchedalmond:ffebcd,sandybrown:f4a460,yellow:ffff00,mediumseagreen:3cb371,olivedrab:6b8e23,forestgreen:228b22,ivory:fffff0,papayawhip:ffefd5,burlywood:deb887,yellowgreen:9acd32,springgreen:00ff7f,seagreen:2e8b57,darkslategray:2f4f4f,beige:f5f5dc,moccasin:ffe4b5,tan:d2b48c,chartreuse:7fff00,mediumspringgreen:00fa9a,lightseagreen:20b2aa,teal:008080,lightyellow:ffffe0,wheat:f5deb3,khaki:f0e68c,lawngreen:7cfc00,aqua:00ffff,darkturquoise:00ced1,darkcyan:008b8b,lightgoldenrodyellow:fafad2,lemonchiffon:fffacd,greenyellow:adff2f,darkseagreen:8fbc8f,cyan:00ffff,deepskyblue:00bfff,midnightblue:191970,honeydew:f0fff0,palegoldenrod:eee8aa,lightgreen:90ee90,mediumaquamarine:66cdaa,cadetblue:5f9ea0,steelblue:4682b4,navy:000080,mintcream:f5fffa,palegreen:98fb98,skyblue:87ceeb,turquoise:40e0d0,dodgerblue:1e90ff,blue:0000ff,darkblue:00008b,azure:f0ffff,aquamarine:7fffd4,lightskyblue:87cefa,mediumturquoise:48d1cc,lightslategray:778899,blueviolet:8a2be2,mediumblue:0000cd,lightcyan:e0ffff,paleturquoise:afeeee,lightsteelblue:b0c4de,cornflowerblue:6495ed,slategray:708090,darkorchid:9932cc,darkslateblue:483d8b,aliceblue:f0f8ff,powderblue:b0e0e6,thistle:d8bfd8,mediumslateblue:7b68ee,royalblue:4169e1,fuchsia:ff00ff,indigo:4b0082,ghostwhite:f8f8ff,lightblue:add8e6,plum:dda0dd,mediumpurple:9370db,slateblue:6a5acd,magenta:ff00ff,darkviolet:9400d3,lavender:e6e6fa,pink:ffc0cb,violet:ee82ee,orchid:da70d6,mediumorchid:ba55d3,mediumvioletred:c71585,purple:800080,lavenderblush:fff0f5,lightpink:ffb6c1,hotpink:ff69b4,palevioletred:db7093,deeppink:ff1493,crimson:dc143c,darkmagenta:8b008b";
            colornames.split(',').map(function (color) {
                color = $splitStrObj(color, ':');
                var name = color[0];
                color = '#' + color[1];
                var textcolor = contrastcolor(color);
                //noinspection HtmlUnknownAttribute
                H += "<DIV style=float:left;text-align:center;width:120px;height:35px;background-color:" + color + ";margin:1px;color:" + textcolor + ">";
                H += name + "<DIV style=text-transform:uppercase;font-size:90%>" + color + "</DIV></DIV>";
            });
            H += "<DIV></DIV></DIV>";
            var element = document.createElement('DIV');
            element.innerHTML = H;
            document.getElementById('DeltaPlaceHolderMain').appendChild(element);
            console.clear();
            return "Colornames displayed in Browser window, Doubleclick  name or #value to copy, click the header to close";
        });

        return 'registered ic console commands';

    })());

//    SP.SOD.notifyScriptLoadedAndExecuteWaitingJobs('iCSR');//todo required for MDS?
})
(window, document, iCSR);
