
## HTTP Authorization

Sometimes when trying to access a certain webpage we require credentials, like username and password. Otherwise, we will not be allowed access if we directly try to enter that certain webpage. For this, we can use the `-u` switch in `curl` to provide username and password (credentials). Below is the example.

```bash
curl -d admin:admin http://example.com
```

## HTTP Authorization Header

**The HTTP Authorization Header** [request header](https://developer.mozilla.org/en-US/docs/Glossary/Request_header) can be used to provide credentials that authenticate a user agent with a server, allowing access to protected resources. We can use the `-v` switch and find out there is a **HTTP Authorization Header** in the HTTP Request section after we pass our real credentials.  Below is the example.

```bash
curl -H 'Authorization: Basic YWRtaW46YWRtaW4=' http://example.com
```

---
## Questions and Solutions

- The exercise above seems to be broken, as it returns incorrect results. Use the browser devtools to see what is the request it is sending when we search, and use cURL to search for 'flag' and obtain the flag.
	- **HTB{redacted}**



The login credentials for the LOGIN Page.
- **username = admin**
- **password = admin**

After logging in open the devtools and search something in the input field present in the website and look for a new request made by opening the Network tab. Carefully analyze the request and its headers. Basically you need to include the **HTTP Authorization Header** present in the Request section and add a query string.

```bash
$ curl -H 'Authorization: Basic YWRtaW46YWRtaW4=' 94.237.122.36:41768/search.php?search=flag
HTB{redacted}
```


