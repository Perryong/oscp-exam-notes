
## DNS

- Domain Name Server (DNS)
- Helps to translate Domain Name to IP Address.

### How DNS works

- **DNS query** : When the domain name is entered the computer first checks its memory(cache) to see if it remembers it. If it doesn't remember it reaches the DNS resolver, usually provided by the Internet Service Provider(ISP).
	|
- **Recursive lookup** : The Resolver also has a cache, if it doesn't find the IP there then it starts journey to the DNS hierarchy.
	
- **Root Server** : The root server doesn't know the exact address but able to find out the Top Level Domain(TLD) (eg: .com, .edu).
	 
- **Authoritative Name Server** : The authoritative name server is the final stop as it has the exact IP address of the requested domain. It sends it back to the resolver.
	
- **Connection** : Our DNS resolver brings back the IP address and our computer caches it, incase we visit the website again soon. Now that our computer knows the IP address of the domain, we are able to directly connect to the web server hosting the website.  


### Types of DNS records

| Record Type | Description                                                           |
| ----------- | --------------------------------------------------------------------- |
| A           | Maps a hostname to an IPv4 address.                                   |
| AAAA        | Maps a hostname to an IPv6 address.                                   |
| CNAME       | Creates an alias for a hostname, pointing it to another hostname.     |
| MX          | Specifies mail servers responsible for handling email for the domain. |
| NS          | Delegates a DNS zone to a specific authoritative name server.         |
| TXT         | Stores arbitrary text information.                                    |
| SOA         | Contains administrative information about a DNS zone.                 |

---
## The Hosts file

- A simple text file.
- Contains mapping of hostnames(a human readable name) with their corresponding IP addresses.
- Used for testing, development purposes to add hostnames, ip addresses not present in public.
- Used for manual DNS resolution.
- To edit hosts file you need `root` privileges.

---
## Why DNS Matters for Web Recon

- Can reveal subdomains, mail servers, name server records.
- Can help reveal Network Infrastructure and understand traffic flow and other endpoints.
- Can reveal other types of DNS records.

---
## Subdomains

- Extension of the main domain. eg : if domain is `example.com`, subdomain could be `help.example.com`. Part of the main website but just an extension.
- Subdomains can have hidden login portals or sensitive information. So subdomain enumeration is essential in web pentesting.

---
## Zone Transfers

- The process of copying all the DNS records within a zone (a domain and its subdomains) from one name server to another name server.
- This maintains consistency and redundancy across other zones.
- Zone Transfers are not entirely secure so if someone intercepts these zone transfers, it might reveal subdomain records, and other DNS information of the organization/website.


### Zone Transfer Process

- **AXFR** -> Full Zone Transfer type. The secondary server makes a full zone transfer request to the primary server.
- **SOA Record Transfer** -> The primary server upon receiving the request responds with a SOA record containing vital info about the zone, its serial number.
- **DNS records transmission** -> The primary server transfers all the DNS records in the zone to the secondary server, one by one like A, AAAA, MX, CNAME, NS .etc. Once, all the data is transferred the primary server sends a signal to the secondary server indicating completion of zone transfer.
- **ACK** -> The secondary server sends acknowledgement message to primary server.

---
## Virtual Hosts

- It is the method where a web server hosts multiple websites by configuring one machine to host several domain names.
- This allows multiple domain names or websites to run on a single, physical web server.
- The difference between subdomains and virtual hosts is that vhosts is a method where different websites which are not related to each other are hosted by a single web server. Subdomains are just an extension of the main domain/website.
- Although, sometimes virtual hosting and subdomains can be the same.

### Server VHost Lookup

- When we make a request, our browser attaches the hostname in our HTTP request's host header.
- The web server receives the request and examines the host header and then consults with the Virtual Host Configuration to find a matching entry for the requested domain name.

### Types of Virtual Hosting

- **Name Based Virtual Hosting** -> Web server distinguishes domains/websites based on Host header attached in the HTTP request.
- **IP-Based Virtual Hosting** -> Unique IP address is assigned to each website hosted on the web server.
- **Port based Virtual Hosting** -> Websites/domains have same IP address but hosted on different ports.

---
## Questions and Solutions


- Which IP address maps to inlanefreight.com?
	- **134.209.24.248**


```bash
dig inlanefreight.com
```


- Which domain is returned when querying the PTR record for 134.209.24.248?
	- **inlanefreight.com**


```bash
dig -x 134.209.24.248
```


- What is the full domain returned when you query the mail records for facebook.com?
	- **smtpin.vvv.facebook.com**


```bash
dig facebook.com MX
```


- Using the known subdomains for inlanefreight.com (www, ns1, ns2, ns3, blog, support, customer), find any missing subdomains by brute-forcing possible domain names. Provide your answer with the complete subdomain, e.g., www.inlanefreight.com.
	- **my.inlanefreight.com**


```bash
dnsenum --enum inlanefreight.com -f /usr/share/seclists/Discovery/DNS/subdomains-top1million-20000.txt
```


- After performing a zone transfer for the domain inlanefreight.htb on the target system, how many DNS records are retrieved from the target system's name server? Provide your answer as an integer, e.g, 123.
	- **22**

The name server IP will be provided when you spawn the machine. Make the zone transfer query to that DNS server and the domain is `inlanefreight.htb`

```bash
dig +short axfr @10.129.235.65 inlanefreight.htb | wc -l
```


- Within the zone record transferred above, find the ip address for ftp.admin.inlanefreight.htb. Respond only with the IP address, eg 127.0.0.1
	- **10.10.34.2**

- Within the same zone record, identify the largest IP address allocated within the 10.10.200 IP range. Respond with the full IP address, eg 10.10.200.1
	- **10.10.200.14**

The above two questions can be solved by checking the output produced by the below command.

```bash
dig axfr @10.129.235.65 inlanefreight.htb
```


- Brute-force vhosts on the target system. What is the full subdomain that is prefixed with "web"? Answer using the full domain, e.g. "x.inlanefreight.htb"
	- **web17611.inlanefreight.htb**


- Brute-force vhosts on the target system. What is the full subdomain that is prefixed with "vm"? Answer using the full domain, e.g. "x.inlanefreight.htb"
	- **vm5.inlanefreight.htb**


- Brute-force vhosts on the target system. What is the full subdomain that is prefixed with "br"? Answer using the full domain, e.g. "x.inlanefreight.htb"
	- **browse.inlanefreight.htb**


- Brute-force vhosts on the target system. What is the full subdomain that is prefixed with "a"? Answer using the full domain, e.g. "x.inlanefreight.htb"
	- **admin.inlanefreight.htb**


- Brute-force vhosts on the target system. What is the full subdomain that is prefixed with "su"? Answer using the full domain, e.g. "x.inlanefreight.htb"
	- **support.inlanefreight.htb**



The above five questions are solved by analyzing the output generated by the below command. But first add the IP address with `inlanefreight.htb` in the `/etc/hosts` file. You can use `ping` command to check if connection can be established with it after adding it to `/etc/hosts` file for verification.

```bash
gobuster vhost -u http://inlanefreight.htb:37680 -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-2000.txt --append-domain
```


