# How iCSR came to be

With the release of Office365 SharePoint Online and the App model my old front-end heart lightened up.
Although I did .ASP development in the previous century, SharePoint .Net development never made sense to me.

To me SharePoint was (and is) a box of Lego bricks.
Tinkering with the back-end is like taking a blow-torch to re-shape your new Corvette, you should only do that when your name is Foose.

#### What is Client Side Rendering

In the old days all website pages were built on the Server, then delivered the whole page to Client.

With modern technologies the Server deliveres data and layout information to the Client. **Then the Client Renders the data in the Browser**

This saves loads of work server-side, and more important allows the Client to much more dynamic (using Ajax & SPA technologies) No more *click-and-wait-till-a-new-page-is-loaded*

##### Terms and Technologies

* CSR - Client Side Rendering - **all** coding where JavaScript renders information on Client **Views & Forms**
* CSR file - one .js file with CSR code
* Display Templates - CSR technology used to change the display of **Webparts** (mainly used for Search Dsiplay Templates)
* JSlink - The Link on a WebPart, Field or View to a CSR file

On the Web you will see the terms CSR and JSlink (incorrectly) used interchangebly. A JSlink can point to a non-CSR (but executing JavaScript code) file.

#### The ViewMaster365 Add-in

In 2014 I developed the [ViewMaster365 App](http://ViewMaster365.com) to enhance the standard Task list **Views** with interactivity. (*Microsoft now uses the name 'Add-ins' for SharePoint 'Apps'*)

But with 3 sales in 14 months time it did not attract [much attention](http://i.imgur.com/erOISIe.jpg)

I wrote the [OfficeAppCoach.com](http://officeappcoach.com/) to monitor new Apps in the [Office Store](https://store.office.com/). With 15 to 20 new Apps a week (most of them trial junk) you can not say it is popular.

#### Getting into CSR (Client Side Rendering) development

Alas the generic topic *JavaScript development* makes CSR information hard to find in Google.

Andrei Markeev has by far [the best blogposts](http://www.codeproject.com/Articles/amarkeev#Article) on the topic. And wrote the **cool** [**Cisar Chrome extension**](https://chrome.google.com/webstore/detail/cisar/nifbdojdggkboiifaklkamfpjcmgafpo?hl=en) (*I have been in this Internet business for 26 years; when I say cool it  **is** cool*)

The [blogposts on MSDN](https://code.msdn.microsoft.com/sharepoint/Client-side-rendering-JS-2ed3538a) you are bound to find demonstrate, to be honest, sometimes too sloppy coding.

On [StackExchange/SharePoint](http://sharepoint.stackexchange.com/) the [number of CSR questions](http://sharepoint.stackexchange.com/search?tab=newest&q=csr) is disappointing. In the 6 months I have been [active](http://sharepoint.stackexchange.com/users/32871/danny-engelman) on this platform I have seen about a dozen serious questions (and answers)

The Microsoft, now open-source initiative, [PnP - Patterns and Practives](http://dev.office.com/patterns-and-practices) seems to be aimed at .Net developers, and more aimed at back-end & deployment development.

And the gurus have moved on to the *latest and greatest* : [ngOfficeUIFabric](https://github.com/ngOfficeUIFabric/ng-officeuifabric).
They are busy writing [Angular 2.0 (beta)](https://angular.io/) Directives in [Typescript](http://www.typescriptlang.org/) only.

Even with my 20 years of JavaScripting experience, CSR took some time to learn

## Mix the IKEA and Lego concepts

With the above experiences in mind I rewrote my ViewMaster365 codebase and made it open source.

These **Development principles** where crucial:

* Usable for novice user (minimal amount of coding)
* Usable for developers wanting to learn more JavaScript
* No dependencies on other libraries (*yes, there is life without jQuery, Bootstrap or Angular*)
* Entry level coding (*Yes, this means code **re-usablity** prevails over performance*)
* Microsoft no longer supports IE9, so neither do I

