
- Use NSE and its scripts to find the flag that one of the services contain and submit it as the answer.
	- **HTB{redacted}**

Running `-sC` which runs the default scripts present in `nmap` script engine.
- `-sV` for service scan.
- `--script` uses the `nmap` script engine.
- `vuln` These scripts check for specific known vulnerabilities and generally only report results if they are found.
- `-T4` increases scan aggression/speed.

```bash
$ sudo nmap -sV --script vuln 10.129.35.205 -T4
```

