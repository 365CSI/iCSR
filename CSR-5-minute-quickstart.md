# iCSR.js 5 minute quickstart

### Easy CSR development with Cisar Chrome extension

The free [**Cisar Chrome extension**](https://chrome.google.com/webstore/detail/cisar/nifbdojdggkboiifaklkamfpjcmgafpo?hl=en) (by [Adrey Markeev](http://sharepoint.stackexchange.com/users/1430/andrey-markeev)) makes creating CSR files and JSlink connections a breeze.

Cisar writes files to the ``~sitecollection/Style Library``, So you need **Write access to the ``/Style Library``**

#### Your first CSR file

 1. Use the Chrome Browser (*No support for FireFox or Microsoft Internet Explorer yet*)
 2. Install the [**Cisar Chrome extension**](https://chrome.google.com/webstore/detail/cisar/nifbdojdggkboiifaklkamfpjcmgafpo?hl=en)
 3. Close the F12 Developer Tools Console (if open at all)
 4. Browse to a Task List View (with some Task Items displayed in the View)
 5. Open F12 Developer Tools
 6. Select the **Cisar** Tab
   ![](http://i.imgur.com/X13jT80.jpg)

**Now the cool stuff happens**

 1. Click to add a file
 ![](http://i.imgur.com/Q6mKvhB.jpg)
 2. Give it a filename (*by default all files are stored in /style library/*)
**Cisar will analyse the View and built a CSR Template**
 4. All you have to add is your JavaScript logic
 5. On every change you make in Cisar the View will update,
No Save, No reload required
**now that is cool Live coding** (*eat your heart out Visual Studio*)


## Using the iCSR.js library in your CSR file

The iCSR.js library must be loaded **before** your CSR code.

Replace the code Cisar created with the (slightly modified) code:

    function executeCSR() {//function gets called AFTER the iCSR library is loaded
      console.log('executing CSR code');
      SP.SOD.executeFunc("clienttemplates.js", "SPClientTemplates", function() {//make sure clienttemplates is loaded
        function init() {
          iCSR.traceon(1);//set to a a higher value to display more logging in the console
          //iCSR.Interactive=false;//one switch to turn all interactive elements off
          SPClientTemplates.TemplateManager.RegisterTemplateOverrides({
            Templates: {
              Fields: {
                "Priority": {
                  View: iCSR.Me
                  //View: iCSR.Me.bind({template:'kpi2',colors:"red,orange,green"})
                  //View: iCSR.Me.bind({template:'svgcircle(20)',colors:"red,orange,green"})
                },
                "Status": {
                  View: iCSR.Me//.bind({colors:"lightcoral,limegreen,grey,wheat,pink"})
                },
                "DueDate": {
                  View: iCSR.Me//.bind({ranges:'lightcoral,-5,pink,-1,orange,0,lightgreen,5,lightgreen'})
                },
                "PercentComplete":{
                  View: iCSR.Me.bind({barcolor:'#0072C6',color:'beige'})
                }
              }//Fields
            }//Templates
          });
        }//init
        RegisterModuleInit(SPClientTemplates.Utility.ReplaceUrlTokens("~siteCollection/Style Library/csr_test.js"), init);
        init();
      });
    };
    SP.SOD.registerSod("iCSR", 'https://365csi.nl/iCSR/iCSRalfa.js');//register external library as iCSR
    SP.SOD.executeFunc("iCSR", null, executeCSR );//load the iCSR library
    if (typeof iCSR !== 'undefined') executeCSR();//line is required to keep Cisar doing live edits, can be omitted in production

## cool?