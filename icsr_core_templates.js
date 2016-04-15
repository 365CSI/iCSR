/*global document,window,navigator,setTimeout,event,console*/
/*global Type,SP,SPClientTemplates,SPClientRenderer,_spPageContextInfo*/
/*global ClientPivotControl,RenderHeaderTemplate,RegisterModuleInit,RegisterBeginEndFunctions,asyncDeltaManager*/
/*global GenerateIIDForListItem, GetAncestor, AJAXRefreshView,ctx,GenerateIID,GetDaysAfterToday,_spYield*/
/*global _v_dictSod,browseris*/
/*global iCSR*/
/*jshint -W069*/ // allow |"notation"|

//region --- DefaultTemplates ---------------------------------------------------------------------- ### DefaultTemplates
//region --- iCSR.DueDate -------------------------------------------------------------------------- ### iCSR.DueDate
//noinspection HtmlUnknownAttribute
iCSR.Template('DueDate', function () {
        var duedate = this;
        var days = duedate.days;
//        duedate.pickdate = String.format("{0:yyyy-MM-dd}", new Date(duedate.value));
        if (isNaN(days)) {
            duedate.output = "<div onclick=\"iCSR.$update(this,'|ID|','|Name|',new Date())\" >|nodate|</div>";
        }
        //if (!duedate.) {
        //    //duedate.input="|datepick_chrome|";//duedate.input='|datepick|';
        //    duedate.pick = '';
        //}
        duedate.colornr = 0; // start at zeror so the loop can add 1 before the comparison
        while (duedate.range[duedate.colornr] < days)duedate.colornr++; //loop to find color
        duedate.color = duedate.colors[duedate.colornr]; // color is a nr, get the colorname
        duedate.absdays = Math.abs(days);                               // -2 to 2
        if (days < 0) {
            duedate.label = duedate.past;
        } else if (days === 0) {
            duedate.absdays = '';
            duedate.label = duedate.today;
        } else if (days > 0) {
            duedate.label = duedate.future;
        }
    },
    {
        colors: '|msRed|,#f7a,#fab,#fda,#cf9,|msGreen|',
        range: [-21, -14, -7, 0, 7],
        nodate: 'No Date',
        today: 'today',
        next: "next day",
        prev: "previous day",
        future: '|absdays| days left',
        past: '|absdays| days past',//todo past days are calculated reverse

        //HTML 5 datepicker
        //date format needs to be convertedt before saving to SP
        //$clk: "onclick='{event.stopPropagation()}'",
        //onchange: "onchange=\"|$SPUpdate|,new Date(this.value))\" ",
        //datedisplayChrome: "<span style='font-size:70%'>|label| </span><input type='date' min='|2000-12-31|' |$clk| |onchange| value='|pickdate|' style='background:|color|'",

        //interactive for non Chrome browser
        width: "145px",
//        height: '20px',
        $clck: "<DIV onclick=\"var d=new Date('|value|');d.setDate(d.getDate()",
        $SPUpdate: "iCSR.$update(this,'|ID|','|Name|',new Date(d))\"",
        $pick: "<DIV class=|$CSSid|dayset>|$clck|-1);|$SPUpdate|>|prev|</DIV>|$clck|+1);|$SPUpdate| class=|$CSSid|tom>|next|</DIV></DIV>",
        $date: "<DIV style=float:left>|label|</DIV><DIV style=float:right>|value|</DIV>",
        $Styles: [
            {
                outerdiv: "<div class=|$CSSid| style=color:|contrast|;width:|width|>|$colortag|$date|$pick|</div>",
                CSS: [
                    /*outer */ ".|$CSSid|>DIV{position:relative}",
                    /*datepick */ ".|$CSSid|dayset{top:-6px}",
                    /*dayselect */ ".|$CSSid|dayset>DIV{position:absolute;width:60%;opacity:0}",
                    /*tomorrow */ ".|$CSSid|tom{right:0;text-align:right}",
                    /*updatehover */ ".|$CSSid|dayset>DIV:hover{opacity:1;cursor:pointer}"
                    //Chrome datepicker
                    ///*input */ ".|$CSSid|>input {width:125px;border:none;margin-top:-4px}"
                ]
            }
        ]
    }
);
//endregion ---------------------------------------------------------------------------------------- iCSR.DueDate
//region --- iCSR.Priority ------------------------------------------------------------------------- ### iCSR.Priority
//noinspection BadExpressionStatementJS,HtmlUnknownTarget,HtmlUnknownAttribute
iCSR.Template('Priority', function () {
        var prio = this,
            currentchoice = 0;
        var htmlparts = prio.choices.map(function (choice, nr) {  // process all choices and built the html for each
            prio.nr = String(nr);
            prio.choice = choice; // store so it can be used in Styles
            prio.priocolor = prio.colors[nr];
            prio.textcolor = prio.textcolors[nr];
            if (prio.value === choice) {
                currentchoice = nr;
                prio.classname = prio.$CSSidactive;
                prio.color = prio.priocolor;// make sure TD and TR coloring receive the correct color
                prio.priolabel = prio.label;
            } else {
                prio.classname = prio.$CSSidchoice;
                prio.priolabel = '&nbsp;';
            }
            if (!prio.$edit) prio.classname += ' NonInteractive';// add CSS class for non-interactive Template
            return prio.$replace(prio.style.item);               // config settings are changed INside the loop, so replace tokens for every item
        });
//        prio.color = prio.colors[currentchoice];
//    console.log(prio.colors,prio.color);
        if (prio.$edit && htmlparts[currentchoice].indexOf('click') > -1) {        // is there on onclick handler
            prio.choices = htmlparts;
        } else {
            prio.choices = htmlparts[currentchoice];
        }
    },
    {
        choices: ['(1) High', '(2) Normal', '(3) Low'],//todo get from ListSchema choices
        colors: "|msRed|,|msYellow|,|msGreen|",//Microsoft colors
        colortag: 'DIV',
        textcolors: ['beige', 'inherit', 'grey'],
        width: '110px', //total width
        height: '20px',
        widthactive: '50%',
        widthchoice: '10px', //width of the non Current Choice options
        fontsize: '11px',
        $SPUpdate: "iCSR.$update(this,'|ID|','|Name|'",
        $clk: "onclick=\"|$SPUpdate|,'|choice|');\"",
        $CSSid: 'iCSRprio',
        $CSSidactive: '|$CSSid|_Current',
        $CSSidchoice: '|$CSSid|_Choice',
        //$KPI:'default,peppers,pepperalarm,normal',
        image: 'default',
        $Styles: [
            {//0
                outerdiv: "<div class='|$CSSid| |$CSSid||$edit| |$CSSid||Item.Status|'>|choices|</div>",
                item: "<div class=\"|classname| |$CSSid|\" style=\"background:|priocolor|;color:|textcolor|\" |$clk|>|priolabel|</div>",
                CSS: [ //object of strings with tokenized CSS definitions
                    /*outernonedit */ ".|$CSSid|false {width:auto}",
                    /*outer */ ".|$CSSid|true {width:|width|}",
                    /*outerCompleted */ ".|$CSSid|Completed {opacity:.2;zoom:.7}",  // extra CSS when the Item.Status field is present in the View
                    /*outerNotStarted */ ".|$CSSid|Not {opacity:.7;zoom:.9}",
                    /*outerDiv */ ".|$CSSid||$edit|>div {position:relative;float:left;display:inline;border:1px solid grey;font-size:|fontsize|;padding:1px}",
                    /*currentlabel */ ".|$CSSidactive|{width:|widthactive|;text-align:center}",
                    /*currentnonedit */ ".|$CSSidactive|.NonInteractive {width:100%;display:block}",
                    /*choice */ ".|$CSSidchoice|{width:|widthchoice|;opacity:.4}",
                    /*choicehover */ ".|$CSSidchoice|:hover {opacity:1;cursor:pointer;border-color:black}"
                ]
            },//0
            {//1 default style
                outerdiv: "<div class='|$CSSid| |$CSSid||$edit| |$CSSid||Item.Status|'>|choices|$colortag|</div>",
                item: "<span class=\"|classname|\" style=\"background:|priocolor|\" |$clk|> |priolabel| </span>",
                CSS: [
                    /*outer div*/ ".|$CSSid|{}",
                    /*outerDiv */ ".|$CSSid||$edit|>div {position:relative;float:left}",
                    /*currentlabel */ ".|$CSSidactive|{width:|widthactive|;text-align:center;padding:2px}",
                    /*choice */ ".|$CSSidchoice|{opacity:.4}",
                    /*choicehover */ ".|$CSSidchoice|:hover {opacity:1;cursor:pointer;border-color:black}",
                    /*currentnonedit */ ".|$CSSidactive|.NonInteractive {width:100%;display:block}"
                ]
            },//1
            {//2 kpi   //
                outerdiv: "<div class='|$CSSid|'>|choices|</div>",
                CSS: [
                    /*outer div*/ ".|$CSSid|{height:|height|}",
                    /*currentnonedit */ ".|$CSSidactive|.NonInteractive {width:100%;display:block}",
                    /*choice */ ".|$CSSidchoice|{width:|widthchoice|;opacity:.4}",
                    /*choicehover */ ".|$CSSidchoice|:hover {opacity:1;cursor:pointer;border-color:black}"
                ],
                item: '<span class="|classname|" |$clk|><img src="/_layouts/images/kpi|image|-|nr|.gif"></span>' //default sharepoint images in the layouts folder
            }
            //{//3
        ]//Styles
    }
);
//endregion iCSR.Priority -------------------------------------------------------------------------- ### iCSR.Priority
//region --- iCSR.PercentComplete ------------------------------------------------------------------ ### iCSR.PercentComplete
//noinspection HtmlUnknownAttribute
iCSR.Template('PercentComplete', function () {
        var progress = this;
        var percentage10s = Math.floor(progress.valuenr / 10) * 10;			// round current value to 10s values
        var bars = [100, 90, 80, 70, 60, 50, 40, 30, 20, 10];
        progress.bars = bars.map(function (percentage, nr) {
            progress.nr = String(nr);                                           // standard practice use nr for itePlanner in a loop, so it can be used as token |nr|
            progress.percentage = percentage;                                   // make percentage available as token [percentage|
            progress.label = percentage;
            progress.barclass = "past";                                 // classes
            progress.percent = percentage / 100;                        // SharePoint expects 0 to 1 values
            if (percentage > progress.valuenr) {                                // progress can be set for higher values
                progress.barclass = "new";                              // classes
            } else if (percentage === percentage10s) {                       // current value
                progress.barclass = "current";
            }
            progress.barclass += "|$CSSid|";
            return progress.$replace(progress.style.item);                // config settings are changed INside the loop, so replace tokens for every item
        });
        if (progress.valuenr > 0) {                                             // add reset to 0 option
            progress.percent = 0;
            //noinspection HtmlUnknownAttribute
            progress.bars.push("<div class='reset|$CSSid|' |$clk|>|reset|</div>");
        }
        progress.percent = String(progress.percent);
    },
    {
        $grid: true,
        colors: "pink",
        background: "lightgrey",
        scalecolor: "grey",
        scalesize: "75%",
        color: '|msBlue|',
        textcolor: "beige",
        hovercolor: "beige",
        hoverbarcolor: "green",
        percentsign: "<span style='display:inline-block;text-align:right;font-size:70%'>&nbsp;%</span>",
        rangecolor: "blue",
        labelcolor: "inherit",
        reset: "reset to 0",
        rangelabel: "<span style='color:|labelcolor|;display:inline-block;text-align:right;width:20px'>|valuenr|</span>|percentsign|",
        onchange: "onchange=\"|$SPUpdate|,this.value/100\" ",
        oninput: "oninput=\"this.nextSibling.innerHTML=this.value;\" ",
        width: "160px",
        height: "15px",
        CSSinset: "border-radius:1px;box-shadow: 0 2px 5px rgba(0, 0, 0, 0.25) inset",
        $CSSid: "iCSRbar",
        $SPUpdate: "iCSR.$update(this,'|ID|','|Name|'",
        $clk: "onclick=\"|$SPUpdate|,'|percent|')\" ",
        $Styles: [
            {//0
                outerdiv: "<div class='|$CSSid|'>|bars|</div>",
                item: "<div class='|barclass|' style='width:|percentage|%' |$clk|>|label|</div>",
                CSS: [
                    /*outer */ ".|$CSSid|{width:|width|;height:|height|;position:relative;float:left;background:|background|}",
                    /*scale */ ".|$CSSid|{font-family:arial;font-size:11px;color:|scalecolor|}",
                    /*bar */ ".|$CSSid|>div {position:absolute;text-align:right;font-size:|scalesize|;height:100%}",
                    /*barscale */ ".|$CSSid|>div {border-right:1px solid #aaa}",
                    /*hover */ ".|$CSSid|>div:not(.current|$CSSid|):hover{color:|hovercolor|;font-size:100%;background:|hoverbarcolor|;z-index:4;;opacity:.8;cursor:pointer}",
                    /*hoverbefore */ ".|$CSSid|>div:not(.current|$CSSid|):hover:before{content:'>>';font-weight:bold}",
                    /*currentpercent */ ".|$CSSid|>div:hover:after,.|$CSSid| .current|$CSSid|:after{content:'%'}",
                    /*current */ ".|$CSSid| .current|$CSSid|{font-size:100%;z-index:3}",
                    /*barcolor */ ".|$CSSid| .current|$CSSid|{background:|color|;color:|textcolor|;|CSSinset|}",
                    /*reset */ ".|$CSSid| .reset|$CSSid|{z-index:3;width:10%;height:|height|;overflow:hidden;border-right:0px;color:transparent;padding:0 3px}",
                    /*resethover */ ".|$CSSid| .reset|$CSSid|:hover{width:auto}"
                ]
            },
            //{//1
            //    outerdiv: "<div style='white-space:nowrap'><progress class='|$CSSid|' value='|valuenr|' max='100'></progress> |value|</div>",
            //    CSS: [
            //        /*outer */ ".|$CSSid|{height:|height|;background:|background|;color:|color|}",
            //        /*bar */ ".|$CSSid|::-webkit-progress-value {background:|color|;|CSSinset|}",
            //        /*inset */ ".|$CSSid|::-webkit-progress-bar {background:|background|;|CSSinset|}"
            //    ]
            //},
            //{//2
            //    outerdiv: "<div style='white-space:nowrap;background:|rangecolor|;height:24px;margin-top:-5px'><input id='|id|' type='range' |oninput| |onchange| min='0' value='|valuenr|' max='100' step=10>|rangelabel|</div>",
            //    CSS: [
            //        /*outer */ ".|$CSSid|{height:|height|;background:|background|}",
            //        /*inset */ ".|$CSSid|::-webkit-progress-bar {background:#eee;|CSSinset|}"
            //    ]
            //}
        ]//Styles
    }
);
//endregion --------------------------------------------------------------------------------------- iCSR.PercentComplete
//region --- iCSR.Status --------------------------------------------------------------------------- ### iCSR.Status
iCSR.Template('Status', function () {
        var status = this;
        status.color = status.colors[status.value];
        if (status.value === "Waiting on someone else") status.value = "Waiting";
        status.value = status.value.replace(/ /gi, '&nbsp;');
    },
    {
        colors: {
            "Not Started": "|msBlue|",
            "Deferred": "|msBlue|",
            "Waiting on someone else": "|msYellow|",
            "In Progress": "|msYellow|",
            "Completed": "|msGreen|"
        },
        width: '20px',
        fontsize: '11px',
        height: '15px',
        $CSSid: 'iCSRstatus',
        $Styles: [
            {//0
                outerdiv: "<div class='|$CSSid|' style='background:|color|'>&nbsp;|value|&nbsp;</div>",
                CSS: [
                    /*outer */ ".|$CSSid|{font-size:|fontsize|;height:|height|;text-align:center;padding:2px 1px 2px 1px}"
                ]
            },
            //{//0
            //    outerdiv: "<div class='|$CSSid|' style='color:|color|'>&nbsp;|value|&nbsp;</div>",
            //    CSS: [
            //        /*outer */ ".|$CSSid|{font-size:|fontsize|}"
            //    ]
            //},
            //{//1
            //    outerdiv: "<div class='|$CSSid|'><div style='float:left;background:|color|;width:|width|'>&nbsp;</div>&nbsp;|value|&nbsp;</div>",
            //    CSS: [
            //        /*outer */ ".|$CSSid$S|{font-size:|fontsize|}"
            //    ]
            //}
        ]
    }
);
//endregion --------------------------------------------------------------------------------------- iCSR.Status
//endregion --------------------------------------------------------------------------------------- iCSR.DefaultTemplates

