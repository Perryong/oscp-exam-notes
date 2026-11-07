
## Virtual Hosting Fuzzing

- `append-domain` appends the word from the wordlist to the base domain name.
- `-t` to increase number of threads i.e. multiple requests are send to the web server at the same time. Don't keep the number too high or the scans might be incomplete.
- `-k` to ignore SSL/TLS certificate errors.
- `-o` to save output to a file.

```bash
gobuster vhost -u http://<domain_name>:<PORT> -w <wordlist> --append-domain
```

## Subdomain Fuzzing

- appends a word from the wordlist with the target domain/IP and then makes DNS queries. If subdomain resolves to an IP address, it is considered valid and included in the output.
- mentioning port is not required because requests are made directly to the DNS server.

```bash
gobuster dns -d <domain_name/IP> -w <wordlist> 
```

