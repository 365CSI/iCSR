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

#### Styles

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

---
---



![](https://365csi.nl/iCSR/iCSR_names_Priority.png)

# iCSR.Priority

![](https://365csi.nl/iCSR/images/priority.jpg)


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
