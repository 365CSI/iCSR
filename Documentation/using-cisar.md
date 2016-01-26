# CSR development with Cisar Chrome extension

The free [**Cisar Chrome extension**](https://chrome.google.com/webstore/detail/cisar/nifbdojdggkboiifaklkamfpjcmgafpo?hl=en) was developed by [Adrey Markeev](http://sharepoint.stackexchange.com/users/1430/andrey-markeev)

It makes creating CSR files and JSlink connections a breeze.

Notes:

* Cisar writes files to the ``~sitecollection/style library``
So you need Write access to that Library (a Site Collection Owner has access and give access)


## Your first CSR file

 1. Use the Chrome Browser (*No support for FireFox or Microsoft Internet Explorer yet*)
 2. Install the [**Cisar Chrome extension**](https://chrome.google.com/webstore/detail/cisar/nifbdojdggkboiifaklkamfpjcmgafpo?hl=en)
 3. Close the F12 Developer Tools Console (if open at all)
 4. Browse to a Task List View
 5. Open F12 Developer Tools
 6. Select the **Cisar** Tab
   ![](http://i.imgur.com/X13jT80.jpg)

Now the cool stuff happens
*I have been in this Internet business for 26 years... If I use the word cool .. it IS cool*

 1. Click to add a file
 ![](http://i.imgur.com/Q6mKvhB.jpg)
 2. Give it a filename (*by default all files are stored in /style library/*)
 3. And then its almost magic
**Cisar will analyse the View and built a CSR Template**
 4. All you have to add is your JavaScript logic
 5. On every change you make in Cisar the View will update,
No Save, No reload required
**now that is cool Live coding** (*eat your heart out Visual Studio*)

## Using the iCSR library in your CSR file

The iCSR library must be loaded **before** your CSR code.