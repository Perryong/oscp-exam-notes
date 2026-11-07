
## SNMP

- SNMP stands for Simple Network Management Protocol.
- It is used to monitor network devices and handle configuration tasks and change settings remotely.
- SNMP-enabled hardware devices like routers, switches, servers, IoT devices and many other devices can be queried and controlled using this protocol.
- SNMP uses `UDP Port 161 and 162`.
	- `UDP Port 161`: Used for GET/SET operations :-
		- so basically **UDP Port 161** used by SNMP manager to sent requests to the SNMP agent to make config or modifications to the network device or fetch some info about it.
	- `UDP Port 162`: Used for traps :-
		- Used by the SNMP agent to send informs or notifications to the SNMP manager.


## SNMP Versions

- `SNMP version 1` passes data in plain text and uses community string as security mechanism.
- `SNMP version 2 ` passes data in plain text and uses community string as security mechanism but is more efficient in handling bulk data.
- `SNMP version 3` uses better security mechanisms like usernames and passwords and NOT community strings.


## The OID (Object Identifier)

- **What it is:** A unique, numeric address for a single piece of information on a device.
- **Appearance:** A string of numbers separated by dots, such as `.1.3.6.1.2.1.1.3.0` 
- **Function:** This is what the SNMP Manager actually sends in its "GET" request to pull a specific value like CPU temperature or fan speed for example.

## The MIB (Management Information Base)

- **What it is:** A text file (a "dictionary") that translates those ugly numeric OIDs into human-readable names.
- **Function:** It tells your monitoring software for example :- that `.1.3.6.1.2.1.1.5.0` actually means `sysName`.
- **Structure:** MIBs are organized in a tree hierarchy. 

## SNMP Community Strings

- Community Strings in SNMP walk act as username or Password which can be found out by bruteforcing SNMP service using tools like `snmpwalk`. 
- These Community Strings act as a form of authentication and by getting the correct community string we can access SNMP agents which are used to make config or other modifications to the network devices.


### Key Comparison

| Feature         | **OID**                       | **MIB**                                                      |
| --------------- | ----------------------------- | ------------------------------------------------------------ |
| **Analogy**     | A specific **GPS coordinate** | The entire **city map**                                      |
| **Format**      | Numeric (e.g., .1.3.6...)     | Text file (.mib or .txt)                                     |
| **Usage**       | Used by machines to talk      | Used by humans to understand                                 |
| **Requirement** | Always required for a query   | Optional (you can query by OID alone if you know the number) |

## SNMP Configurations

- Config file location -> `/etc/snmp/snmp.conf`
### Dangerous Settings

| **Settings**                                     | **Description**                                                                       |
| ------------------------------------------------ | ------------------------------------------------------------------------------------- |
| `rwuser noauth`                                  | Provides access to the full OID tree without authentication.                          |
| `rwcommunity <community string> <IPv4 address>`  | Provides access to the full OID tree regardless of where the requests were sent from. |
| `rwcommunity6 <community string> <IPv6 address>` | Same access as with `rwcommunity` with the difference of using IPv6.                  |

---
## Questions and Solutions

- Enumerate the SNMP service and obtain the email address of the admin. Submit it as the answer.
	- devadmin@inlanefreight.htb

### Footprinting the Service

The `nmap` command revealed us the SNMP version which is SNMPv1 so it uses community strings and data stored in the OID is in clear text.

```bash
$ sudo nmap -sU -sV -p 161 10.129.18.201
[sudo] password for kali: 
Starting Nmap 7.95 ( https://nmap.org ) at 2026-01-31 02:24 EST
Nmap scan report for 10.129.18.201
Host is up (0.23s latency).

PORT    STATE SERVICE VERSION
161/udp open  snmp    SNMPv1 server; net-snmp SNMPv3 server (public)
Service Info: Host: NIX02

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 1.20 seconds
```

### Bruteforcing Community Strings

Bruteforcing SNMP Community Strings using `onesixtyone`. The below command gave us a community string.

```bash
$ onesixtyone -c /usr/share/wordlists/seclists/Discovery/SNMP/snmp.txt  10.129.18.201 
Scanning 1 hosts, 3219 communities
10.129.18.201 [public] Linux NIX02 5.4.0-90-generic #101-Ubuntu SMP Fri Oct 15 20:00:55 UTC 2021 x86_64
10.129.18.201 [public] Linux NIX02 5.4.0-90-generic #101-Ubuntu SMP Fri Oct 15 20:00:55 UTC 2021 x86_64
```

### Querying SNMP OIDs

Querying SNMP OIDs using our discovered Community String using `snmpwalk`.

```bash
$ snmpwalk -v2c -c public 10.129.18.201
iso.3.6.1.2.1.1.1.0 = STRING: "Linux NIX02 5.4.0-90-generic #101-Ubuntu SMP Fri Oct 15 20:00:55 UTC 2021 x86_64"
iso.3.6.1.2.1.1.2.0 = OID: iso.3.6.1.4.1.8072.3.2.10
iso.3.6.1.2.1.1.3.0 = Timeticks: (55441) 0:09:14.41
iso.3.6.1.2.1.1.4.0 = STRING: "devadmin <devadmin@inlanefreight.htb>"
iso.3.6.1.2.1.1.5.0 = STRING: "NIX02"
iso.3.6.1.2.1.1.6.0 = STRING: "InFreight SNMP v0.91"
iso.3.6.1.2.1.1.7.0 = INTEGER: 72
iso.3.6.1.2.1.1.8.0 = Timeticks: (16) 0:00:00.16
iso.3.6.1.2.1.1.9.1.2.1 = OID: iso.3.6.1.6.3.10.3.1.1
iso.3.6.1.2.1.1.9.1.2.2 = OID: iso.3.6.1.6.3.11.3.1.1
iso.3.6.1.2.1.1.9.1.2.3 = OID: iso.3.6.1.6.3.15.2.1.1
iso.3.6.1.2.1.1.9.1.2.4 = OID: iso.3.6.1.6.3.1
iso.3.6.1.2.1.1.9.1.2.5 = OID: iso.3.6.1.6.3.16.2.2.1
iso.3.6.1.2.1.1.9.1.2.6 = OID: iso.3.6.1.2.1.49
iso.3.6.1.2.1.1.9.1.2.7 = OID: iso.3.6.1.2.1.4
iso.3.6.1.2.1.1.9.1.2.8 = OID: iso.3.6.1.2.1.50
iso.3.6.1.2.1.1.9.1.2.9 = OID: iso.3.6.1.6.3.13.3.1.3
iso.3.6.1.2.1.1.9.1.2.10 = OID: iso.3.6.1.2.1.92
iso.3.6.1.2.1.1.9.1.3.1 = STRING: "The SNMP Management Architecture MIB."
iso.3.6.1.2.1.1.9.1.3.2 = STRING: "The MIB for Message Processing and Dispatching."
iso.3.6.1.2.1.1.9.1.3.3 = STRING: "The management information definitions for the SNMP User-based Security Model."
iso.3.6.1.2.1.1.9.1.3.4 = STRING: "The MIB module for SNMPv2 entities"
iso.3.6.1.2.1.1.9.1.3.5 = STRING: "View-based Access Control Model for SNMP."
iso.3.6.1.2.1.1.9.1.3.6 = STRING: "The MIB module for managing TCP implementations"
iso.3.6.1.2.1.1.9.1.3.7 = STRING: "The MIB module for managing IP and ICMP implementations"
iso.3.6.1.2.1.1.9.1.3.8 = STRING: "The MIB module for managing UDP implementations"
iso.3.6.1.2.1.1.9.1.3.9 = STRING: "The MIB modules for managing SNMP Notification, plus filtering."
iso.3.6.1.2.1.1.9.1.3.10 = STRING: "The MIB module for logging SNMP Notifications."
iso.3.6.1.2.1.1.9.1.4.1 = Timeticks: (16) 0:00:00.16
iso.3.6.1.2.1.1.9.1.4.2 = Timeticks: (16) 0:00:00.16
iso.3.6.1.2.1.1.9.1.4.3 = Timeticks: (16) 0:00:00.16
iso.3.6.1.2.1.1.9.1.4.4 = Timeticks: (16) 0:00:00.16
iso.3.6.1.2.1.1.9.1.4.5 = Timeticks: (16) 0:00:00.16
iso.3.6.1.2.1.1.9.1.4.6 = Timeticks: (16) 0:00:00.16
iso.3.6.1.2.1.1.9.1.4.7 = Timeticks: (16) 0:00:00.16
iso.3.6.1.2.1.1.9.1.4.8 = Timeticks: (16) 0:00:00.16
iso.3.6.1.2.1.1.9.1.4.9 = Timeticks: (16) 0:00:00.16
iso.3.6.1.2.1.1.9.1.4.10 = Timeticks: (16) 0:00:00.16
iso.3.6.1.2.1.2.1.0 = INTEGER: 2
iso.3.6.1.2.1.2.2.1.1.1 = INTEGER: 1
iso.3.6.1.2.1.2.2.1.1.2 = INTEGER: 2
iso.3.6.1.2.1.2.2.1.2.1 = STRING: "lo"
iso.3.6.1.2.1.2.2.1.2.2 = STRING: "VMware VMXNET3 Ethernet Controller"
iso.3.6.1.2.1.2.2.1.3.1 = INTEGER: 24
iso.3.6.1.2.1.2.2.1.3.2 = INTEGER: 6
iso.3.6.1.2.1.2.2.1.4.1 = INTEGER: 65536
iso.3.6.1.2.1.2.2.1.4.2 = INTEGER: 1500
iso.3.6.1.2.1.2.2.1.5.1 = Gauge32: 10000000
iso.3.6.1.2.1.2.2.1.5.2 = Gauge32: 4294967295
iso.3.6.1.2.1.2.2.1.6.1 = ""
iso.3.6.1.2.1.2.2.1.6.2 = Hex-STRING: 00 50 56 8A 54 A3 
iso.3.6.1.2.1.2.2.1.7.1 = INTEGER: 1
iso.3.6.1.2.1.2.2.1.7.2 = INTEGER: 1
iso.3.6.1.2.1.2.2.1.8.1 = INTEGER: 1
iso.3.6.1.2.1.2.2.1.8.2 = INTEGER: 1
iso.3.6.1.2.1.2.2.1.9.1 = Timeticks: (0) 0:00:00.00
iso.3.6.1.2.1.2.2.1.9.2 = Timeticks: (0) 0:00:00.00
iso.3.6.1.2.1.2.2.1.10.1 = Counter32: 60504
iso.3.6.1.2.1.2.2.1.10.2 = Counter32: 385100
iso.3.6.1.2.1.2.2.1.11.1 = Counter32: 780
iso.3.6.1.2.1.2.2.1.11.2 = Counter32: 5013
iso.3.6.1.2.1.2.2.1.12.1 = Counter32: 0
iso.3.6.1.2.1.2.2.1.12.2 = Counter32: 32
iso.3.6.1.2.1.2.2.1.13.1 = Counter32: 0
iso.3.6.1.2.1.2.2.1.13.2 = Counter32: 0
iso.3.6.1.2.1.2.2.1.14.1 = Counter32: 0
iso.3.6.1.2.1.2.2.1.14.2 = Counter32: 0
iso.3.6.1.2.1.2.2.1.15.1 = Counter32: 0
iso.3.6.1.2.1.2.2.1.15.2 = Counter32: 0
iso.3.6.1.2.1.2.2.1.16.1 = Counter32: 61227
iso.3.6.1.2.1.2.2.1.16.2 = Counter32: 29426
iso.3.6.1.2.1.2.2.1.17.1 = Counter32: 789
iso.3.6.1.2.1.2.2.1.17.2 = Counter32: 366
iso.3.6.1.2.1.2.2.1.18.1 = Counter32: 0
iso.3.6.1.2.1.2.2.1.18.2 = Counter32: 0
iso.3.6.1.2.1.2.2.1.19.1 = Counter32: 0
iso.3.6.1.2.1.2.2.1.19.2 = Counter32: 0
iso.3.6.1.2.1.2.2.1.20.1 = Counter32: 0
iso.3.6.1.2.1.2.2.1.20.2 = Counter32: 0
iso.3.6.1.2.1.2.2.1.21.1 = Gauge32: 0
iso.3.6.1.2.1.2.2.1.21.2 = Gauge32: 0
iso.3.6.1.2.1.2.2.1.22.1 = OID: ccitt.0
iso.3.6.1.2.1.2.2.1.22.2 = OID: ccitt.0
iso.3.6.1.2.1.3.1.1.1.2.1.10.129.0.1 = INTEGER: 2
iso.3.6.1.2.1.3.1.1.2.2.1.10.129.0.1 = Hex-STRING: 00 50 56 8A F9 2C 
iso.3.6.1.2.1.3.1.1.3.2.1.10.129.0.1 = IpAddress: 10.129.0.1
iso.3.6.1.2.1.4.1.0 = INTEGER: 2
iso.3.6.1.2.1.4.2.0 = INTEGER: 64
iso.3.6.1.2.1.4.3.0 = Counter32: 3993
iso.3.6.1.2.1.4.4.0 = Counter32: 0
iso.3.6.1.2.1.4.5.0 = Counter32: 2
iso.3.6.1.2.1.4.6.0 = Counter32: 0
iso.3.6.1.2.1.4.7.0 = Counter32: 0
iso.3.6.1.2.1.4.8.0 = Counter32: 0
iso.3.6.1.2.1.4.9.0 = Counter32: 3991
iso.3.6.1.2.1.4.10.0 = Counter32: 1165
iso.3.6.1.2.1.4.11.0 = Counter32: 2
iso.3.6.1.2.1.4.12.0 = Counter32: 0
iso.3.6.1.2.1.4.13.0 = INTEGER: 0
iso.3.6.1.2.1.4.14.0 = Counter32: 0
iso.3.6.1.2.1.4.15.0 = Counter32: 0
iso.3.6.1.2.1.4.16.0 = Counter32: 0
iso.3.6.1.2.1.4.17.0 = Counter32: 0
iso.3.6.1.2.1.4.18.0 = Counter32: 0
iso.3.6.1.2.1.4.19.0 = Counter32: 0
iso.3.6.1.2.1.4.20.1.1.10.129.18.201 = IpAddress: 10.129.18.201
iso.3.6.1.2.1.4.20.1.1.127.0.0.1 = IpAddress: 127.0.0.1
iso.3.6.1.2.1.4.20.1.2.10.129.18.201 = INTEGER: 2
iso.3.6.1.2.1.4.20.1.2.127.0.0.1 = INTEGER: 1
iso.3.6.1.2.1.4.20.1.3.10.129.18.201 = IpAddress: 255.255.0.0
iso.3.6.1.2.1.4.20.1.3.127.0.0.1 = IpAddress: 255.0.0.0
iso.3.6.1.2.1.4.20.1.4.10.129.18.201 = INTEGER: 1
iso.3.6.1.2.1.4.20.1.4.127.0.0.1 = INTEGER: 0
iso.3.6.1.2.1.4.21.1.1.0.0.0.0 = IpAddress: 0.0.0.0
iso.3.6.1.2.1.4.21.1.1.10.129.0.0 = IpAddress: 10.129.0.0
iso.3.6.1.2.1.4.21.1.2.0.0.0.0 = INTEGER: 2
iso.3.6.1.2.1.4.21.1.2.10.129.0.0 = INTEGER: 2
iso.3.6.1.2.1.4.21.1.3.0.0.0.0 = INTEGER: 1
iso.3.6.1.2.1.4.21.1.3.10.129.0.0 = INTEGER: 0
iso.3.6.1.2.1.4.21.1.7.0.0.0.0 = IpAddress: 10.129.0.1
iso.3.6.1.2.1.4.21.1.7.10.129.0.0 = IpAddress: 0.0.0.0
iso.3.6.1.2.1.4.21.1.8.0.0.0.0 = INTEGER: 4
iso.3.6.1.2.1.4.21.1.8.10.129.0.0 = INTEGER: 3
iso.3.6.1.2.1.4.21.1.9.0.0.0.0 = INTEGER: 2
iso.3.6.1.2.1.4.21.1.9.10.129.0.0 = INTEGER: 2
iso.3.6.1.2.1.4.21.1.11.0.0.0.0 = IpAddress: 0.0.0.0
iso.3.6.1.2.1.4.21.1.11.10.129.0.0 = IpAddress: 255.255.0.0
iso.3.6.1.2.1.4.21.1.13.0.0.0.0 = OID: ccitt.0
iso.3.6.1.2.1.4.21.1.13.10.129.0.0 = OID: ccitt.0
iso.3.6.1.2.1.4.22.1.1.2.10.129.0.1 = INTEGER: 2
iso.3.6.1.2.1.4.22.1.2.2.10.129.0.1 = Hex-STRING: 00 50 56 8A F9 2C 
iso.3.6.1.2.1.4.22.1.3.2.10.129.0.1 = IpAddress: 10.129.0.1
iso.3.6.1.2.1.4.22.1.4.2.10.129.0.1 = INTEGER: 3
iso.3.6.1.2.1.4.23.0 = Counter32: 0
iso.3.6.1.2.1.4.24.4.1.1.0.0.0.0.0.0.0.0.0.10.129.0.1 = IpAddress: 0.0.0.0
iso.3.6.1.2.1.4.24.4.1.1.10.129.0.0.255.255.0.0.0.0.0.0.0 = IpAddress: 10.129.0.0
iso.3.6.1.2.1.4.24.4.1.2.0.0.0.0.0.0.0.0.0.10.129.0.1 = IpAddress: 0.0.0.0
iso.3.6.1.2.1.4.24.4.1.2.10.129.0.0.255.255.0.0.0.0.0.0.0 = IpAddress: 255.255.0.0
iso.3.6.1.2.1.4.24.4.1.3.0.0.0.0.0.0.0.0.0.10.129.0.1 = INTEGER: 0
iso.3.6.1.2.1.4.24.4.1.3.10.129.0.0.255.255.0.0.0.0.0.0.0 = INTEGER: 0
iso.3.6.1.2.1.4.24.4.1.4.0.0.0.0.0.0.0.0.0.10.129.0.1 = IpAddress: 10.129.0.1
iso.3.6.1.2.1.4.24.4.1.4.10.129.0.0.255.255.0.0.0.0.0.0.0 = IpAddress: 0.0.0.0
iso.3.6.1.2.1.4.24.4.1.5.0.0.0.0.0.0.0.0.0.10.129.0.1 = INTEGER: 2
iso.3.6.1.2.1.4.24.4.1.5.10.129.0.0.255.255.0.0.0.0.0.0.0 = INTEGER: 2
iso.3.6.1.2.1.4.24.4.1.6.0.0.0.0.0.0.0.0.0.10.129.0.1 = INTEGER: 4
iso.3.6.1.2.1.4.24.4.1.6.10.129.0.0.255.255.0.0.0.0.0.0.0 = INTEGER: 3
iso.3.6.1.2.1.4.24.4.1.7.0.0.0.0.0.0.0.0.0.10.129.0.1 = INTEGER: 2
iso.3.6.1.2.1.4.24.4.1.7.10.129.0.0.255.255.0.0.0.0.0.0.0 = INTEGER: 2
iso.3.6.1.2.1.4.24.4.1.9.0.0.0.0.0.0.0.0.0.10.129.0.1 = OID: ccitt.0
iso.3.6.1.2.1.4.24.4.1.9.10.129.0.0.255.255.0.0.0.0.0.0.0 = OID: ccitt.0
iso.3.6.1.2.1.4.24.4.1.10.0.0.0.0.0.0.0.0.0.10.129.0.1 = INTEGER: 0
iso.3.6.1.2.1.4.24.4.1.10.10.129.0.0.255.255.0.0.0.0.0.0.0 = INTEGER: 0
iso.3.6.1.2.1.4.24.4.1.11.0.0.0.0.0.0.0.0.0.10.129.0.1 = INTEGER: 0
iso.3.6.1.2.1.4.24.4.1.11.10.129.0.0.255.255.0.0.0.0.0.0.0 = INTEGER: 0
iso.3.6.1.2.1.4.24.4.1.12.0.0.0.0.0.0.0.0.0.10.129.0.1 = INTEGER: -1
iso.3.6.1.2.1.4.24.4.1.12.10.129.0.0.255.255.0.0.0.0.0.0.0 = INTEGER: -1
iso.3.6.1.2.1.4.24.4.1.13.0.0.0.0.0.0.0.0.0.10.129.0.1 = INTEGER: -1
iso.3.6.1.2.1.4.24.4.1.13.10.129.0.0.255.255.0.0.0.0.0.0.0 = INTEGER: -1
iso.3.6.1.2.1.4.24.4.1.14.0.0.0.0.0.0.0.0.0.10.129.0.1 = INTEGER: -1
iso.3.6.1.2.1.4.24.4.1.14.10.129.0.0.255.255.0.0.0.0.0.0.0 = INTEGER: -1
iso.3.6.1.2.1.4.24.4.1.15.0.0.0.0.0.0.0.0.0.10.129.0.1 = INTEGER: -1
iso.3.6.1.2.1.4.24.4.1.15.10.129.0.0.255.255.0.0.0.0.0.0.0 = INTEGER: -1
iso.3.6.1.2.1.4.24.4.1.16.0.0.0.0.0.0.0.0.0.10.129.0.1 = INTEGER: 1
iso.3.6.1.2.1.4.24.4.1.16.10.129.0.0.255.255.0.0.0.0.0.0.0 = INTEGER: 1
iso.3.6.1.2.1.4.24.6.0 = Gauge32: 2
iso.3.6.1.2.1.4.24.7.1.7.1.4.0.0.0.0.0.2.0.0.1.4.10.129.0.1 = INTEGER: 2
iso.3.6.1.2.1.4.24.7.1.7.1.4.10.129.0.0.16.3.0.0.2.1.4.0.0.0.0 = INTEGER: 2
iso.3.6.1.2.1.4.24.7.1.8.1.4.0.0.0.0.0.2.0.0.1.4.10.129.0.1 = INTEGER: 4
iso.3.6.1.2.1.4.24.7.1.8.1.4.10.129.0.0.16.3.0.0.2.1.4.0.0.0.0 = INTEGER: 3
iso.3.6.1.2.1.4.24.7.1.9.1.4.0.0.0.0.0.2.0.0.1.4.10.129.0.1 = INTEGER: 2
iso.3.6.1.2.1.4.24.7.1.9.1.4.10.129.0.0.16.3.0.0.2.1.4.0.0.0.0 = INTEGER: 2
iso.3.6.1.2.1.4.24.7.1.10.1.4.0.0.0.0.0.2.0.0.1.4.10.129.0.1 = Gauge32: 0
iso.3.6.1.2.1.4.24.7.1.10.1.4.10.129.0.0.16.3.0.0.2.1.4.0.0.0.0 = Gauge32: 0
iso.3.6.1.2.1.4.24.7.1.11.1.4.0.0.0.0.0.2.0.0.1.4.10.129.0.1 = Gauge32: 0
iso.3.6.1.2.1.4.24.7.1.11.1.4.10.129.0.0.16.3.0.0.2.1.4.0.0.0.0 = Gauge32: 0
iso.3.6.1.2.1.4.24.7.1.12.1.4.0.0.0.0.0.2.0.0.1.4.10.129.0.1 = INTEGER: 0
iso.3.6.1.2.1.4.24.7.1.12.1.4.10.129.0.0.16.3.0.0.2.1.4.0.0.0.0 = INTEGER: 0
iso.3.6.1.2.1.4.24.7.1.13.1.4.0.0.0.0.0.2.0.0.1.4.10.129.0.1 = INTEGER: -1
iso.3.6.1.2.1.4.24.7.1.13.1.4.10.129.0.0.16.3.0.0.2.1.4.0.0.0.0 = INTEGER: -1
iso.3.6.1.2.1.4.24.7.1.14.1.4.0.0.0.0.0.2.0.0.1.4.10.129.0.1 = INTEGER: -1
iso.3.6.1.2.1.4.24.7.1.14.1.4.10.129.0.0.16.3.0.0.2.1.4.0.0.0.0 = INTEGER: -1
iso.3.6.1.2.1.4.24.7.1.15.1.4.0.0.0.0.0.2.0.0.1.4.10.129.0.1 = INTEGER: -1
iso.3.6.1.2.1.4.24.7.1.15.1.4.10.129.0.0.16.3.0.0.2.1.4.0.0.0.0 = INTEGER: -1
iso.3.6.1.2.1.4.24.7.1.16.1.4.0.0.0.0.0.2.0.0.1.4.10.129.0.1 = INTEGER: -1
iso.3.6.1.2.1.4.24.7.1.16.1.4.10.129.0.0.16.3.0.0.2.1.4.0.0.0.0 = INTEGER: -1
iso.3.6.1.2.1.4.24.7.1.17.1.4.0.0.0.0.0.2.0.0.1.4.10.129.0.1 = INTEGER: 1
iso.3.6.1.2.1.4.24.7.1.17.1.4.10.129.0.0.16.3.0.0.2.1.4.0.0.0.0 = INTEGER: 1
iso.3.6.1.2.1.4.31.1.1.3.1 = Counter32: 3868
iso.3.6.1.2.1.4.31.1.1.4.1 = Counter64: 4129
iso.3.6.1.2.1.4.31.1.1.5.1 = Counter32: 304658
iso.3.6.1.2.1.4.31.1.1.6.1 = Counter64: 304658
iso.3.6.1.2.1.4.31.1.1.7.1 = Counter32: 0
iso.3.6.1.2.1.4.31.1.1.8.1 = Counter32: 0
iso.3.6.1.2.1.4.31.1.1.9.1 = Counter32: 2
iso.3.6.1.2.1.4.31.1.1.10.1 = Counter32: 0
iso.3.6.1.2.1.4.31.1.1.11.1 = Counter32: 0
iso.3.6.1.2.1.4.31.1.1.12.1 = Counter32: 0
iso.3.6.1.2.1.4.31.1.1.13.1 = Counter64: 0
iso.3.6.1.2.1.4.31.1.1.14.1 = Counter32: 0
iso.3.6.1.2.1.4.31.1.1.15.1 = Counter32: 0
iso.3.6.1.2.1.4.31.1.1.16.1 = Counter32: 0
iso.3.6.1.2.1.4.31.1.1.17.1 = Counter32: 0
iso.3.6.1.2.1.4.31.1.1.18.1 = Counter32: 4127
iso.3.6.1.2.1.4.31.1.1.19.1 = Counter64: 4127
iso.3.6.1.2.1.4.31.1.1.20.1 = Counter32: 1312
iso.3.6.1.2.1.4.31.1.1.21.1 = Counter64: 1312
iso.3.6.1.2.1.4.31.1.1.22.1 = Counter32: 0
iso.3.6.1.2.1.4.31.1.1.23.1 = Counter32: 0
iso.3.6.1.2.1.4.31.1.1.24.1 = Counter64: 0
iso.3.6.1.2.1.4.31.1.1.25.1 = Counter32: 2
iso.3.6.1.2.1.4.31.1.1.26.1 = Counter32: 0
iso.3.6.1.2.1.4.31.1.1.27.1 = Counter32: 0
iso.3.6.1.2.1.4.31.1.1.28.1 = Counter32: 0
iso.3.6.1.2.1.4.31.1.1.29.1 = Counter32: 0
iso.3.6.1.2.1.4.31.1.1.30.1 = Counter32: 1310
iso.3.6.1.2.1.4.31.1.1.31.1 = Counter64: 1310
iso.3.6.1.2.1.4.31.1.1.32.1 = Counter32: 98465
iso.3.6.1.2.1.4.31.1.1.33.1 = Counter64: 98465
iso.3.6.1.2.1.4.31.1.1.34.1 = Counter32: 34
iso.3.6.1.2.1.4.31.1.1.35.1 = Counter64: 34
iso.3.6.1.2.1.4.31.1.1.36.1 = Counter32: 1224
iso.3.6.1.2.1.4.31.1.1.37.1 = Counter64: 1224
iso.3.6.1.2.1.4.31.1.1.38.1 = Counter32: 0
iso.3.6.1.2.1.4.31.1.1.39.1 = Counter64: 0
iso.3.6.1.2.1.4.31.1.1.40.1 = Counter32: 0
iso.3.6.1.2.1.4.31.1.1.41.1 = Counter64: 0
iso.3.6.1.2.1.4.31.1.1.42.1 = Counter32: 60
iso.3.6.1.2.1.4.31.1.1.43.1 = Counter64: 60
iso.3.6.1.2.1.4.31.1.1.44.1 = Counter32: 0
iso.3.6.1.2.1.4.31.1.1.45.1 = Counter64: 0
iso.3.6.1.2.1.4.31.1.1.46.1 = Timeticks: (0) 0:00:00.00
iso.3.6.1.2.1.4.31.1.1.47.1 = Gauge32: 60000
iso.3.6.1.2.1.4.31.2.0 = Timeticks: (0) 0:00:00.00
iso.3.6.1.2.1.4.32.1.5.1.1.4.127.0.0.0.8 = INTEGER: 2
iso.3.6.1.2.1.4.32.1.5.2.1.4.10.129.0.0.16 = INTEGER: 2
iso.3.6.1.2.1.4.32.1.6.1.1.4.127.0.0.0.8 = INTEGER: 1
iso.3.6.1.2.1.4.32.1.6.2.1.4.10.129.0.0.16 = INTEGER: 1
iso.3.6.1.2.1.4.32.1.7.1.1.4.127.0.0.0.8 = INTEGER: 2
iso.3.6.1.2.1.4.32.1.7.2.1.4.10.129.0.0.16 = INTEGER: 2
iso.3.6.1.2.1.4.32.1.8.1.1.4.127.0.0.0.8 = Gauge32: 4294967295
iso.3.6.1.2.1.4.32.1.8.2.1.4.10.129.0.0.16 = Gauge32: 4294967295
iso.3.6.1.2.1.4.32.1.9.1.1.4.127.0.0.0.8 = Gauge32: 4294967295
iso.3.6.1.2.1.4.32.1.9.2.1.4.10.129.0.0.16 = Gauge32: 4294967295
iso.3.6.1.2.1.4.33.0 = INTEGER: 1883501227
iso.3.6.1.2.1.4.34.1.3.1.4.10.129.18.201 = INTEGER: 2
iso.3.6.1.2.1.4.34.1.3.1.4.10.129.255.255 = INTEGER: 2
iso.3.6.1.2.1.4.34.1.3.1.4.127.0.0.1 = INTEGER: 1
iso.3.6.1.2.1.4.34.1.4.1.4.10.129.18.201 = INTEGER: 1
iso.3.6.1.2.1.4.34.1.4.1.4.10.129.255.255 = INTEGER: 3
iso.3.6.1.2.1.4.34.1.4.1.4.127.0.0.1 = INTEGER: 1
iso.3.6.1.2.1.4.34.1.5.1.4.10.129.18.201 = OID: iso.3.6.1.2.1.4.32.1.5.2.1.4.10.129.0.0.16
iso.3.6.1.2.1.4.34.1.5.1.4.10.129.255.255 = OID: iso.3.6.1.2.1.4.32.1.5.2.1.4.10.129.0.0.16
iso.3.6.1.2.1.4.34.1.5.1.4.127.0.0.1 = OID: iso.3.6.1.2.1.4.32.1.5.1.1.4.127.0.0.0.8
iso.3.6.1.2.1.4.34.1.6.1.4.10.129.18.201 = INTEGER: 2
iso.3.6.1.2.1.4.34.1.6.1.4.10.129.255.255 = INTEGER: 2
iso.3.6.1.2.1.4.34.1.6.1.4.127.0.0.1 = INTEGER: 2
iso.3.6.1.2.1.4.34.1.7.1.4.10.129.18.201 = INTEGER: 1
iso.3.6.1.2.1.4.34.1.7.1.4.10.129.255.255 = INTEGER: 1
iso.3.6.1.2.1.4.34.1.7.1.4.127.0.0.1 = INTEGER: 1
iso.3.6.1.2.1.4.34.1.8.1.4.10.129.18.201 = Timeticks: (0) 0:00:00.00
iso.3.6.1.2.1.4.34.1.8.1.4.10.129.255.255 = Timeticks: (0) 0:00:00.00
iso.3.6.1.2.1.4.34.1.8.1.4.127.0.0.1 = Timeticks: (0) 0:00:00.00
iso.3.6.1.2.1.4.34.1.9.1.4.10.129.18.201 = Timeticks: (0) 0:00:00.00
iso.3.6.1.2.1.4.34.1.9.1.4.10.129.255.255 = Timeticks: (0) 0:00:00.00
iso.3.6.1.2.1.4.34.1.9.1.4.127.0.0.1 = Timeticks: (0) 0:00:00.00
iso.3.6.1.2.1.4.34.1.10.1.4.10.129.18.201 = INTEGER: 1
iso.3.6.1.2.1.4.34.1.10.1.4.10.129.255.255 = INTEGER: 1
iso.3.6.1.2.1.4.34.1.10.1.4.127.0.0.1 = INTEGER: 1
iso.3.6.1.2.1.4.34.1.11.1.4.10.129.18.201 = INTEGER: 2
iso.3.6.1.2.1.4.34.1.11.1.4.10.129.255.255 = INTEGER: 2
iso.3.6.1.2.1.4.34.1.11.1.4.127.0.0.1 = INTEGER: 2
iso.3.6.1.2.1.4.35.1.4.2.1.4.10.129.0.1 = Hex-STRING: 00 50 56 8A F9 2C 
iso.3.6.1.2.1.4.35.1.5.2.1.4.10.129.0.1 = Timeticks: (62845) 0:10:28.45
iso.3.6.1.2.1.4.35.1.6.2.1.4.10.129.0.1 = INTEGER: 3
iso.3.6.1.2.1.4.35.1.7.2.1.4.10.129.0.1 = INTEGER: 1
iso.3.6.1.2.1.4.35.1.8.2.1.4.10.129.0.1 = INTEGER: 1
iso.3.6.1.2.1.4.37.1.4.1.4.10.129.0.1.2 = Gauge32: 65535
iso.3.6.1.2.1.4.37.1.5.1.4.10.129.0.1.2 = INTEGER: 0
iso.3.6.1.2.1.5.1.0 = Counter32: 210
iso.3.6.1.2.1.5.2.0 = Counter32: 0
iso.3.6.1.2.1.5.3.0 = Counter32: 207
iso.3.6.1.2.1.5.4.0 = Counter32: 0
iso.3.6.1.2.1.5.5.0 = Counter32: 0
iso.3.6.1.2.1.5.6.0 = Counter32: 0
iso.3.6.1.2.1.5.7.0 = Counter32: 0
iso.3.6.1.2.1.5.8.0 = Counter32: 2
iso.3.6.1.2.1.5.9.0 = Counter32: 0
iso.3.6.1.2.1.5.10.0 = Counter32: 1
iso.3.6.1.2.1.5.11.0 = Counter32: 0
iso.3.6.1.2.1.5.12.0 = Counter32: 0
iso.3.6.1.2.1.5.13.0 = Counter32: 0
iso.3.6.1.2.1.5.14.0 = Counter32: 208
iso.3.6.1.2.1.5.15.0 = Counter32: 0
iso.3.6.1.2.1.5.16.0 = Counter32: 205
iso.3.6.1.2.1.5.17.0 = Counter32: 0
iso.3.6.1.2.1.5.18.0 = Counter32: 0
iso.3.6.1.2.1.5.19.0 = Counter32: 0
iso.3.6.1.2.1.5.20.0 = Counter32: 0
iso.3.6.1.2.1.5.21.0 = Counter32: 0
iso.3.6.1.2.1.5.22.0 = Counter32: 2
iso.3.6.1.2.1.5.23.0 = Counter32: 0
iso.3.6.1.2.1.5.24.0 = Counter32: 1
iso.3.6.1.2.1.5.25.0 = Counter32: 0
iso.3.6.1.2.1.5.26.0 = Counter32: 0
iso.3.6.1.2.1.5.29.1.2.1 = Counter32: 210
iso.3.6.1.2.1.5.29.1.2.2 = Counter32: 0
iso.3.6.1.2.1.5.29.1.3.1 = Counter32: 0
iso.3.6.1.2.1.5.29.1.3.2 = Counter32: 0
iso.3.6.1.2.1.5.29.1.4.1 = Counter32: 208
iso.3.6.1.2.1.5.29.1.4.2 = Counter32: 0
iso.3.6.1.2.1.5.29.1.5.1 = Counter32: 0
iso.3.6.1.2.1.5.29.1.5.2 = Counter32: 0
iso.3.6.1.2.1.5.30.1.3.1.0 = Counter32: 0
iso.3.6.1.2.1.5.30.1.3.1.3 = Counter32: 207
iso.3.6.1.2.1.5.30.1.3.1.4 = Counter32: 0
iso.3.6.1.2.1.5.30.1.3.1.5 = Counter32: 0
iso.3.6.1.2.1.5.30.1.3.1.8 = Counter32: 2
iso.3.6.1.2.1.5.30.1.3.1.11 = Counter32: 0
iso.3.6.1.2.1.5.30.1.3.1.12 = Counter32: 0
iso.3.6.1.2.1.5.30.1.3.1.13 = Counter32: 1
iso.3.6.1.2.1.5.30.1.3.1.14 = Counter32: 0
iso.3.6.1.2.1.5.30.1.3.1.17 = Counter32: 0
iso.3.6.1.2.1.5.30.1.3.1.18 = Counter32: 0
iso.3.6.1.2.1.5.30.1.3.2.1 = Counter32: 0
iso.3.6.1.2.1.5.30.1.3.2.2 = Counter32: 0
iso.3.6.1.2.1.5.30.1.3.2.3 = Counter32: 0
iso.3.6.1.2.1.5.30.1.3.2.4 = Counter32: 0
iso.3.6.1.2.1.5.30.1.3.2.128 = Counter32: 0
iso.3.6.1.2.1.5.30.1.3.2.129 = Counter32: 0
iso.3.6.1.2.1.5.30.1.3.2.130 = Counter32: 0
iso.3.6.1.2.1.5.30.1.3.2.131 = Counter32: 0
iso.3.6.1.2.1.5.30.1.3.2.132 = Counter32: 0
iso.3.6.1.2.1.5.30.1.3.2.133 = Counter32: 0
iso.3.6.1.2.1.5.30.1.3.2.134 = Counter32: 0
iso.3.6.1.2.1.5.30.1.3.2.135 = Counter32: 0
iso.3.6.1.2.1.5.30.1.3.2.136 = Counter32: 0
iso.3.6.1.2.1.5.30.1.3.2.137 = Counter32: 0
iso.3.6.1.2.1.5.30.1.4.1.0 = Counter32: 2
iso.3.6.1.2.1.5.30.1.4.1.3 = Counter32: 205
iso.3.6.1.2.1.5.30.1.4.1.4 = Counter32: 0
iso.3.6.1.2.1.5.30.1.4.1.5 = Counter32: 0
iso.3.6.1.2.1.5.30.1.4.1.8 = Counter32: 0
iso.3.6.1.2.1.5.30.1.4.1.11 = Counter32: 0
iso.3.6.1.2.1.5.30.1.4.1.12 = Counter32: 0
iso.3.6.1.2.1.5.30.1.4.1.13 = Counter32: 0
iso.3.6.1.2.1.5.30.1.4.1.14 = Counter32: 1
iso.3.6.1.2.1.5.30.1.4.1.17 = Counter32: 0
iso.3.6.1.2.1.5.30.1.4.1.18 = Counter32: 0
iso.3.6.1.2.1.5.30.1.4.2.1 = Counter32: 0
iso.3.6.1.2.1.5.30.1.4.2.2 = Counter32: 0
iso.3.6.1.2.1.5.30.1.4.2.3 = Counter32: 0
iso.3.6.1.2.1.5.30.1.4.2.4 = Counter32: 0
iso.3.6.1.2.1.5.30.1.4.2.128 = Counter32: 0
iso.3.6.1.2.1.5.30.1.4.2.129 = Counter32: 0
iso.3.6.1.2.1.5.30.1.4.2.131 = Counter32: 0
iso.3.6.1.2.1.5.30.1.4.2.132 = Counter32: 0
iso.3.6.1.2.1.5.30.1.4.2.133 = Counter32: 0
iso.3.6.1.2.1.5.30.1.4.2.135 = Counter32: 0
iso.3.6.1.2.1.5.30.1.4.2.136 = Counter32: 0
iso.3.6.1.2.1.5.30.1.4.2.137 = Counter32: 0
iso.3.6.1.2.1.6.1.0 = INTEGER: 1
iso.3.6.1.2.1.6.2.0 = INTEGER: 200
iso.3.6.1.2.1.6.3.0 = INTEGER: 120000
iso.3.6.1.2.1.6.4.0 = INTEGER: -1
iso.3.6.1.2.1.6.5.0 = Counter32: 68
iso.3.6.1.2.1.6.6.0 = Counter32: 0
iso.3.6.1.2.1.6.7.0 = Counter32: 3
iso.3.6.1.2.1.6.8.0 = Counter32: 0
iso.3.6.1.2.1.6.9.0 = Gauge32: 0
iso.3.6.1.2.1.6.10.0 = Counter32: 8
iso.3.6.1.2.1.6.11.0 = Counter32: 73
iso.3.6.1.2.1.6.12.0 = Counter32: 195
iso.3.6.1.2.1.6.13.1.1.0.0.0.0.22.0.0.0.0.0 = INTEGER: 2
iso.3.6.1.2.1.6.13.1.1.0.0.0.0.25.0.0.0.0.0 = INTEGER: 2
iso.3.6.1.2.1.6.13.1.1.0.0.0.0.110.0.0.0.0.0 = INTEGER: 2
iso.3.6.1.2.1.6.13.1.1.0.0.0.0.143.0.0.0.0.0 = INTEGER: 2
iso.3.6.1.2.1.6.13.1.1.0.0.0.0.993.0.0.0.0.0 = INTEGER: 2
iso.3.6.1.2.1.6.13.1.1.0.0.0.0.995.0.0.0.0.0 = INTEGER: 2
iso.3.6.1.2.1.6.13.1.1.0.0.0.0.3306.0.0.0.0.0 = INTEGER: 2
iso.3.6.1.2.1.6.13.1.1.0.0.0.0.33060.0.0.0.0.0 = INTEGER: 2
iso.3.6.1.2.1.6.13.1.1.10.129.18.201.53.0.0.0.0.0 = INTEGER: 2
iso.3.6.1.2.1.6.13.1.1.10.129.18.201.38328.8.8.8.8.53 = INTEGER: 3
iso.3.6.1.2.1.6.13.1.1.127.0.0.1.53.0.0.0.0.0 = INTEGER: 2
iso.3.6.1.2.1.6.13.1.1.127.0.0.1.953.0.0.0.0.0 = INTEGER: 2
iso.3.6.1.2.1.6.13.1.1.127.0.0.53.53.0.0.0.0.0 = INTEGER: 2
iso.3.6.1.2.1.6.13.1.2.0.0.0.0.22.0.0.0.0.0 = IpAddress: 0.0.0.0
iso.3.6.1.2.1.6.13.1.2.0.0.0.0.25.0.0.0.0.0 = IpAddress: 0.0.0.0
iso.3.6.1.2.1.6.13.1.2.0.0.0.0.110.0.0.0.0.0 = IpAddress: 0.0.0.0
iso.3.6.1.2.1.6.13.1.2.0.0.0.0.143.0.0.0.0.0 = IpAddress: 0.0.0.0
iso.3.6.1.2.1.6.13.1.2.0.0.0.0.993.0.0.0.0.0 = IpAddress: 0.0.0.0
iso.3.6.1.2.1.6.13.1.2.0.0.0.0.995.0.0.0.0.0 = IpAddress: 0.0.0.0
iso.3.6.1.2.1.6.13.1.2.0.0.0.0.3306.0.0.0.0.0 = IpAddress: 0.0.0.0
iso.3.6.1.2.1.6.13.1.2.0.0.0.0.33060.0.0.0.0.0 = IpAddress: 0.0.0.0
iso.3.6.1.2.1.6.13.1.2.10.129.18.201.53.0.0.0.0.0 = IpAddress: 10.129.18.201
iso.3.6.1.2.1.6.13.1.2.10.129.18.201.38328.8.8.8.8.53 = IpAddress: 10.129.18.201
iso.3.6.1.2.1.6.13.1.2.127.0.0.1.53.0.0.0.0.0 = IpAddress: 127.0.0.1
iso.3.6.1.2.1.6.13.1.2.127.0.0.1.953.0.0.0.0.0 = IpAddress: 127.0.0.1
iso.3.6.1.2.1.6.13.1.2.127.0.0.53.53.0.0.0.0.0 = IpAddress: 127.0.0.53
iso.3.6.1.2.1.6.13.1.3.0.0.0.0.22.0.0.0.0.0 = INTEGER: 22
iso.3.6.1.2.1.6.13.1.3.0.0.0.0.25.0.0.0.0.0 = INTEGER: 25
iso.3.6.1.2.1.6.13.1.3.0.0.0.0.110.0.0.0.0.0 = INTEGER: 110
iso.3.6.1.2.1.6.13.1.3.0.0.0.0.143.0.0.0.0.0 = INTEGER: 143
iso.3.6.1.2.1.6.13.1.3.0.0.0.0.993.0.0.0.0.0 = INTEGER: 993
iso.3.6.1.2.1.6.13.1.3.0.0.0.0.995.0.0.0.0.0 = INTEGER: 995
iso.3.6.1.2.1.6.13.1.3.0.0.0.0.3306.0.0.0.0.0 = INTEGER: 3306
iso.3.6.1.2.1.6.13.1.3.0.0.0.0.33060.0.0.0.0.0 = INTEGER: 33060
iso.3.6.1.2.1.6.13.1.3.10.129.18.201.53.0.0.0.0.0 = INTEGER: 53
iso.3.6.1.2.1.6.13.1.3.10.129.18.201.38328.8.8.8.8.53 = INTEGER: 38328
iso.3.6.1.2.1.6.13.1.3.127.0.0.1.53.0.0.0.0.0 = INTEGER: 53
iso.3.6.1.2.1.6.13.1.3.127.0.0.1.953.0.0.0.0.0 = INTEGER: 953
iso.3.6.1.2.1.6.13.1.3.127.0.0.53.53.0.0.0.0.0 = INTEGER: 53
iso.3.6.1.2.1.6.13.1.4.0.0.0.0.22.0.0.0.0.0 = IpAddress: 0.0.0.0
iso.3.6.1.2.1.6.13.1.4.0.0.0.0.25.0.0.0.0.0 = IpAddress: 0.0.0.0
iso.3.6.1.2.1.6.13.1.4.0.0.0.0.110.0.0.0.0.0 = IpAddress: 0.0.0.0
iso.3.6.1.2.1.6.13.1.4.0.0.0.0.143.0.0.0.0.0 = IpAddress: 0.0.0.0
iso.3.6.1.2.1.6.13.1.4.0.0.0.0.993.0.0.0.0.0 = IpAddress: 0.0.0.0
iso.3.6.1.2.1.6.13.1.4.0.0.0.0.995.0.0.0.0.0 = IpAddress: 0.0.0.0
iso.3.6.1.2.1.6.13.1.4.0.0.0.0.3306.0.0.0.0.0 = IpAddress: 0.0.0.0
iso.3.6.1.2.1.6.13.1.4.0.0.0.0.33060.0.0.0.0.0 = IpAddress: 0.0.0.0
iso.3.6.1.2.1.6.13.1.4.10.129.18.201.53.0.0.0.0.0 = IpAddress: 0.0.0.0
iso.3.6.1.2.1.6.13.1.4.10.129.18.201.38330.8.8.8.8.53 = IpAddress: 8.8.8.8
iso.3.6.1.2.1.6.13.1.4.127.0.0.1.53.0.0.0.0.0 = IpAddress: 0.0.0.0
iso.3.6.1.2.1.6.13.1.4.127.0.0.1.953.0.0.0.0.0 = IpAddress: 0.0.0.0
iso.3.6.1.2.1.6.13.1.4.127.0.0.53.53.0.0.0.0.0 = IpAddress: 0.0.0.0
iso.3.6.1.2.1.6.13.1.5.0.0.0.0.22.0.0.0.0.0 = INTEGER: 0
iso.3.6.1.2.1.6.13.1.5.0.0.0.0.25.0.0.0.0.0 = INTEGER: 0
iso.3.6.1.2.1.6.13.1.5.0.0.0.0.110.0.0.0.0.0 = INTEGER: 0
iso.3.6.1.2.1.6.13.1.5.0.0.0.0.143.0.0.0.0.0 = INTEGER: 0
iso.3.6.1.2.1.6.13.1.5.0.0.0.0.993.0.0.0.0.0 = INTEGER: 0
iso.3.6.1.2.1.6.13.1.5.0.0.0.0.995.0.0.0.0.0 = INTEGER: 0
iso.3.6.1.2.1.6.13.1.5.0.0.0.0.3306.0.0.0.0.0 = INTEGER: 0
iso.3.6.1.2.1.6.13.1.5.0.0.0.0.33060.0.0.0.0.0 = INTEGER: 0
iso.3.6.1.2.1.6.13.1.5.10.129.18.201.53.0.0.0.0.0 = INTEGER: 0
iso.3.6.1.2.1.6.13.1.5.10.129.18.201.38330.8.8.8.8.53 = INTEGER: 53
iso.3.6.1.2.1.6.13.1.5.127.0.0.1.53.0.0.0.0.0 = INTEGER: 0
iso.3.6.1.2.1.6.13.1.5.127.0.0.1.953.0.0.0.0.0 = INTEGER: 0
iso.3.6.1.2.1.6.13.1.5.127.0.0.53.53.0.0.0.0.0 = INTEGER: 0
iso.3.6.1.2.1.6.14.0 = Counter32: 0
iso.3.6.1.2.1.6.15.0 = Counter32: 5
iso.3.6.1.2.1.6.19.1.7.1.4.10.129.18.201.38332.1.4.8.8.8.8.53 = INTEGER: 3
iso.3.6.1.2.1.6.19.1.8.1.4.10.129.18.201.38332.1.4.8.8.8.8.53 = Gauge32: 0
iso.3.6.1.2.1.6.20.1.4.1.4.0.0.0.0.22 = Gauge32: 0
iso.3.6.1.2.1.6.20.1.4.1.4.0.0.0.0.25 = Gauge32: 0
iso.3.6.1.2.1.6.20.1.4.1.4.0.0.0.0.110 = Gauge32: 0
iso.3.6.1.2.1.6.20.1.4.1.4.0.0.0.0.143 = Gauge32: 0
iso.3.6.1.2.1.6.20.1.4.1.4.0.0.0.0.993 = Gauge32: 0
iso.3.6.1.2.1.6.20.1.4.1.4.0.0.0.0.995 = Gauge32: 0
iso.3.6.1.2.1.6.20.1.4.1.4.0.0.0.0.3306 = Gauge32: 0
iso.3.6.1.2.1.6.20.1.4.1.4.0.0.0.0.33060 = Gauge32: 0
iso.3.6.1.2.1.6.20.1.4.1.4.10.129.18.201.53 = Gauge32: 0
iso.3.6.1.2.1.6.20.1.4.1.4.127.0.0.1.53 = Gauge32: 0
iso.3.6.1.2.1.6.20.1.4.1.4.127.0.0.1.953 = Gauge32: 0
iso.3.6.1.2.1.6.20.1.4.1.4.127.0.0.53.53 = Gauge32: 0
iso.3.6.1.2.1.7.1.0 = Counter32: 3948
iso.3.6.1.2.1.7.2.0 = Counter32: 221
iso.3.6.1.2.1.7.3.0 = Counter32: 0
iso.3.6.1.2.1.7.4.0 = Counter32: 1218
iso.3.6.1.2.1.7.5.1.1.0.0.0.0.68 = IpAddress: 0.0.0.0
iso.3.6.1.2.1.7.5.1.1.0.0.0.0.161 = IpAddress: 0.0.0.0
iso.3.6.1.2.1.7.5.1.1.10.129.18.201.53 = IpAddress: 10.129.18.201
iso.3.6.1.2.1.7.5.1.1.127.0.0.1.53 = IpAddress: 127.0.0.1
iso.3.6.1.2.1.7.5.1.1.127.0.0.53.53 = IpAddress: 127.0.0.53
iso.3.6.1.2.1.7.5.1.2.0.0.0.0.68 = INTEGER: 68
iso.3.6.1.2.1.7.5.1.2.0.0.0.0.161 = INTEGER: 161
iso.3.6.1.2.1.7.5.1.2.10.129.18.201.53 = INTEGER: 53
iso.3.6.1.2.1.7.5.1.2.127.0.0.1.53 = INTEGER: 53
iso.3.6.1.2.1.7.5.1.2.127.0.0.53.53 = INTEGER: 53
iso.3.6.1.2.1.7.7.1.8.1.4.0.0.0.0.68.1.4.0.0.0.0.0.23201 = Gauge32: 0
iso.3.6.1.2.1.7.7.1.8.1.4.0.0.0.0.161.1.4.0.0.0.0.0.25922 = Gauge32: 979
iso.3.6.1.2.1.7.7.1.8.1.4.10.129.18.201.53.1.4.0.0.0.0.0.29124 = Gauge32: 0
iso.3.6.1.2.1.7.7.1.8.1.4.10.129.18.201.53.1.4.0.0.0.0.0.29125 = Gauge32: 0
iso.3.6.1.2.1.7.7.1.8.1.4.10.129.18.201.53.1.4.0.0.0.0.0.29126 = Gauge32: 0
iso.3.6.1.2.1.7.7.1.8.1.4.10.129.18.201.53.1.4.0.0.0.0.0.29127 = Gauge32: 0
iso.3.6.1.2.1.7.7.1.8.1.4.127.0.0.1.53.1.4.0.0.0.0.0.29119 = Gauge32: 0
iso.3.6.1.2.1.7.7.1.8.1.4.127.0.0.1.53.1.4.0.0.0.0.0.29120 = Gauge32: 0
iso.3.6.1.2.1.7.7.1.8.1.4.127.0.0.1.53.1.4.0.0.0.0.0.29121 = Gauge32: 0
iso.3.6.1.2.1.7.7.1.8.1.4.127.0.0.1.53.1.4.0.0.0.0.0.29122 = Gauge32: 0
iso.3.6.1.2.1.7.7.1.8.1.4.127.0.0.1.51191.1.4.127.0.0.53.53.31433 = Gauge32: 0
iso.3.6.1.2.1.7.7.1.8.1.4.127.0.0.53.53.1.4.0.0.0.0.0.24708 = Gauge32: 0
iso.3.6.1.2.1.10.7.2.1.1.2 = INTEGER: 2
iso.3.6.1.2.1.10.7.2.1.3.2 = Counter32: 0
iso.3.6.1.2.1.10.7.2.1.7.2 = Counter32: 0
iso.3.6.1.2.1.10.7.2.1.10.2 = Counter32: 0
iso.3.6.1.2.1.10.7.2.1.11.2 = Counter32: 0
iso.3.6.1.2.1.10.7.2.1.13.2 = Counter32: 0
iso.3.6.1.2.1.10.7.2.1.16.2 = Counter32: 0
iso.3.6.1.2.1.10.7.2.1.19.2 = INTEGER: 3
iso.3.6.1.2.1.11.1.0 = Counter32: 3524
iso.3.6.1.2.1.11.2.0 = Counter32: 517
iso.3.6.1.2.1.11.3.0 = Counter32: 0
iso.3.6.1.2.1.11.4.0 = Counter32: 3005
iso.3.6.1.2.1.11.5.0 = Counter32: 0
iso.3.6.1.2.1.11.6.0 = Counter32: 0
iso.3.6.1.2.1.11.8.0 = Counter32: 0
iso.3.6.1.2.1.11.9.0 = Counter32: 0
iso.3.6.1.2.1.11.10.0 = Counter32: 0
iso.3.6.1.2.1.11.11.0 = Counter32: 0
iso.3.6.1.2.1.11.12.0 = Counter32: 0
iso.3.6.1.2.1.11.13.0 = Counter32: 527
iso.3.6.1.2.1.11.14.0 = Counter32: 0
iso.3.6.1.2.1.11.15.0 = Counter32: 5
iso.3.6.1.2.1.11.16.0 = Counter32: 526
iso.3.6.1.2.1.11.17.0 = Counter32: 0
iso.3.6.1.2.1.11.18.0 = Counter32: 0
iso.3.6.1.2.1.11.19.0 = Counter32: 0
iso.3.6.1.2.1.11.20.0 = Counter32: 0
iso.3.6.1.2.1.11.21.0 = Counter32: 0
iso.3.6.1.2.1.11.22.0 = Counter32: 0
iso.3.6.1.2.1.11.24.0 = Counter32: 0
iso.3.6.1.2.1.11.25.0 = Counter32: 0
iso.3.6.1.2.1.11.26.0 = Counter32: 0
iso.3.6.1.2.1.11.27.0 = Counter32: 0
iso.3.6.1.2.1.11.28.0 = Counter32: 541
iso.3.6.1.2.1.11.29.0 = Counter32: 0
iso.3.6.1.2.1.11.30.0 = INTEGER: 2
iso.3.6.1.2.1.11.31.0 = Counter32: 0
iso.3.6.1.2.1.11.32.0 = Counter32: 0
iso.3.6.1.2.1.25.1.1.0 = Timeticks: (71072) 0:11:50.72
iso.3.6.1.2.1.25.1.2.0 = Hex-STRING: 07 EA 01 1F 07 22 14 00 2B 00 00 
iso.3.6.1.2.1.25.1.3.0 = INTEGER: 393216
iso.3.6.1.2.1.25.1.4.0 = STRING: "BOOT_IMAGE=/vmlinuz-5.4.0-90-generic root=/dev/mapper/ubuntu--vg-ubuntu--lv ro ipv6.disable=1 maybe-ubiquity
"
iso.3.6.1.2.1.25.1.5.0 = Gauge32: 0
iso.3.6.1.2.1.25.1.6.0 = Gauge32: 163
iso.3.6.1.2.1.25.1.7.0 = INTEGER: 0
iso.3.6.1.2.1.25.1.7.1.1.0 = INTEGER: 1
iso.3.6.1.2.1.25.1.7.1.2.1.2.4.70.76.65.71 = STRING: "/usr/share/flag.sh"
iso.3.6.1.2.1.25.1.7.1.2.1.3.4.70.76.65.71 = ""
iso.3.6.1.2.1.25.1.7.1.2.1.4.4.70.76.65.71 = ""
iso.3.6.1.2.1.25.1.7.1.2.1.5.4.70.76.65.71 = INTEGER: 5
iso.3.6.1.2.1.25.1.7.1.2.1.6.4.70.76.65.71 = INTEGER: 1
iso.3.6.1.2.1.25.1.7.1.2.1.7.4.70.76.65.71 = INTEGER: 1
iso.3.6.1.2.1.25.1.7.1.2.1.20.4.70.76.65.71 = INTEGER: 4
iso.3.6.1.2.1.25.1.7.1.2.1.21.4.70.76.65.71 = INTEGER: 1
iso.3.6.1.2.1.25.1.7.1.3.1.1.4.70.76.65.71 = STRING: "HTB{redacted}"
iso.3.6.1.2.1.25.1.7.1.3.1.2.4.70.76.65.71 = STRING: "HTB{redacted}"
iso.3.6.1.2.1.25.1.7.1.3.1.3.4.70.76.65.71 = INTEGER: 1
iso.3.6.1.2.1.25.1.7.1.3.1.4.4.70.76.65.71 = INTEGER: 0
iso.3.6.1.2.1.25.1.7.1.4.1.2.4.70.76.65.71.1 = STRING: "HTB{redacted}"
iso.3.6.1.2.1.25.2.2.0 = INTEGER: 2034728
iso.3.6.1.2.1.25.2.3.1.1.1 = INTEGER: 1
iso.3.6.1.2.1.25.2.3.1.1.3 = INTEGER: 3
iso.3.6.1.2.1.25.2.3.1.1.6 = INTEGER: 6
iso.3.6.1.2.1.25.2.3.1.1.7 = INTEGER: 7
iso.3.6.1.2.1.25.2.3.1.1.8 = INTEGER: 8
iso.3.6.1.2.1.25.2.3.1.1.10 = INTEGER: 10
iso.3.6.1.2.1.25.2.3.1.1.35 = INTEGER: 35
iso.3.6.1.2.1.25.2.3.1.1.36 = INTEGER: 36
iso.3.6.1.2.1.25.2.3.1.1.38 = INTEGER: 38
iso.3.6.1.2.1.25.2.3.1.1.39 = INTEGER: 39
iso.3.6.1.2.1.25.2.3.1.1.40 = INTEGER: 40
iso.3.6.1.2.1.25.2.3.1.1.63 = INTEGER: 63
...(SNIP)...
```


- What is the customized version of the SNMP server?
	- **InFreight SNMP v0.91**


- Enumerate the custom script that is running on the system and submit its output as the answer.
	- **HTB{redacted}**


