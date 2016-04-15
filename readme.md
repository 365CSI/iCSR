
* [Fork this code](https://github.com/365SI/iCSR#fork-destination-box) for learning and contribution purposes, I am open for **all** suggestions.

### ![](https://365csi.nl/icsr/ipcountlogo/index.php?1) A framework/support library for writing **less** JavaScript code

##### Customized Views like:

![](http://i.imgur.com/ZUNgWGh.jpg)

##### Can be created with one **iCSR.Me** statement:

```javascript
            iCSR.Me({
                Fields: {
                  "Priority":{
                    View : iCSR.Priority
           }});
```

##### or customized further with:

```javascript
            iCSR.Me({
                Fields: {
                  "Priority":{
                    View : iCSR.Priority({
                            colors: ['red','yellow','green'],
                            output : '<span>[svgcircle(20)]</span>'
                        })
           }}});
```

![](http://i.imgur.com/pOMU6YW.jpg)  

##### Default iCSR templates 'DueDate' , 'PercentComplete' , 'Priority' & 'Status'

##### can customize the whole View

![](http://i.imgur.com/oxedw2u.jpg)

## ![](http://th.downloadblog.it/h57RNZTWa_IIoH3Y9fs71eZKLwI=/64x64/http://media.downloadblog.it/e/e64/steve-jobs-apple.jpg) oh.. and one more thing.. ehm.. line of code..

        iCSR.edit = true; // which is the default setting

##### Makes fields fully interactive in Views... who needs Forms?

![](http://i.imgur.com/TKbGDpS.jpg)

## Installation & Usage

1. ##### Install and learn to use the [Cisar Chrome extension](https://chrome.google.com/webstore/detail/cisar/nifbdojdggkboiifaklkamfpjcmgafpo?hl=en) (*developed by Andrei Markeev*)

2. ##### Add [iCSR.js](./icsr.js) to your Site Collection Style Library  (*or reference the demo library for a quick start*)

3. ##### Use the [iCSR-Templates](iCSR-Templates.md)

4. ##### Or create your own Template:

The new [Office365 Microsoft Planner](http://www.learningsharepoint.com/2016/01/27/10-things-to-know-about-office-365-planner/) breaks Tasks in 4 States:

    0. Not Started (yellow)
    1. Late (red)
    2. In progress (blue)
    3. Completed (green)

##### To add an iCSR Template with the same Planner colorscheme for a standard SharePoint Tasks list:

            "DueDate" : {
                          View: iCSR.Planner
                        }

![](http://i.imgur.com/VFwkN2L.jpg)

## The ONLY code required is:

```javascript
	iCSR.Template('Planner', function (ctx) {
                                    this.color = '[msBlue]';
                                    if (this.days < 0) this.color = '[msRed]';
                                    if (this.Item.Status === 'Not Started') this.color = '[msYellow]';
                                    if (this.Item.Status === 'Completed') this.color = '[msGreen]';
                                },
                                    {
                                        colortag:'TR'
                                    }
	);
```

Notes:
* JavaScript not optimized and kept as short as possible for example purpose
* the [Office365 Microsoft Planner](http://www.learningsharepoint.com/2016/01/27/10-things-to-know-about-office-365-planner/) colors are predefined by iCSR.js as iCSR Tokens
* iCSR **[tokens]** available for Templates can be viewed by typing ``ic`` in the F12 Dev console
* iCSR corrects the contrast textcolor for background colors (beige on msRed)
* iCSR does all pre-configuration and execution for you:
  * so '*this*' refers to one ListItem Due Date
  * contains all the information about that Item ( *this.Item* )
  * and Today calculations you (may) want to use ( *this.days* )
  * just like regular SharePoint CSR code you get the ```ctx`` object as parameter
  * *this.output* ,

  *not needed in this code, because it uses the default setting:*

        "<div class='[Class]' style='background:[color];color:[textcolor]'>[value]</div>"

  * is parsed by iCSR to create valid HTML; which is then displayed by SharePoint


## Tracing what iCSR does
iCSR source-code is broken up in generic descriptive functions to be used in your custom fields.

Making learning JavaScript hopefully a bit easier.

iCSR has multiple (configurable) levels of console.log traces that can be activated with:

        iCSR.traceon( 3 , true ); // tracelevel:0-5 , clear console


![](http://i.imgur.com/NkVJTL7.jpg)

## License

<a rel="license" href="http://creativecommons.org/licenses/by/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by/4.0/88x31.png" /></a><br /><span xmlns:dct="http://purl.org/dc/terms/" property="dct:title">iCSR.js</span> by <a xmlns:cc="http://creativecommons.org/ns#" href="https://365CSI.nl" property="cc:attributionName" rel="cc:attributionURL">365CSI</a> is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International License</a>.<br />Based on a work at <a xmlns:dct="http://purl.org/dc/terms/" href="http://iCSR.github.io" rel="dct:source">http://iCSR.github.io</a>.

#### In normal words:
* CC: You are allowed to use this library for **all** (including commercial) purposes
* BY: You may **not** remove the attribution from the source-code
* That's it

## Version History

* 1.0 - public release february 1st 2016
* 1.1 - not made public
* 1.2 - friday february 5th
    * simplified ``iCSR.Me`` usage (javascript .bind notation is no longer needed)
    * enhanced [token] replace functionality
    * Progressbar now has a reset to 0 on mouseover
* 1.3 / 1.4 - had so much fun with new functionality I never pushed them
* 1.5 - february 10th
    * major color enhancements
    * added ``rowcolor`` and ``cellcolor`` options
    * with automatic calculation of contrasting text-colors
    * added more inspectors (type **ic** in developer-console)
* 1.9 - march 4th
    * Planner Template matching the new Microsoft Planner
    * bugfixes
    * under the hood optimizations
    * added [JSLinkManager](http://icsr.github.ion/JSLinkManager) as seperate Bookmarklet
    * icColors inspector in console
* 1.9.9 - march 18th
    * Performance enhancments
    * Xhr module
    * 2.0 preparation
* 2.0 - april 10th - complete rewrite
    * token separators are now || instead of []
    * split into Core and Templates files
    * the minified Core is 3 KB
* 2.1 - april 15th
    * internal code changes to deal with Microsofts New Library View in the future

----------

Amsterdam, february 2016

:email: [Danny Engelman](mailto:danny@engelman.nl)

![](http://i.imgur.com/TKbGDpS.jpg)

## More CSR /JSLink blogs

* (aug 2014) - [Client Side Rendering: List Views](http://www.codeproject.com/Articles/620110/SharePoint-Client-Side-Rendering-List-Views) - Andrei Markeev

* (aug 2014) - [Client Side Rendering: List Forms](http://www.codeproject.com/Articles/610259/SharePoint-Client-Side-Rendering-List-Forms) - Andrei Markeev

* (jan 2016) - [CSR overrides in detail](http://josharepoint.com/2016/01/14/sharepoint-2013-client-side-rendering-register-templates-overrides-in-detail/) - José Quinto

* (aug 2013) - [JSLink and Display Templates](http://www.martinhatch.com/2013/08/jslink-and-display-templates-part-1.html) -Martin Hatch

* (dec 2012) - [SP 2013: Using the JSLink property to change the way your field or views are rendered in SharePoint 2013](https://zimmergren.net/sp-2013-using-the-spfield-jslink-property-to-change-the-way-your-field-is-rendered-in-sharepoint-2013) - Tobias Zimmergren

* (dec 2012) - [SP 2013: Measuring performance on the JSLink property in SharePoint 2013](https://zimmergren.net/sp-2013-measuring-performance-on-the-jslink-property-in-sharepoint-2013) - Tobias Zimmergren

* (jul 2013) - [5 facts about JSLink you might not know](http://sharepoint-community.net/profiles/blogs/5-facts-about-jslink-in-sharepoint-2013-you-might-not-know) - Anton Vishnyakov

* (may 2015) - [CSS registration & ScriptLink done the right way](http://yakovenkomax.com/cssregistration-and-scriptlink-done-the-right-way/) - Max Yokavenko

##### SOD - Script On Demand

* (feb 2013) - [SP-SOD How to use correctly](http://sharepoint.stackexchange.com/questions/58503/sp-sod-how-to-use-correctly) - Hugh Wood

##### MDS - Minimal Download Strategy

* (sep 2013) - [Minimal Download Strategy overview](https://msdn.microsoft.com/en-us/library/office/dn456544(v=office.15).aspx) - MSDN

* (oct  2013) - [The correct way to execute JavaScript](http://www.wictorwilen.se/Tags/MDS) - Wictor Wilén
* (aug 2012) - [Introduction to MDS](http://www.wictorwilen.se/sharepoint-2013---introduction-to-the-minimal-download-strategy-mds) - Wictor Wilén

##### JavaScript

* (mar 2016) - [You don't know JS about SharePoint mastering JS Performance](http://www.slideshare.net/Rencore/you-dont-know-js-about-sharepoint-mastering-javascript-performance-hugh-wood) - Hugh Wood

## Support Tools

* BookMarklet [iCSR Link Manager](https://365csi.nl/icsr/linkmanager.html)
update JSLink settings on WebParts & Views, deploy JS files to Style Library

* (Chrome Browser Extension) [Cisar](https://chrome.google.com/webstore/detail/cisar/nifbdojdggkboiifaklkamfpjcmgafpo?hl=en)
Edit CSR files with Live Updating

* (Chrome Browser Extension) [Chrome SP Editor](https://chrome.google.com/webstore/detail/chrome-sp-editor/ecblfcmjnbbgaojblcpmjoamegpbodhd/related?hl=en)
Edit SharePoint files, add ScriptLinks to SiteCollection/Webs, manage Web Property Bag

* ASPX Page [UserCustomActions](https://github.com/johnnliu/UserCustomActionsConfigPage)
