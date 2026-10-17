

## Parameter and Value Fuzzing

- This technique involves manipulating the parameters and its values.
- We can alter parameter values. For eg:- If there is a product and we get its id we can query based on the produce => parameter and its value to get info about the product.
- Injection of malicious code and finding hidden features .etc.
- Helps us uncover vulnerabilities of the application and how it works.

## GET Parameters and Values

Below is how we setup multiple parameters and values in GET request.

```http
https://example.com/search?query=fuzzing&category=security
```

## POST request and Values

```http
POST /login HTTP/1.1
Host: example.com
Content-Type: application/x-www-form-urlencoded

username=your_username&password=your_password
```

---
## Questions and Solutions

- What flag do you find when successfully fuzzing the GET parameter?
	- **HTB{redacted}**

If you read the module we are already given the parameter. We just need to find the value. I am used `wenum` command to perform the parameter and value fuzzing.

```bash
wenum -w /usr/share/seclists/Discovery/Web-Content/common.txt --hc 404 403 -u "http://83.136.252.32:44484/get.php?x=FUZZ"
```

You will get a `200` status code at the `http://83.136.252.32:44484/get.php?x=OA_HTML` URL. I used `cURL` after this to make a GET request in this URL.

```bash
curl http://83.136.252.32:44484/get.php?x=OA_HTML
```


- What flag do you find when successfully fuzzing the POST parameter?
	- **HTB{redacted}**


The POST request parameter name and the file path where we need to make the request is already mentioned in the module, so read it. After reading that perform POST request using `ffuf`.

```bash
ffuf -u http://83.136.252.32:44484/post.php -X POST -H "Content-Type: application/x-www-form-urlencoded" -d "y=FUZZ" -w /usr/share/seclists/Discovery/Web-Content/common.txt -mc 200 -v
```

After executing the above command, `ffuf` will return the word using which it got `200` response from the target. Hence, we will be able decide which one is our POST request data. We will then use `cURL` to make the POST request and get our flag.

```bash
curl -d "y=SUNWmc" http://83.136.252.32:44484/post.php
```

