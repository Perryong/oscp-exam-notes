## Footprinting the Service

```bash
nmap -p53 -Pn -sV -sC <TARGET_IP>
```

## Name Server Query

```bash
dig ns <DOMAIN NAME> 
```

**OR**

- You can specifically ask a **Authoritative Name Server** using `@<IP>` like -> `dig ns example.com @1.1.1.1`

```bash
dig ns <DOMAIN NAME> @<AUTHORITATIVE NAME SERVER>
```

## Version Query

- Finding the DNS server version.
- This is only possible if the version info is present in the DNS server.

```bash
dig CH TXT version.bind <DNS SERVER>
```

## All DNS Records Query

- Gives info of all types of available DNS records.

```bash
dig any <DOMAIN NAME>
```

**OR**

- Specifically query a DNS server which may not be publicly available. 

```bash
dig any <DOMAIN NAME> @<AUTHORITATIVE NAME SERVER>
```

## AXFR Zone Transfer

- Performs Full Zone Transfer.
- Here you are asking for IPs, subdomains, addresses, mail servers .etc. related to the `DOMAIN_NAME` from the `NAME_SERVER` responsible for handling that `DOMAIN` of that zone.

```bash
dig axfr <DOMAIN NAME> @<AUTHORITATIVE NAME SERVER>
```

## Subdomain Enumeration

### Subdomain Passive Discovery

```bash
subfinder -d <DOMAIN_NAME> -v
```

### Subdomain Brute Forcing

```bash
dnsenum --dnsserver <DNS server IP> --enum -p 0 -s 0 -o <filename to save subdomains> -f <wordlist path> <domain name>
```

