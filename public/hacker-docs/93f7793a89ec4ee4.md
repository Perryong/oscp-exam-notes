
Checkout various command shortcuts and filtering of outputs in the `commands.md` file located in this folder only.

- What flag do you find when successfully fuzzing the POST parameter?
	- **HTB{redacted}**


```bash
ffuf -u http://83.136.248.107:43126/post.php -X POST -H "Content-Type: application/x-www-form-urlencoded" -d "y=FUZZ" -w /usr/share/seclists/Discovery/Web-Content/common.txt -mc 200 -v
```

You will get a status code of `200` response which will contain the POST request value. You need to make another POST request using this value. I am going to be using `cURL` to send that POST request.

```bash
curl -d "y=SUNWmc" http://83.136.248.107:43126/post.php
```



