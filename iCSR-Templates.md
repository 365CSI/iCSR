![](https://365csi.nl/iCSR/iCSR_names_DateTime.png)

# iCSR.Template.DueDate

![](https://365csi.nl/iCSR/images/duedate.jpg)

    "DueDate":{
            View:iCSR.Me
    }

or

    "[fieldname]":{
            View:iCSR.Template.DueDate
    }

### Custom configuration

    "[FieldName]":{
            View:iCSR.Template.bind({
                ranges:['','',''] //array of:  color,daycount
            })
    }

| property  | description | example |
| ------------- | ------------- | --- |
| ranges | defines an array of date ranges| ['#f55', -21 ,'#f7a', -14 ,'#fab', -7 ,'#fda', -10 ,'pink', 0 ,'#cf9', 7 ,'#9fa']
| labels | default value: | ['No Due Date', 'days left', 'days past']|
| nextday | | "next day" |
| previousday | | "previous day" |


---
---

![](https://365csi.nl/iCSR/iCSR_names_Progress.png)

# iCSR.Template.Progress

![](https://365csi.nl/iCSR/images/progress.jpg)

---
---



![](https://365csi.nl/iCSR/iCSR_names_Priority.png)

# iCSR.Template.Priority

![](https://365csi.nl/iCSR/images/priority.jpg)


---
---


![](https://365csi.nl/iCSR/iCSR_names_Status.png)

# iCSR.Template.Status

![](https://365csi.nl/iCSR/images/status.jpg)


## Using iCSR on your own (non-Task List) SharePoint Fields

Instead of using the generic ``iCSR.Me`` function reference, use the ``iCSR.Template.`` reference:

* ``iCSR.Template.PercentComplete`` for progress bar number values between 0 and 1
* ``iCSR.Template.Priority`` for Choice fields: ``(0) Label1`` , ``(1) Label2`` , ``(2) Label3`` ,
* ``iCSR.Template.DueDate`` for DateTime fields
* ``iCSR.Template.Status`` for Status fields (generic text labels)

### Example

    function execCSR() {
      SP.SOD.executeFunc("clienttemplates.js", "SPClientTemplates", function() {
        function init() {
          iCSR.traceon(0);
          SPClientTemplates.TemplateManager.RegisterTemplateOverrides({
            Templates: {
              Fields: {
                "MyPriority": {
                  View: iCSR.Template.Priority
                },
                "MyStatus": {
                  View: iCSR.Template.Status.bind({   colors: {
                                                               "Not Started": 'lightgray',
                                                               "Deferred": 'pink',
                                                               "Waiting on someone else": 'gold',
                                                               "In Progress": 'orange',
                                                               "Completed": 'lightgreen'
                                                           }
                                                    })
                },
                "MyDueDate": {
                  View: iCSR.Template.DueDate.bind({ranges:'lightcoral,-5,pink,-1,orange,0,lightgreen,5,lightgreen'})
                },
                "MyPercentComplete":{
                  View: iCSR.Template.PercentComplete.bind({barcolor:'#0072C6',color:'beige'})
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
