
## Virtual Hosting

- A method where multiple domains or websites are hosted by the same physical web server.
- In virtual hosting each domain is differentiated by the web server based on their hostname which is attached in the HTTP request.
- The web server matches the host header name with the virtual hosts configuration file.
- Vhosts can have same IP address but have different hostnames.

---
## Questions and Solutions

- Using GoBuster against the target system to fuzz for vhosts using the common.txt wordlist, which vhost starts with the prefix "web-"? Respond with the full vhost, eg web-123.inlanefreight.htb.
	- **web-beans.inlanefreight.htb**

First add the IP address of the machine you spawned with the domain name `inlanefreight.htb` in the `/etc/hosts` file. Then start vhost fuzzing using `gobuster` as shown below.

```bash
gobuster vhost -u http://inlanefreight.htb:44869 -w /usr/share/seclists/Discovery/Web-Content/common.txt --append-domain
```


- Using GoBuster against inlanefreight.com to fuzz for subdomains using the subdomains-top1million-5000.txt wordlist, which subdomain starts with the prefix "su"? Respond with the full vhost, eg web.inlanefreight.com.
	- **support.inlanefreight.com**

```bash
gobuster dns -d inlanefreight.com -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt
```