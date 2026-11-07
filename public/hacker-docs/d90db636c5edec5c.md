
## FTP

- FTP stands for **File Transfer Protocol**.
- Runs within the application layer of the TCP/IP protocol.
- Works with browsers and email clients to provide services.
- The client and server establish connection and the client sends commands to the server and the server returns status codes.
- to **store, manage, and transfer files** between computers over a network, acting as a central digital warehouse for reliable uploads, downloads
- There are 2 types of **FTP**
	- **active** : client establishes connection to the FTP server via `port 21` and the server gives responses through status codes.
		
	- **passive** : if a firewall protects the client the server cannot reply because all external connections are blocked but if the client initiates the connection then the firewall does not block the transfer.
	  
- `Port 21`.


## TFTP

- Simpler than FTP.
- Performs file transfer between client and server processes.
- **Does not provide Authentication unlike FTP and its security features.**
- Uses UDP not TCP like FTP.


## vsFTPd Configurations

- FTP server usually present in the Linux.
- Present in the `/etc/vsftpd.conf` 

### Dangerous Settings

| **Setting**                    | **Description**                                                                    |
| ------------------------------ | ---------------------------------------------------------------------------------- |
| `anonymous_enable=YES`         | Allowing anonymous login?                                                          |
| `anon_upload_enable=YES`       | Allowing anonymous to upload files?                                                |
| `anon_mkdir_write_enable=YES`  | Allowing anonymous to create new directories?                                      |
| `no_anon_password=YES`         | Do not ask anonymous for password?                                                 |
| `anon_root=/home/username/ftp` | Directory for anonymous.                                                           |
| `write_enable=YES`             | Allow the usage of FTP commands: STOR, DELE, RNFR, RNTO, MKD, RMD, APPE, and SITE? |

## FTP Bounce Attack

- When scanning other devices in the FTP network or we want to execute commands, as an attacker we send them directly so in **FTP Bounce Attack**, we send these commands via a FTP server which allows `PORT Commands`.
- This hides the origin of the device which has actually sent those commands. First you need to identify the **vulnerable FTP Server**.

---
## Questions and Solutions

- Which version of the FTP server is running on the target system? Submit the entire banner as the answer.
	- **InFreight FTP v1.1**

Performing footprinting on FTP service using `nmap`.

```bash
$ sudo nmap -sV -sC -p21 10.129.76.51
[sudo] password for kali: 
Starting Nmap 7.95 ( https://nmap.org ) at 2026-01-20 12:16 EST
Nmap scan report for 10.129.76.51
Host is up (0.30s latency).

PORT   STATE SERVICE VERSION
21/tcp open  ftp
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
|_-rw-r--r--   1 ftpuser  ftpuser        39 Nov  8  2021 flag.txt
| fingerprint-strings: 
|   GenericLines: 
|     220 InFreight FTP v1.1
|     Invalid command: try being more creative
|     Invalid command: try being more creative
|   NULL: 
|_    220 InFreight FTP v1.1
1 service unrecognized despite returning data. If you know the service/version, please submit the following fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :
SF-Port21-TCP:V=7.95%I=7%D=1/20%Time=696FB875%P=x86_64-pc-linux-gnu%r(NULL
SF:,18,"220\x20InFreight\x20FTP\x20v1\.1\r\n")%r(GenericLines,74,"220\x20I
SF:nFreight\x20FTP\x20v1\.1\r\n500\x20Invalid\x20command:\x20try\x20being\
SF:x20more\x20creative\r\n500\x20Invalid\x20command:\x20try\x20being\x20mo
SF:re\x20creative\r\n");

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 73.29 seconds
```

- Enumerate the FTP server and find the flag.txt file. Submit the contents of it as the answer.
	- **HTB{redacted}**

From the above scan we found out there is a `flag.txt` file inside the FTP server. So we will try **anonymous login** into the server and get the required file and read its contents.

```bash
 ftp 10.129.76.51
Connected to 10.129.76.51.
220 InFreight FTP v1.1
Name (10.129.76.51:kali): anonymous
331 Anonymous login ok, send your complete email address as your password
Password: 
230 Anonymous access granted, restrictions apply
Remote system type is UNIX.
Using binary mode to transfer files.
ftp> 
```

So **anonymous login** is possible. So lets try to get the `flag.txt` file and read its contents to get the flag.

```bash
ftp> ls
229 Entering Extended Passive Mode (|||20286|)
150 Opening ASCII mode data connection for file list
-rw-r--r--   1 ftpuser  ftpuser        39 Nov  8  2021 flag.txt
226 Transfer complete
ftp> get flag.txt
local: flag.txt remote: flag.txt
229 Entering Extended Passive Mode (|||15981|)
150 Opening BINARY mode data connection for flag.txt (39 bytes)
    39       23.22 KiB/s 
226 Transfer complete
39 bytes received in 00:00 (0.08 KiB/s)
```

So the `flag.txt` got downloaded in our local machine so use `cat` command to read its contents and get the flag.

