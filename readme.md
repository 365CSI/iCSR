* 1.0 - public release february 1st 2016
* 1.1 - not made public
* 1.2 - friday february 5th
    * simplified ``iCSR.Me`` usage (javascript .bind notation is no longer needed)
    * enhanced [token] replace functionality
    * Progressbar now has a reset to 0 on mouseover

### ![](https://365csi.nl/iCSR/ipcountlogo/index.php) SharePoint CSR - Client Side Rendering  framework & support library (*IKEA style*)

![](http://i.imgur.com/TKbGDpS.jpg)

##### Impatient? Skip the explanations: [get going in 5 minutes](CSR-5-minute-quickstart.md)

### iCSR.js is a framework/support library for writing **less** JavaScript code

##### Customized Views like:

![](http://i.imgur.com/ZUNgWGh.jpg)

##### Can be created with one **iCSR.Me** statement:

```javascript
            SPClientTemplates.TemplateManager.RegisterTemplateOverrides({
            Templates: {
                Fields: {
                  "Priority":{
                    View : iCSR.Me
                  }
            }
```
##### or customized further with:

```javascript
            View : iCSR.Me({
                                    colors: ['red','yellow','green'],
                                    style : '<span>[svgcircle(20)]</span>'
            					})
```

![](http://i.imgur.com/pOMU6YW.jpg)  

##### On a default Task list just one line:

          var overrides = iCSR.overrides();
          SPClientTemplates.TemplateManager.RegisterTemplateOverrides( overrides );

##### will produce:

*all iCSR templates can be cofigured as per above example*

![](http://i.imgur.com/oxedw2u.jpg)

##### *{Haven't had time yet for a 5 minute video}*

## Project goals:

For the full story see: [Why I wrote iCSR.js](iCSR-why-it-was-developed.md)

In short:

* Help people get started with CSR development in 5 minutes  
(including installing the [**Cisar Chrome extension**](https://chrome.google.com/webstore/detail/cisar/nifbdojdggkboiifaklkamfpjcmgafpo?hl=en))
* Let people learn CSR (SharePoint JavaScript) development by disecting the [iCSR.js](./iCSR.js) source code.
* No dependencies at all on jQuery, Angular, Bootstrap or **any** other .JS and .CSS files

## Installation

##### Impatient? Skip the explanations: [get going in 5 minutes](CSR-5-minute-quickstart.md)

1. #### Install and learn to use the [Cisar Chrome extension](https://chrome.google.com/webstore/detail/cisar/nifbdojdggkboiifaklkamfpjcmgafpo?hl=en)

2. #### Add [iCSR.js](./iCSR.js) to your environment

* [In the Style Library](./documentation/)

* In the MasterPage

* Loading from a CSR file

## Usage

#### Ready made [iCSR-Templates](iCSR-Templates.md)

* PercentComplete
* Today calculations & coloring
* Priority
* Status

#### For CSR developers : Tracing iCSR JavaScript execution

iCSR source-code is broken up in generic descriptive functions to be used in your custom fields.  
Making learning JavaScript hopefully a bit easier.
iCSR has multiple (configurable) levels of console.log traces that can be activated with:

        iCSR.traceon( 3 , true ); // tracelevel:0-5 , clear console


![](http://i.imgur.com/NkVJTL7.jpg)

## ![](http://th.downloadblog.it/h57RNZTWa_IIoH3Y9fs71eZKLwI=/64x64/http://media.downloadblog.it/e/e64/steve-jobs-apple.jpg) oh.. and one more thing.. ehm.. line of code..

        iCSR.Interactive = true; // which is the default setting

##### Makes fields fully interactive in Views... who needs Forms?

![](http://i.imgur.com/TKbGDpS.jpg)

## Adding more Templates

The new [Office365 Microsoft Planner](http://www.learningsharepoint.com/2016/01/27/10-things-to-know-about-office-365-planner/) breaks Tasks in 4 States: 'Not Started', 'Late', 'In progress', 'Completed'

##### To add a Template with the same Planner colorscheme:

    View: iCSR.Planner

##### which displays (the Due Date in 4 state colors):

![](http://i.imgur.com/fQEL21t.jpg)

##### The iCSR Template is registered as:

```javascript
    iCSR.RegisterTemplate('Planner', function () {
            var planner = this;
            var state = 2; // default: In progress
            if (planner.CurrentItem.Status === planner.states[0]) {
                state = 0; // Not Started
            } else if (planner.CurrentItem.Status === planner.states[3]) {
                state = 3; // Completed
            } else if (planner.days < 0) {
                state = 1; // Late
            }
            planner.color = planner.colors[ state ];
            planner.textcolor = planner.textcolors[ state ];
            planner.output = "<div style='background:[color];color:[textcolor];padding:0px 2px'>[value]</div>";
        },//function
        {//configuration
            colors: iCSR.CFG.color.msYellowRedBlueGreen,//Microsoft colors: yellow,red,blue,green
            textcolors: ['slate', 'lightgrey', 'slate', 'slate'],
            states: ['Not Started', 'Late', 'In progress', 'Completed']
        }
    );//RegisterTemplate
```

## Future development

iCSR.js is MIT licensed, no restrictions on any usage

* [Fork this code](https://github.com/365SI/iCSR#fork-destination-box) for learning and contribution purposes, I am open for **all** suggestions.


----------

Amsterdam, february 2016

:email: [Danny Engelman](mailto:danny@engelman.nl)

![](http://i.imgur.com/TKbGDpS.jpg)
