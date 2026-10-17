
## Intercepting Web Requests

- BurpSuite intercepts web requests.
- We can also use BurpSuite to manipulate intercepted requests.

### Manipulated Intercepted Requests

Once we intercept the request, it will remain hanging until we forward it. We can examine the request, manipulate it to make any changes we want, and then send it to its destination. This helps us better understand what information a particular web application is sending in its web requests and how it may respond to any changes we make in that request. We can use this feature to pull off the below attacks.

1. SQL injections
2. Command injections
3. Upload bypass
4. Authentication bypass
5. XSS
6. XXE
7. Error handling
8. Deserialization


---
## Questions and Solutions

- Try intercepting the ping request on the server shown above, and change the post data similarly to what we did in this section. Change the command to read 'flag.txt'
	- **HTB{redacted}**

Go to the target website. Then in the input field provide the **localhost IP** `127.0.0.1`. Don't hit enter yet. First turn on the BurpSuite Intercepter ON and then Ping Your IP. You will receive the request body. Modify the **ip** value just like I have shown below.

### Manipulation of Request

![Img3](./Images/Img3.png)

After modification is done Click **Forward** to send the modified Request body to get the flag.

