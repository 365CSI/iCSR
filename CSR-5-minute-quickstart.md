# iCSR.js 5 minute quickstart

## 1. Easy CSR development with Cisar Chrome extension

The free [**Cisar Chrome extension**](https://chrome.google.com/webstore/detail/cisar/nifbdojdggkboiifaklkamfpjcmgafpo?hl=en) (by [Adrey Markeev](http://sharepoint.stackexchange.com/users/1430/andrey-markeev)) makes creating CSR files and JSlink connections a breeze.

Cisar writes files to the ``~sitecollection/Style Library``, So you need **Write access to the ``/Style Library``** (*A Site Collection administrator can grant it to you*)

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

## 2. Use the JSLink Manager Bookmarklet

It makes managing JSLink connections on WebParts and Views easy

* http://icsr.github.io/JSLinkManager.html

## 3. Use the iCSR.js library in your CSR file

Use the [JSLink Manager](http://icsr.github.io/JSLinkManager.html) so the iCSR library loads **before** your CSR code

#### Example CSR code

Replace the code Cisar created with the (slightly modified) code:

```javascript
  SP.SOD.executeFunc("clienttemplates.js", "SPClientTemplates", function() {
    function init() {
      iCSR.traceon(1,1);//tracelevel,clear console
      var overrides=iCSR.overrides();//default overrides for default Task list fields
      overrides.Templates.Fields.DueDate.View=iCSR.Me;
      SPClientTemplates.TemplateManager.RegisterTemplateOverrides(overrides);
    };//init
    var csrfile="~siteCollection/Style Library/csr_test.js";
    RegisterModuleInit(SPClientRenderer.ReplaceUrlTokens(csrfile), init);
    init();
  });//SPClientTemplates
```
# More CSR Templates

    SP.SOD.executeFunc("clienttemplates.js", "SPClientTemplates", function () {
      iCSR.traceon(1);
        function init() {
            var overrides = {Templates: {Fields: {}}};
            var Fields = overrides.Templates.Fields;
            Fields.DueDate = {
                View: iCSR.Me
            };
            Fields.PercentComplete = {
                View: iCSR.Me
            };
            Fields.Priority = {
                View: iCSR.Me
            };
            Fields.Status = {
                View: iCSR.Me
            };
            SPClientTemplates.TemplateManager.RegisterTemplateOverrides(overrides);
        }
        var csrfile = "~siteCollection/Style Library/csr_demo.js";
        if (console) console.info(csrfile);
        csrfile=SPClientRenderer.ReplaceUrlTokens(csrfile);
        RegisterModuleInit(csrfile, init);
        init();
    });


