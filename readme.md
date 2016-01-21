![](https://avatars0.githubusercontent.com/u/14222997?v=3&s=96)
### alfa version disclaimer:
* iCSR has not yet reached version 1.0  
* Is under active development  
* [Fork this code](https://github.com/365SI/iCSR#fork-destination-box) for learning and contribution purposes, I am open for **all** suggestions.
* Code may change and refactored for the 1.0 release (hopefully in february)

## SharePoint 2013 Client Side Rendering (CSR) - IKEA style

#### [**iCSR.js**](https://github.com/365CSI/iCSR/blob/master/iCSR.js), a CSR support library for writing **less** JavaScript code.

##### Customized Views like:

![](http://i.imgur.com/ZUNgWGh.jpg)

##### Can be created with one **iCSR.Me** statement:
*Note: This is standard CSR Template code,*

*if you have never seen CSR code, the* **iCSR.Me** *part might not seem cool ... yet*

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


##### *{5 minute video goes here}*

## Project goals:

* Help people get started with CSR development in 5 minutes  
(including installing the [**Cisar Chrome plugin**](https://chrome.google.com/webstore/detail/cisar/nifbdojdggkboiifaklkamfpjcmgafpo?hl=en))  
* Learn CSR (SharePoint JavaScript) development by disecting the [iCSR.js](https://github.com/365CSI/iCSR/blob/master/iCSR.js) source code.

## Installation

#### Install the [Cisar Chrome plugin](https://chrome.google.com/webstore/detail/cisar/nifbdojdggkboiifaklkamfpjcmgafpo?hl=en)

* The free [**Cisar Chrome plugin**](https://chrome.google.com/webstore/detail/cisar/nifbdojdggkboiifaklkamfpjcmgafpo?hl=en) was developed by Andrei Markeev
 It makes creating CSR files and JSlink connections a breeze.
 (*No support for FireFox or Microsoft Internet Explorer yet*)

#### Add [iCSR.js](https://github.com/365CSI/iCSR/blob/master/iCSR.js) to your environment

* [In the Style Library](./documentation/)

* In the MasterPage

* Loading from a CSR file

## Usage

#### Ready made iCSR.Me Templates

* PercentComplete
* Today calculations & coloring
* Priority
* Status

iCSR source-code is broken up in generic descriptive functions to be used in your custom fields.  
Making learning JavaScript hopefully a bit easier.
iCSR has multiple (configurable) levels of console.log traces

![](http://i.imgur.com/NkVJTL7.jpg)

## oh.. and one more thing.. ehm.. line of code..

    iCSR.Interactive = true

##### Makes fields fully interactive in Views... who needs Forms?


----------


Danny Engelman  
Amsterdam  
january 2016



![](http://i.imgur.com/89vJz3x.jpg)