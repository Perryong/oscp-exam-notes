
## HOW TO add `/etc/hosts`

```bash
<IP address>       <hostname>
```

---
## DNS Basic query

- Performs a default A record lookup for the domain.

```bash
dig <domain_name/IP>
```

## DNS query

- Shows all DNS types details.
- Some servers might ignore `ANY` to prevent load on abuse.

```bash
dig <domain_name/IP> ANY
```

## DNS type query

- Enter the Type of DNS record you want to query like A/AAA/MX/NS .etc.

```bash
dig <domain_name/IP>  <type of DNS record>
```

## DNS specific query

- Query about the domain on a specific name server because of DNS zones.

```bash
dig @<name server ip> <domain_name/IP>
```

## Reverse DNS lookup

- Gives the hostname associated with the IP address.

```bash
dig -x <IP>
```

---
## Subdomain Bruteforcing

### Recursive 

- After finding the subdomain tries to find subdomain of that subdomain (Recursive approach).

```bash
dnsenum --enum <domain_name/IP> -f <wordlist> -r
```

### Non Recursive

- Only tries to find subdomain of the main website/domain (Non Recursive approach).

```bash
dnsenum --enum <domain_name/IP> -f <wordlist>
```

---
## Zone Transfers

- Performs Full Zone Transfer (**AXFR**).

```bash
dig axfr @<DNS name server> <domain_name/IP>
```

---
## Virtual Hosts Bruteforcing (Name-Based)

- `append-domain` appends the word from the wordlist to the base domain name.
- `-t` to increase number of threads i.e. multiple requests are send to the web server at the same time. Don't keep the number too high or the scans might be incomplete.
- `-k` to ignore SSL/TLS certificate errors.
- `-o` to save output to a file.

```bash
gobuster vhost -u http://<domain_name>:<port> -w <wordlist> --append-domain
```

---
