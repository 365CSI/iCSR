# iCSR documentation

## Using the Chrome Cisar Plugin

* [Installing and using the Cisar Plugin for the first time](./sing-cisar.md)

## iCSR and iCSR.Me Templates

* Progress
* Priority
* DueDate
* Status

for now all in one file documentation: [iCSR Templates](./iCSR_Templates.md)

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
