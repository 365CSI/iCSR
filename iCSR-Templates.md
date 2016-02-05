![](https://365csi.nl/iCSR/iCSR_names_DateTime.png)

# iCSR.DueDate

![](https://365csi.nl/iCSR/images/duedate.jpg)

    "DueDate":{
            View:iCSR.Me
    }

or

    "[fieldname]":{
            View:iCSR.DueDate
    }

### Custom configuration

    "[FieldName]":{
            View:iCSR({
                ranges:['#fab', -7 , 'pink', 0 , '#cf9' , 7 , '#9fa' ] //array of:  color,daycount
            })
    }

---
---

![](https://365csi.nl/iCSR/iCSR_names_Progress.png)

# iCSR.Progress

![](https://365csi.nl/iCSR/images/progress.jpg)

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


## Using iCSR on your own (non-Task List) SharePoint Fields

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
