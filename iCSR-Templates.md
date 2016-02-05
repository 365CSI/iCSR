![](https://365csi.nl/iCSR/iCSR_names_DateTime.png)

# iCSR.DueDate

Calculates the date offset from Today, colors by specified range. The interactive version allows to change the date with **one click** to the previous or next day.

![](https://365csi.nl/iCSR/images/duedate.jpg)

### Usage:
    "DueDate":{
            View:iCSR.Me
    }

or for any DateTime field:

    "[fieldname]":{
            View:iCSR.DueDate
    }

### Custom configuration

    "[FieldName]":{
            View:iCSR.DueDate({
                ranges:['#fab', -7 , 'pink', 0 , '#cf9' , 7 , '#9fa' ] //array of:  color,daycount
            })
    }

---
---

![](https://365csi.nl/iCSR/iCSR_names_Progress.png)

# iCSR.Progress

![](https://365csi.nl/iCSR/images/progress.jpg)

### Styles

##### default:

    iCSR.PercentComplete

Custom HTML progressbar with scale, all future values are settable with **one click**
Hover over the left side of the progressbar to reset to 0

![](http://i.imgur.com/RlzWYNs.jpg)

##### progress:

    iCSR.PercentComplete( { style:'progress' } )

HTML5 [Progress](https://css-tricks.com/html5-progress-element/) element

![](http://i.imgur.com/IqnlXcP.jpg)

##### range:

    iCSR.PercentComplete( { style:'range' } )

HTML5 [input type='range'](http://www.wufoo.com/html5/types/8-range.html) element

![](http://i.imgur.com/OseXPAe.jpg)

iCSR converts the range (iCSR) style configuration

From:

    <div style='white-space:nowrap;background:[rangecolor];height:[rangeheight];margin-top:-5px'>
      <input id='[id]' type='range'
            [oninput]
            [onchange]
            min='0' value='[valuenr]' max='100' step=10>
      [rangelabel]
    </div>

Into:

    <div style="white-space:nowrap;background:inherit;height:24px;margin-top:-5px">
      <input id="PercentComplete_1" type="range"
		oninput="this.nextSibling.innerHTML=this.value;"
		onchange="iCSR.SP.UpdateItem(this,'1','PercentComplete',String(Number(this.value)/100) )"
		min="0" value="80" max="100" step="10">
	  <span style="color:inherit;display:inline-block;text-align:right;width:20px">80</span>
	  <span style="display:inline-block;text-align:right;font-size:70%"> %</span>
    </div>


Default PercentComplete configuration:

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

Can be re-configured with:

    iCSR.PercentComplete( { barcolor:'green' } )


---
---



![](https://365csi.nl/iCSR/iCSR_names_Priority.png)

# iCSR.Priority

![](https://365csi.nl/iCSR/images/priority.jpg)

### Styles

##### default:

    iCSR.Priority


Custom HTML displaying current Priority, the dimmed colors allow to change Priority with **one click**

![](http://i.imgur.com/uLtjDnu.jpg)


##### kpi1, kpi2, kpi3, kpi4

Using standard SharePoint KPI images from ``/_layouts/images/`` (_not interactive_)

    iCSR.Priority( { style:'kpi1' } )

![](http://i.imgur.com/ZttliEO.jpg)

---
---


![](https://365csi.nl/iCSR/iCSR_names_Status.png)

# iCSR.Status

![](https://365csi.nl/iCSR/images/status.jpg)


# Using iCSR on your own (non-Task List) SharePoint Fields

Instead of using the generic ``iCSR.Me`` function reference, use the ``iCSR.`` reference:

* ``iCSR.PercentComplete`` for progress bar number values between 0 and 1
* ``iCSR.Priority`` for Choice fields: ``(0) Label1`` , ``(1) Label2`` , ``(2) Label3`` ,
* ``iCSR.DueDate`` for DateTime fields
* ``iCSR.Status`` for Status fields (generic text labels)

### Example

    function execCSR() {
      SP.SOD.executeFunc("clienttemplates.js", "SPClientTemplates", function() {
        function init() {
          iCSR.traceon(0);
          SPClientTemplates.TemplateManager.RegisterTemplateOverrides({
            Templates: {
              Fields: {
                "MyPriority": {
                  View: iCSR.Priority
                },
                "MyStatus": {
                  View: iCSR.Status({   colors: {
                                                               "Not Started": 'lightgray',
                                                               "Deferred": 'pink',
                                                               "Waiting on someone else": 'gold',
                                                               "In Progress": 'orange',
                                                               "Completed": 'lightgreen'
                                                           }
                                                    })
                },
                "MyDueDate": {
                  View: iCSR.DueDate({ranges:'lightcoral,-5,pink,-1,orange,0,lightgreen,5,lightgreen'})
                },
                "MyPercentComplete":{
                  View: iCSR.PercentComplete({barcolor:'#0072C6',color:'beige'})
                }
              }//Fields
            }//Templates
          });
        }//init
        RegisterModuleInit(SPClientTemplates.Utility.ReplaceUrlTokens("~siteCollection/Style Library/csr_test.js"), init);
        init();
      });
    };
    var script='https://365csi.nl/iCSR/iCSR.js';
    SP.SOD.registerSod("iCSR", script);
    SP.SOD.executeFunc("iCSR", null, execCSR );
    if(typeof iCSR!=='undefined') execCSR();
