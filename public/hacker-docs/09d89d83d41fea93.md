
- After the configurations are transferred to the system, our client wants to know if it is possible to find out our target's DNS server version. Submit the DNS server version of the target as the answer.
	- **HTB{redacted}**


```bash
$ sudo nmap -sU -sV -p 53 10.129.58.8 -vvv
```

| `-F`   | Scans top 100 ports.                                      |
| ------ | --------------------------------------------------------- |
| `-sU`  | **Performs a UDP scan.**                                  |
| `-sV`  | **Performs service version scan**                         |
| `-vvv` | **verbosity, adding more information of what's going on** |
| `-p`   | **specify a port**                                        |