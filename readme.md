![](https://avatars0.githubusercontent.com/u/14222997?v=3&s=96)
###disclaimer:
iCSR has not yet reached version 1.0  
Is under active development  
Fork this code for learning and contribution purposes, I am open for **all** suggestions.  
Code may change and be refactored for the 1.0 release (hopefully in february)  

##SharePoint 2013 Client Side Rendering - IKEA style
(*using the [Cisar Chrome plugin](https://chrome.google.com/webstore/detail/cisar/nifbdojdggkboiifaklkamfpjcmgafpo?hl=en) to make CSR development really easy*)


[**iCSR.js**](https://github.com/365CSI/iCSR/blob/master/iCSR.js) is a JavaScript library which makes custom CSR development (a bit) easier.  

![](http://i.imgur.com/ZUNgWGh.jpg)

Can be created with one CSR statement: 

    SPClientTemplates.TemplateManager.RegisterTemplateOverrides({
    Templates: {
        Fields: {
          "Priority":{
            View : iCSR.Me
          }
    }

or customized with:

            View : iCSR.Me.bind({
                                  colors:['red','yellow','green'],
					              template:"<span>[svgcircle(20)]</span>"
            					})

![](http://i.imgur.com/pOMU6YW.jpg)  


####*{5 minute video goes here}*

##Project goals:

* get started with CSR development in 5 minutes  
(including installing the [**Cisar Chrome plugin**](https://chrome.google.com/webstore/detail/cisar/nifbdojdggkboiifaklkamfpjcmgafpo?hl=en))  
* learn CSR (SharePoint JavaScript) development by disecting the [iCSR.js](https://github.com/365CSI/iCSR/blob/master/iCSR.js) source code.  
iCSR has multiple (configurable) levels of console.log traces
![](http://i.imgur.com/NkVJTL7.jpg) 

##Installation

Add [iCSR.js](https://github.com/365CSI/iCSR/blob/master/iCSR.js) to your environment

* In the Style Library

{instructions here}
##Usage

The free [**Cisar Chrome plugin**](https://chrome.google.com/webstore/detail/cisar/nifbdojdggkboiifaklkamfpjcmgafpo?hl=en) was developed by Andrei Markeev to make creating CSR files and JSlink connections a breeze.

Add the [**iCSR.js**](https://github.com/365CSI/iCSR/blob/master/iCSR.js) library and you will write less code.

![](http://i.imgur.com/89vJz3x.jpg)
