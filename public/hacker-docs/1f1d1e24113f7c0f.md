
## TFTP Commands

|**Commands**|**Description**|
|---|---|
|`connect`|Sets the remote host, and optionally the port, for file transfers.|
|`get`|Transfers a file or set of files from the remote host to the local host.|
|`put`|Transfers a file or set of files from the local host onto the remote host.|
|`quit`|Exits tftp.|
|`status`|Shows the current status of tftp, including the current transfer mode (ascii or binary), connection status, time-out value, and so on.|
|`verbose`|Turns verbose mode, which displays additional information during file transfer, on or off.|

## Anonymous Login

- **username** => `anonymous`
- **password** => **just press enter blank password**

```bash
ftp <FTP server IP>
```


## Footprinting the Service

```bash
sudo nmap -sV -p21 -sC -A <TARGET IP>
```


## Bruteforcing 

- If there are no `anonymous` logins available we can bruteforce the FTP service to the server's credentials
- `-n` use this switch to specify the port if required.

```bash
medusa -u <USERNAME> -P <WORDLIST> -h <TARGET_IP> -M ftp 
```


## FTP Bounce Attack

- We are using a vulnerable FTP server and sending our commands via that server to the target machine we want to scan so that the scanner's origin IP remains hidden. 
- You need to find the vulnerable FTP server to do this first.
- The vulnerable FTP server uses `anonymous` login but if that's not possible then try with valid user credentials.

```bash
nmap -Pn -v -n -p<PORT> -b anonymous:password@<vulnerable_FTP_server> <TARGT_MACHINE_IP_YOU_WANT_TO_SCAN>
```

