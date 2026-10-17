
## POST

- Unlike GET request POST request sends the data in HTTP Request body.
- POST requests are send in encoded form. They are sent in Request body because large files need to be sent and it would not be efficient to send them in URL.


## JSON

- Java Script Object Notation(JSON).
- A format for storing and transferring data.
- Used to send data from client to server or vice-versa.
- Data stored in `{key:value}` pair format.


---
## Questions and Solutions

- Obtain a session cookie through a valid login, and then use the cookie with cURL to search for the flag through a JSON POST request to '/search.php'
	- **"flag: HTB{redacted}"**


**username = admin**
**password = admin**

Login to the page using the above credentials. Open the DevTools -> Network Tab. Make a random request in the input field and notice there is POST request made by a search.php file. Check the Cookies and Request tab. Copy the **Cookie** and check the way the data is taken which should be in `{key:value}` format which is **JSON** format.

Now make the request using `curl` after copying the **Set-Cookie** value to get the flag.

```bash
$ curl -X POST -d '{"search":"flag"}' -b 'PHPSESSID=rm63l0bn1i5cnd8tdtdbp7bfd1' -H 'Content-Type: application/json' 83.136.249.223:30703/search.php 
["flag: HTB{redacted}"]
```
