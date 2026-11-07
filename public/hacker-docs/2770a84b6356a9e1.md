
## DNS

- DNS stands for Domain Name Server.
- Translates the human readable domain name of a website to the IP address.
- There are several types of DNS servers that are used worldwide:
	- DNS root server
	- Authoritative name server
	- Non-authoritative name server
	- Caching server
	- Forwarding server
	- Resolver


| **Server Type**                | **Description**                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DNS Root Server`              | The root servers of the DNS are responsible for the top-level domains (`TLD`). As the last instance, they are only requested if the name server does not respond. Thus, a root server is a central interface between users and content on the Internet, as it links domain and IP address. The [Internet Corporation for Assigned Names and Numbers](https://www.icann.org/) (`ICANN`) coordinates the work of the root name servers. There are `13` such root servers around the globe. |
| `Authoritative Nameserver`     | Authoritative name servers hold authority for a particular zone. They only answer queries from their area of responsibility. An **authoritative name server** holds the original, official DNS records for a domain and provides final, true answers.                                                                                                                                                                                                                                    |
| `Non-authoritative Nameserver` | a **non-authoritative name server** (usually a recursive or caching resolver) does not own the records and instead answers queries using temporarily stored data from a cache.                                                                                                                                                                                                                                                                                                           |
| `Caching DNS Server`           | Caching DNS servers cache information from other name servers for a specified period. The authoritative name server determines the duration of this storage.                                                                                                                                                                                                                                                                                                                             |
| `Forwarding Server`            | Forwarding servers perform only one function: they forward DNS queries to another DNS server.                                                                                                                                                                                                                                                                                                                                                                                            |
| `Resolver`                     | Resolvers are not authoritative DNS servers but perform name resolution locally in the computer or router.                                                                                                                                                                                                                                                                                                                                                                               |

## Types of DNS Records

| **DNS Record** | **Description**                                                                                                                                                                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `A`            | Returns an IPv4 address of the requested domain as a result.                                                                                                                                                                                      |
| `AAAA`         | Returns an IPv6 address of the requested domain.                                                                                                                                                                                                  |
| `MX`           | Returns the responsible mail servers as a result.                                                                                                                                                                                                 |
| `NS`           | Returns the DNS servers (nameservers) of the domain.                                                                                                                                                                                              |
| `TXT`          | This record can contain various information. The all-rounder can be used, e.g., to validate the Google Search Console or validate SSL certificates. In addition, SPF and DMARC entries are set to validate mail traffic and protect it from spam. |
| `CNAME`        | This record serves as an alias for another domain name. If you want the domain www.hackthebox.eu to point to the same IP as hackthebox.eu, you would create an A record for hackthebox.eu and a CNAME record for www.hackthebox.eu.               |
| `PTR`          | The PTR record works the other way around (reverse lookup). It converts IP addresses into valid domain names.                                                                                                                                     |
| `SOA`          | Provides information about the corresponding DNS zone and email address of the administrative contact and contains the Authoritative name server hostname of that zone.                                                                           |

## DNS Configurations

- All DNS servers work with 3 types of configuration files. They are :-
	- Local DNS configuration files
	- Zone files
	- Reverse name resolution files

- The DNS server local configuration file is `named.conf` in Linux Distributions. The configuration files are :-
	- `named.conf.local`
	- `named.conf.options`
	- `named.conf.log`

- Location for example :- `/etc/bind/named.conf.local`


### Dangerous Settings

|**Option**|**Description**|
|---|---|
|`allow-query`|Defines which hosts are allowed to send requests to the DNS server.|
|`allow-recursion`|Defines which hosts are allowed to send recursive requests to the DNS server.|
|`allow-transfer`|Defines which hosts are allowed to receive zone transfers from the DNS server.|
|`zone-statistics`|Collects statistical data of zones.

## Zone file

- A plain text file stored in the DNS server that acts as a blueprint for mapping domains with their corresponding IP addresses.
- Contains various types of DNS records. `A`, `AAAA`, `MX` ...etc...
- Can also contain subdomain and their corresponding IP addresses information.
- The zone file is typically stored inside the name server or Authoritative name server of that particular zone responsible for handling DNS queries of that particular zone.

## Zone Transfers

- The process of copying all the DNS records within a zone (a domain and its subdomains) from one name server to another name server.
- This maintains consistency and redundancy across other zones.
- Zone Transfers are not entirely secure so if someone intercepts these zone transfers, it might reveal subdomain records, and other DNS information of the organization/website.


### Zone Transfer Process

- **AXFR** -> Full Zone Transfer type. The secondary server makes a full zone transfer request to the primary server.
- **SOA Record Transfer** -> The primary server upon receiving the request responds with a SOA record containing vital info about the zone, its serial number.
- **DNS records transmission** -> The primary server transfers all the DNS records in the zone to the secondary server, one by one like A, AAAA, MX, CNAME, NS .etc. Once, all the data is transferred the primary server sends a signal to the secondary server indicating completion of zone transfer.
- **ACK** -> The secondary server sends acknowledgement message to primary server.


## DNS Spoofing / DNS Cache Poisoning

- Changing the domain's IP address record to point to a malicious server instead of the legitimate server.
- **EXAMPLE : **
	- An attacker could intercept the communication between a user and a DNS server to route the user to a fraudulent destination instead of a legitimate one by performing a Man-in-the-Middle (`MITM`) attack.
	- Exploiting a vulnerability found in a DNS server could yield control over the server by an attacker to modify the DNS records.
### Local DNS Cache Poisoning

- From a local network perspective, an attacker can also perform DNS Cache Poisoning using MITM tools like [Ettercap](https://www.ettercap-project.org/) or [Bettercap](https://www.bettercap.org/).

---
## Questions and Solutions

- Interact with the target DNS using its IP address and enumerate the FQDN of it for the "inlanefreight.htb" domain.
	- **ns.inlanefreight.htb**

```bash
$ dig ns inlanefreight.htb @10.129.11.147 +short
```

- Identify if its possible to perform a zone transfer and submit the TXT record as the answer. (Format: HTB{...})
	- **HTB{redacted}**

```bash
 dig axfr inlanefreight.htb @10.129.11.147                       

; <<>> DiG 9.20.11-4+b1-Debian <<>> axfr inlanefreight.htb @10.129.11.147
;; global options: +cmd
inlanefreight.htb.      604800  IN      SOA     inlanefreight.htb. root.inlanefreight.htb. 2 604800 86400 2419200 604800
inlanefreight.htb.      604800  IN      TXT     "MS=ms97310371"
inlanefreight.htb.      604800  IN      TXT     "atlassian-domain-verification=t1rKCy68JFszSdCKVpw64A1QksWdXuYFUeSXKU"
inlanefreight.htb.      604800  IN      TXT     "v=spf1 include:mailgun.org include:_spf.google.com include:spf.protection.outlook.com include:_spf.atlassian.net ip4:10.129.124.8 ip4:10.129.127.2 ip4:10.129.42.106 ~all"
inlanefreight.htb.      604800  IN      NS      ns.inlanefreight.htb.
app.inlanefreight.htb.  604800  IN      A       10.129.18.15
dev.inlanefreight.htb.  604800  IN      A       10.12.0.1
internal.inlanefreight.htb. 604800 IN   A       10.129.1.6
mail1.inlanefreight.htb. 604800 IN      A       10.129.18.201
ns.inlanefreight.htb.   604800  IN      A       127.0.0.1
inlanefreight.htb.      604800  IN      SOA     inlanefreight.htb. root.inlanefreight.htb. 2 604800 86400 2419200 604800
;; Query time: 315 msec
;; SERVER: 10.129.11.147#53(10.129.11.147) (TCP)
;; WHEN: Mon Jan 26 08:53:12 EST 2026
;; XFR size: 11 records (messages 1, bytes 560)
```

Now in the HINT it is specified that **"zones often have name of a subdomain"** so from the subdomains i.e.

- `app.inlanefreight.htb`
- `dev.inlanefreight.htb`
- `internal.inlanefreight.htb`
- `mail1.inlanefreight.htb`

I tried to perform **zone transfer** in each on of them but I failed except for the `internal.inlanefreight.htb`

```bash
$ dig axfr internal.inlanefreight.htb @10.129.11.147

; <<>> DiG 9.20.11-4+b1-Debian <<>> axfr internal.inlanefreight.htb @10.129.11.147
;; global options: +cmd
internal.inlanefreight.htb. 604800 IN   SOA     inlanefreight.htb. root.inlanefreight.htb. 2 604800 86400 2419200 604800
internal.inlanefreight.htb. 604800 IN   TXT     "MS=ms97310371"
internal.inlanefreight.htb. 604800 IN   TXT     "HTB{redacted}"
internal.inlanefreight.htb. 604800 IN   TXT     "atlassian-domain-verification=t1rKCy68JFszSdCKVpw64A1QksWdXuYFUeSXKU"
internal.inlanefreight.htb. 604800 IN   TXT     "v=spf1 include:mailgun.org include:_spf.google.com include:spf.protection.outlook.com include:_spf.atlassian.net ip4:10.129.124.8 ip4:10.129.127.2 ip4:10.129.42.106 ~all"
internal.inlanefreight.htb. 604800 IN   NS      ns.inlanefreight.htb.
dc1.internal.inlanefreight.htb. 604800 IN A     10.129.34.16
dc2.internal.inlanefreight.htb. 604800 IN A     10.129.34.11
mail1.internal.inlanefreight.htb. 604800 IN A   10.129.18.200
ns.internal.inlanefreight.htb. 604800 IN A      127.0.0.1
vpn.internal.inlanefreight.htb. 604800 IN A     10.129.1.6
ws1.internal.inlanefreight.htb. 604800 IN A     10.129.1.34
ws2.internal.inlanefreight.htb. 604800 IN A     10.129.1.35
wsus.internal.inlanefreight.htb. 604800 IN A    10.129.18.2
internal.inlanefreight.htb. 604800 IN   SOA     inlanefreight.htb. root.inlanefreight.htb. 2 604800 86400 2419200 604800
;; Query time: 327 msec
;; SERVER: 10.129.11.147#53(10.129.11.147) (TCP)
;; WHEN: Mon Jan 26 08:54:34 EST 2026
;; XFR size: 15 records (messages 1, bytes 677)
```


- What is the IPv4 address of the hostname DC1?
	- **10.129.34.16**


- What is the FQDN of the host where the last octet ends with "x.x.x.203"?
	- **10.12.3.203**


```bash
$ dnsenum --dnsserver 10.129.11.147 --enum -p 0 -s 0 -o subdomains.txt -f /usr/share/wordlists/seclists/Discovery/DNS/fierce-hostlist.txt dev.inlanefreight.htb
```