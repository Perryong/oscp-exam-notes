
- Enumerate all ports and their services. One of the services contains the flag you have to submit as the answer.
	- **HTB{redacted}**


Performing service scan on the target system. `nmap` by default will perform `SYN` can on top TCP 1000 ports.
- `-sV` performs the service scanning.
- `-T4` increase the scan aggression level or speed.

```bash
$ sudo nmap -sV 10.129.35.205 -T4
```



