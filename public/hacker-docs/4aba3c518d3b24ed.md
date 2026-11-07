
## Proxy Tools

- Acts as a intermediary between the server and client.
- Intercepts HTTP/HTTPS requests.
- **Proxychains** is one such tool which is used to route all traffic from any command line tool to any proxy we specify.


---
## Questions and Solutions

- Try running 'auxiliary/scanner/http/http_put' in Metasploit on any website, while routing the traffic through Burp. Once you view the requests sent, what is the last line in the request?
	- **msf test file**


Start metasploit using `msfconsole` command and use the mentioned script in the question and set the below necessary configurations before execution of the script. Before running the script remember to turn on the Intercepter in BurpSuite. 

```bash
use auxiliary/scanner/http/http_put
set PROXIES HTTP:127.0.0.1:8080
set RHOSTS https://www.google.com
set RPORT 8080
run
```

In the above script you can give any website. Now check the request intercepted by BurpSuite below.

![Img1](./Img1.png)



