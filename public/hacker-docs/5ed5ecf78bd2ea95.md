
## Scanned Ports states

- There are 6 states of scanned ports when scanned using `nmap`. They are :-
	- `open` -> connection to the scanned port has been established.
		
	- `closed` -> port is reachable but the application is not accepting requests on that particular port so **RST** flag is returned.
		
	- `filtered` -> `nmap` cannot determined whether the port is open or closed because no response is returned from the target.
		
	- `unfiltered` -> port is reachable but whether port is open or closed cannot be determined.
		
	- `open|filtered` -> when no response received from a particular port. Indicates a **firewall** or packet filter protecting the port.
		
	- `closed|filtered` -> indicates that the scanned port is either closed or filtered by firewall.



## Connect Scan

- `nmap` connect scan uses `-sT` switch to perform it.
- Connect Scan does three-way handshake to determine if a target port is open or filtered.
- If target responds with `SYN-ACK` then port is open.
- If target responds with `RST` then port is closed.

---
## Questions and Solutions

-  Find all TCP ports on your target. Submit the total number of found TCP ports as the answer. 
	- **7**

The below command performs `nmap` default scan i.e. `-sS` stealth scan which scans 1000 TCP ports.

```bash
$ sudo nmap 10.129.117.114 
```

- Enumerate the hostname of your target and submit it as the answer. (case-sensitive)
	- **NIX-NMAP-DEFAULT**


`-sC` in `nmap` runs `nmap` default scripts which also include hostname or OS discovery information.

```bash
$ nmap -sC 10.129.117.114
```


