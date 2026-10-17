
## IMAP/POP3

- SMTP is used for sending emails.
- IMAP/POP3 are email retrieval protocols or IMAP/POP3 is for receiving the emails.
- IMAP syncs mail across devices, leaving messages on the server while POP3 is for offline and local access.

## IMAP

- Allows access to emails from mail server and allows online management of emails directly on the server that supports folder structures.
- IMAP is a network protocol for the online management of emails in remote server.
- IMAP is text based and has extended functions, such as browsing emails directly on the server.
- IMAP synchronizes messages across multiple devices by storing them on a server, making it ideal for mobile access.

## POP3

- Doesn't have same functionality as IMAP.
- Provides listing, retrieving, and deleting emails as functions at the email server.
- POP3 downloads emails to a single device and usually removes them from the server, making it better for offline access.

## IMAP/POP3 Configurations

### Dangerous Settings

|**Setting**|**Description**|
|---|---|
|`auth_debug`|Enables all authentication debug logging.|
|`auth_debug_passwords`|This setting adjusts log verbosity, the submitted passwords, and the scheme gets logged.|
|`auth_verbose`|Logs unsuccessful authentication attempts and their reasons.|
|`auth_verbose_passwords`|Passwords used for authentication are logged and can also be truncated.|
|`auth_anonymous_username`|This specifies the username to be used when logging in with the ANONYMOUS SASL mechanism.|

## IMAP/POP3 Ports

- `110` and `995` used by POP3.
- `143` and `993` used by IMAP.
- The higher ports `993` and `995` use TLS/SSL to encrypt the communication between client and server.

---
## Questions and Solutions

- Figure out the exact organization name from the IMAP/POP3 service and submit it as the answer.
	- **InlaneFreight Ltd**
### Footprinting the Service

Enumerating the IMAP/POP3 service using `nmap`.

```bash
$ sudo nmap 10.129.17.61 -sV -p110,143,993,995 -sC
[sudo] password for kali: 
Starting Nmap 7.95 ( https://nmap.org ) at 2026-01-29 13:12 EST
Nmap scan report for 10.129.17.61
Host is up (0.21s latency).

PORT    STATE SERVICE  VERSION
110/tcp open  pop3     Dovecot pop3d
|_ssl-date: TLS randomness does not represent time
| ssl-cert: Subject: commonName=dev.inlanefreight.htb/organizationName=InlaneFreight Ltd/stateOrProvinceName=London/countryName=UK
| Not valid before: 2021-11-08T23:10:05
|_Not valid after:  2295-08-23T23:10:05
|_pop3-capabilities: CAPA UIDL SASL STLS AUTH-RESP-CODE RESP-CODES PIPELINING TOP
143/tcp open  imap     Dovecot imapd
|_ssl-date: TLS randomness does not represent time
| ssl-cert: Subject: commonName=dev.inlanefreight.htb/organizationName=InlaneFreight Ltd/stateOrProvinceName=London/countryName=UK
| Not valid before: 2021-11-08T23:10:05
|_Not valid after:  2295-08-23T23:10:05
|_imap-capabilities: IMAP4rev1 STARTTLS LITERAL+ LOGINDISABLEDA0001 SASL-IR IDLE ENABLE have capabilities listed Pre-login ID post-login OK LOGIN-REFERRALS more
993/tcp open  ssl/imap Dovecot imapd
|_ssl-date: TLS randomness does not represent time
| ssl-cert: Subject: commonName=dev.inlanefreight.htb/organizationName=InlaneFreight Ltd/stateOrProvinceName=London/countryName=UK
| Not valid before: 2021-11-08T23:10:05
|_Not valid after:  2295-08-23T23:10:05
|_imap-capabilities: IMAP4rev1 LITERAL+ IDLE SASL-IR have ENABLE capabilities listed AUTH=PLAINA0001 Pre-login ID post-login OK LOGIN-REFERRALS more
995/tcp open  ssl/pop3 Dovecot pop3d
|_pop3-capabilities: CAPA UIDL SASL(PLAIN) PIPELINING AUTH-RESP-CODE RESP-CODES USER TOP
|_ssl-date: TLS randomness does not represent time
| ssl-cert: Subject: commonName=dev.inlanefreight.htb/organizationName=InlaneFreight Ltd/stateOrProvinceName=London/countryName=UK
| Not valid before: 2021-11-08T23:10:05
|_Not valid after:  2295-08-23T23:10:05

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 24.04 seconds
```

- What is the FQDN that the IMAP and POP3 servers are assigned to?
	- **dev.inlanefreight.htb**

- Enumerate the IMAP service and submit the flag as the answer. (Format: HTB{...})
	- **HTB{redacted}**
### Logging to IMAP 

Logging to IMAP using `curl` using the below given credentials.

- **username = robin**
- **password = robin**

```bash
$ curl -k 'imaps://10.129.17.61' --user robin:robin -v
*   Trying 10.129.17.61:993...
* TLSv1.3 (OUT), TLS handshake, Client hello (1):
* TLSv1.3 (IN), TLS handshake, Server hello (2):
* TLSv1.3 (IN), TLS change cipher, Change cipher spec (1):
* TLSv1.3 (IN), TLS handshake, Encrypted Extensions (8):
* TLSv1.3 (IN), TLS handshake, Certificate (11):
* TLSv1.3 (IN), TLS handshake, CERT verify (15):
* TLSv1.3 (IN), TLS handshake, Finished (20):
* TLSv1.3 (OUT), TLS change cipher, Change cipher spec (1):
* TLSv1.3 (OUT), TLS handshake, Finished (20):
* SSL connection using TLSv1.3 / TLS_AES_256_GCM_SHA384 / x25519 / RSASSA-PSS
* Server certificate:
*  subject: C=UK; ST=London; L=London; O=InlaneFreight Ltd; OU=DevOps Dep�artment; CN=dev.inlanefreight.htb; emailAddress=cto.dev@dev.inlanefreight.htb
*  start date: Nov  8 23:10:05 2021 GMT
*  expire date: Aug 23 23:10:05 2295 GMT
*  issuer: C=UK; ST=London; L=London; O=InlaneFreight Ltd; OU=DevOps Dep�artment; CN=dev.inlanefreight.htb; emailAddress=cto.dev@dev.inlanefreight.htb
*  SSL certificate verify result: self-signed certificate (18), continuing anyway.
*   Certificate level 0: Public key type RSA (2048/112 Bits/secBits), signed using sha256WithRSAEncryption
* Connected to 10.129.17.61 (10.129.17.61) port 993
* TLSv1.3 (IN), TLS handshake, Newsession Ticket (4):
* TLSv1.3 (IN), TLS handshake, Newsession Ticket (4):
< * OK [CAPABILITY IMAP4rev1 SASL-IR LOGIN-REFERRALS ID ENABLE IDLE LITERAL+ AUTH=PLAIN] HTB{roncfbw7iszerd7shni7jr2343zhrj}
> A001 CAPABILITY
< * CAPABILITY IMAP4rev1 SASL-IR LOGIN-REFERRALS ID ENABLE IDLE LITERAL+ AUTH=PLAIN
< A001 OK Pre-login capabilities listed, post-login capabilities have more.
> A002 AUTHENTICATE PLAIN AHJvYmluAHJvYmlu
< * CAPABILITY IMAP4rev1 SASL-IR LOGIN-REFERRALS ID ENABLE IDLE SORT SORT=DISPLAY THREAD=REFERENCES THREAD=REFS THREAD=ORDEREDSUBJECT MULTIAPPEND URL-PARTIAL CATENATE UNSELECT CHILDREN NAMESPACE UIDPLUS LIST-EXTENDED I18NLEVEL=1 CONDSTORE QRESYNC ESEARCH ESORT SEARCHRES WITHIN CONTEXT=SEARCH LIST-STATUS BINARY MOVE SNIPPET=FUZZY PREVIEW=FUZZY LITERAL+ NOTIFY SPECIAL-USE
< A002 OK Logged in
> A003 LIST "" *
< * LIST (\Noselect \HasChildren) "." DEV
* LIST (\Noselect \HasChildren) "." DEV
< * LIST (\Noselect \HasChildren) "." DEV.DEPARTMENT
* LIST (\Noselect \HasChildren) "." DEV.DEPARTMENT
< * LIST (\HasNoChildren) "." DEV.DEPARTMENT.INT
* LIST (\HasNoChildren) "." DEV.DEPARTMENT.INT
< * LIST (\HasNoChildren) "." INBOX
* LIST (\HasNoChildren) "." INBOX
< A003 OK List completed (0.001 + 0.000 secs).
* Connection #0 to host 10.129.17.61 left intact
```

- What is the customized version of the POP3 server?
	- **InFreight POP3 v9.188**

### Connecting to POP3

Connecting to POP3 service using `openssl` showed us the POP3 server customized version.

```bash
$ openssl s_client -connect 10.129.17.61:pop3s
```


- What is the admin email address?
	- devadmin@inlanefreight.htb


- Try to access the emails on the IMAP server and submit the flag as the answer. (Format: HTB{...})
	- **HTB{redacted}**

### Connecting to IMAP

Connecting to IMAP service using `openssl` and then using the below credentials to authenticate ourselves into the IMAP server.

- **username = robin**
- **password = robin**

```bash
$ openssl s_client -connect 10.129.17.61:imaps
1 LOGIN robin robin
1 OK [CAPABILITY IMAP4rev1 SASL-IR LOGIN-REFERRALS ID ENABLE IDLE SORT SORT=DISPLAY THREAD=REFERENCES THREAD=REFS THREAD=ORDEREDSUBJECT MULTIAPPEND URL-PARTIAL CATENATE UNSELECT CHILDREN NAMESPACE UIDPLUS LIST-EXTENDED I18NLEVEL=1 CONDSTORE QRESYNC ESEARCH ESORT SEARCHRES WITHIN CONTEXT=SEARCH LIST-STATUS BINARY MOVE SNIPPET=FUZZY PREVIEW=FUZZY LITERAL+ NOTIFY SPECIAL-USE] Logged in
1 LIST "" *
* LIST (\Noselect \HasChildren) "." DEV
* LIST (\Noselect \HasChildren) "." DEV.DEPARTMENT
* LIST (\HasNoChildren) "." DEV.DEPARTMENT.INT
* LIST (\HasNoChildren) "." INBOX
1 OK List completed (0.001 + 0.000 secs).
1 SELECT DEV.DEPARTMENT.INT
* FLAGS (\Answered \Flagged \Deleted \Seen \Draft)
* OK [PERMANENTFLAGS (\Answered \Flagged \Deleted \Seen \Draft \*)] Flags permitted.
* 1 EXISTS
* 0 RECENT
* OK [UIDVALIDITY 1636414279] UIDs valid
* OK [UIDNEXT 2] Predicted next UID
1 OK [READ-WRITE] Select completed (0.004 + 0.000 + 0.003 secs).
1 FETCH 1 BODY[]
* 1 FETCH (BODY[] {167}
Subject: Flag
To: Robin <robin@inlanefreight.htb>
From: CTO <devadmin@inlanefreight.htb>
Date: Wed, 03 Nov 2021 16:13:27 +0200

HTB{redacted}
)
1 OK Fetch completed (0.003 + 0.000 + 0.002 secs).
```

