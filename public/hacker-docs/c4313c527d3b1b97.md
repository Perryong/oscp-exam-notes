
- Utilize some of the techniques mentioned in this section to identify the vulnerable input parameter found in the above server. What is the name of the vulnerable parameter?
	- **email**



I went to the target URL and gave the necessary info and their is email input validation done so we need to provide the `@` symbol otherwise email input will be shown invalid. After giving the details I went to Network tab (DevTools) and copied the below URL. 

`http://83.136.252.32:54597/?fullname=test&username=test&password=123&email=test@test.com`

So we are going to use this URL to perform XSS Automation Discovery first using `XSStrike`.

```bash
python3 xsstrike.py -u "http://83.136.252.32:54597/?fullname=test&username=test&password=123&email=test@test.com"
```

After running the above command I found out that `email` parameter is vulnerable.


- What type of XSS was found on the above server? "name only"
	- **Reflected**


