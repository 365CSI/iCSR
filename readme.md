### version 1.0 disclaimer:
* Major work is done, I might tweak code a bit
* [Fork this code](https://github.com/365SI/iCSR#fork-destination-box) for learning and contribution purposes, I am open for **all** suggestions.

## ![](https://365csi.nl/iCSR/ipcountlogo/index.php) SharePoint 2013 Client Side Rendering (CSR) - IKEA style

##### Impatient? Skip the explanations: [get going in 5 minutes](CSR-5-minute-quickstart.md)

#### iCSR.js is a framework/support library for writing **less** JavaScript code

##### Customized Views like:

![](http://i.imgur.com/ZUNgWGh.jpg)

##### Can be created with one **iCSR.Me** statement:

    SPClientTemplates.TemplateManager.RegisterTemplateOverrides({
    Templates: {
        Fields: {
          "Priority":{
            View : iCSR.Me
          }
    }

##### or customized further with:

            View : iCSR.Me.bind({
                                  colors:['red','yellow','green'],
					              template:"<span>[svgcircle(20)]</span>"
            					})

![](http://i.imgur.com/pOMU6YW.jpg)  

##### On a default Task list just one line:

      var overrides = iCSR.overrides();
      SPClientTemplates.TemplateManager.RegisterTemplateOverrides( overrides );

##### will produce:

*all iCSR templates can be cofigured as per above .bind() example*

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

#### For (wannabe) CSR developers : Tracing iCSR JavaScript execution

iCSR source-code is broken up in generic descriptive functions to be used in your custom fields.  
Making learning JavaScript hopefully a bit easier.
iCSR has multiple (configurable) levels of console.log traces

![](http://i.imgur.com/NkVJTL7.jpg)

## ![](http://th.downloadblog.it/h57RNZTWa_IIoH3Y9fs71eZKLwI=/64x64/http://media.downloadblog.it/e/e64/steve-jobs-apple.jpg) oh.. and one more thing.. ehm.. line of code..

    iCSR.Interactive = true; // which is the default setting

##### Makes fields fully interactive in Views... who needs Forms?

----------

Amsterdam, january 2016

[Danny Engelman](mailto:danny@engelman.nl)



![](http://i.imgur.com/oxedw2u.jpg)
