
## Easy Lab

### Lab Information

We were commissioned by the company `Inlanefreight Ltd` to test three different servers in their internal network. The company uses many different services, and the IT security department felt that a penetration test was necessary to gain insight into their overall security posture.

The first server is an internal DNS server that needs to be investigated. In particular, our client wants to know what information we can get out of these services and how this information could be used against its infrastructure. Our goal is to gather as much information as possible about the server and find ways to use that information against the company. However, our client has made it clear that it is forbidden to attack the services aggressively using exploits, as these services are in production.

Additionally, our teammates have found the following credentials "ceil:qwer1234", and they pointed out that some of the company's employees were talking about SSH keys on a forum.

The administrators have stored a `flag.txt` file on this server to track our progress and measure success. Fully enumerate the target and submit the contents of this file as proof.


- Enumerate the server carefully and find the flag.txt file. Submit the contents of this file as the answer.
	- **HTB{redacted}**


### Port Scanning

Performing `nmap` port scan to look for open ports.

```bash
$ sudo nmap -sV -sC 10.129.3.207 -T4 -vvv
[sudo] password for kali: 
Starting Nmap 7.95 ( https://nmap.org ) at 2026-02-13 12:05 EST
NSE: Loaded 157 scripts for scanning.
NSE: Script Pre-scanning.
NSE: Starting runlevel 1 (of 3) scan.
Initiating NSE at 12:05
Completed NSE at 12:05, 0.00s elapsed
NSE: Starting runlevel 2 (of 3) scan.
Initiating NSE at 12:05
Completed NSE at 12:05, 0.00s elapsed
NSE: Starting runlevel 3 (of 3) scan.
Initiating NSE at 12:05
Completed NSE at 12:05, 0.00s elapsed
Initiating Ping Scan at 12:05
Scanning 10.129.3.207 [4 ports]
Completed Ping Scan at 12:05, 1.09s elapsed (1 total hosts)
Initiating Parallel DNS resolution of 1 host. at 12:05
Completed Parallel DNS resolution of 1 host. at 12:05, 0.04s elapsed
DNS resolution of 1 IPs took 0.04s. Mode: Async [#: 1, OK: 0, NX: 1, DR: 0, SF: 0, TR: 1, CN: 0]
Initiating SYN Stealth Scan at 12:05
Scanning 10.129.3.207 [1000 ports]
Discovered open port 21/tcp on 10.129.3.207
Discovered open port 53/tcp on 10.129.3.207
Discovered open port 22/tcp on 10.129.3.207
Discovered open port 2121/tcp on 10.129.3.207
Discovered open port 2121/tcp on 10.129.3.207
Discovered open port 2121/tcp on 10.129.3.207
Discovered open port 2121/tcp on 10.129.3.207
Increasing send delay for 10.129.3.207 from 0 to 5 due to max_successful_tryno increase to 5
Discovered open port 2121/tcp on 10.129.3.207
Completed SYN Stealth Scan at 12:05, 14.37s elapsed (1000 total ports)
Initiating Service scan at 12:05
Scanning 4 services on 10.129.3.207
Completed Service scan at 12:06, 49.85s elapsed (4 services on 1 host)
NSE: Script scanning 10.129.3.207.
NSE: Starting runlevel 1 (of 3) scan.
Initiating NSE at 12:06
Completed NSE at 12:06, 15.15s elapsed
NSE: Starting runlevel 2 (of 3) scan.
Initiating NSE at 12:06
NSE Timing: About 96.88% done; ETC: 12:07 (0:00:01 remaining)
Completed NSE at 12:07, 51.00s elapsed
NSE: Starting runlevel 3 (of 3) scan.
Initiating NSE at 12:07
Completed NSE at 12:07, 0.00s elapsed
Nmap scan report for 10.129.3.207
Host is up, received reset ttl 63 (0.21s latency).
Scanned at 2026-02-13 12:05:09 EST for 131s
Not shown: 996 closed tcp ports (reset)
PORT     STATE SERVICE REASON         VERSION
21/tcp   open  ftp     syn-ack ttl 63
| fingerprint-strings: 
|   GenericLines: 
|     220 ProFTPD Server (ftp.int.inlanefreight.htb) [10.129.3.207]
|     Invalid command: try being more creative
|_    Invalid command: try being more creative
22/tcp   open  ssh     syn-ack ttl 63 OpenSSH 8.2p1 Ubuntu 4ubuntu0.2 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 3f:4c:8f:10:f1:ae:be:cd:31:24:7c:a1:4e:ab:84:6d (RSA)
| ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQDa9RJRoAShv6FzLx23WYUh5z5vpaC1W0jTGGJuVfOVmOiwXu7d+eLRcf51dFwqe2J4OZ7z70w6Lrbm3RyKjNSZmY0ekPqbXyP0P6KqYn4eFdJkYp74zPUEvC/Y5U9gYmvCpoQ8gvqgAImYwhBXAlAmGDptcfRWRJ3KaRG/bbmfg0vsWqwYvDVfxEcCfbO1m7v6a9EiWELRTynHS26+oJbjY7tX5X05XMvj6L53JMWodHVsFf/vD4/qP2Ic0lafSBXuyKOcN5Tnx0DpExUwqj7GPLaM/ljG5LjF8y2yqZ85GeNQsgnsSxIL6dHiWkbUP4RXogUVI/prXLDU8307Wn/LWJQl3hxjJmunJfC5qw4a/JPLd9ydFSwadjYhztQoYIsSp41mr/wEVns8owxcKzBju74T9FptZ4I4UAzZLIWg1RJzpnJ7wpnFSUXFbvOa6V+nzeMesjYvKK1vx+UuNtrUuXPJm3BoYKjRJd2msog1KX4CguQNGZMS6LegiRIGde0=
|   256 7b:30:37:67:50:b9:ad:91:c0:8f:f7:02:78:3b:7c:02 (ECDSA)
| ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBNAdY+PFLa0XBlXCp3lL+mrrQKkU6bxWjDVEsljltzBYtugbDuER3AyIq1igFdgQPn+uKh5RtNQvPvX1Al8pA0Y=
|   256 88:9e:0e:07:fe:ca:d0:5c:60:ab:cf:10:99:cd:6c:a7 (ED25519)
|_ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIGKKM5saOYH/Fq3lWY1P4fchdWaH60Ib5/VQk6A00nAP
53/tcp   open  domain  syn-ack ttl 63 ISC BIND 9.16.1 (Ubuntu Linux)
| dns-nsid: 
|_  bind.version: 9.16.1-Ubuntu
2121/tcp open  ftp     syn-ack ttl 63 ProFTPD
1 service unrecognized despite returning data. If you know the service/version, please submit the following fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :
SF-Port21-TCP:V=7.95%I=7%D=2/13%Time=698F59DF%P=x86_64-pc-linux-gnu%r(Gene
SF:ricLines,9B,"220\x20ProFTPD\x20Server\x20\(ftp\.int\.inlanefreight\.htb
SF:\)\x20\[10\.129\.3\.207\]\r\n500\x20Invalid\x20command:\x20try\x20being
SF:\x20more\x20creative\r\n500\x20Invalid\x20command:\x20try\x20being\x20m
SF:ore\x20creative\r\n");
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

NSE: Script Post-scanning.
NSE: Starting runlevel 1 (of 3) scan.
Initiating NSE at 12:07
Completed NSE at 12:07, 0.00s elapsed
NSE: Starting runlevel 2 (of 3) scan.
Initiating NSE at 12:07
Completed NSE at 12:07, 0.00s elapsed
NSE: Starting runlevel 3 (of 3) scan.
Initiating NSE at 12:07
Completed NSE at 12:07, 0.01s elapsed
Read data files from: /usr/share/nmap
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 132.60 seconds
           Raw packets sent: 1228 (54.008KB) | Rcvd: 1125 (45.036KB)
```

We get open ports on `21` and `2121` which is used for `FTP`.


## FTP Enumeration

Trying to access the FTP server using the below credentials given in the Lab Information :-
- **username = ceil**
- **password = qwer1234**

```bash
$ ftp 10.129.3.207 2121
Connected to 10.129.3.207.
220 ProFTPD Server (Ceil's FTP) [10.129.3.207]
Name (10.129.3.207:kali): ceil
331 Password required for ceil
Password: 
230 User ceil logged in
Remote system type is UNIX.
Using binary mode to transfer files.
```

We were successfully able to login as **ceil** user and now we need to look for files or folders that might be useful to us.

```bash
ftp> ls -alh
229 Entering Extended Passive Mode (|||51293|)
150 Opening ASCII mode data connection for file list
drwxr-xr-x   4 ceil     ceil         4.0k Nov 10  2021 .
drwxr-xr-x   4 ceil     ceil         4.0k Nov 10  2021 ..
-rw-------   1 ceil     ceil          294 Nov 10  2021 .bash_history
-rw-r--r--   1 ceil     ceil          220 Nov 10  2021 .bash_logout
-rw-r--r--   1 ceil     ceil         3.7k Nov 10  2021 .bashrc
drwx------   2 ceil     ceil         4.0k Nov 10  2021 .cache
-rw-r--r--   1 ceil     ceil          807 Nov 10  2021 .profile
drwx------   2 ceil     ceil         4.0k Nov 10  2021 .ssh
-rw-------   1 ceil     ceil          759 Nov 10  2021 .viminfo
ftp> cd .ssh
250 CWD command successful
ftp> ls -alh
229 Entering Extended Passive Mode (|||9781|)
150 Opening ASCII mode data connection for file list
drwx------   2 ceil     ceil         4.0k Nov 10  2021 .
drwxr-xr-x   4 ceil     ceil         4.0k Nov 10  2021 ..
-rw-rw-r--   1 ceil     ceil          738 Nov 10  2021 authorized_keys
-rw-------   1 ceil     ceil         3.3k Nov 10  2021 id_rsa
-rw-r--r--   1 ceil     ceil          738 Nov 10  2021 id_rsa.pub
226 Transfer complete
ftp> get id_rsa
local: id_rsa remote: id_rsa
229 Entering Extended Passive Mode (|||61868|)
150 Opening BINARY mode data connection for id_rsa (3381 bytes)
100% |***********************************************************************************************************************************************************************************************|  3381       16.28 MiB/s    00:00 ETA
226 Transfer complete
3381 bytes received in 00:00 (15.78 KiB/s)
```

From listing the directories it is clear we can access the `.ssh` directory and by checking the permissions we can access the `ssh` private key of **ceil** user and access the SSH server as **ceil**.

### SSH Login

Accessing the SSH server using the private key of **ceil** user. Remember to give proper permissions to the private key using `chmod 600 id_rsa` command.

```bash
$ ssh -i id_rsa ceil@10.129.3.207
The authenticity of host '10.129.3.207 (10.129.3.207)' can't be established.
ED25519 key fingerprint is SHA256:AtNYHXCA7dVpi58LB+uuPe9xvc2lJwA6y7q82kZoBNM.
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '10.129.3.207' (ED25519) to the list of known hosts.
Welcome to Ubuntu 20.04.1 LTS (GNU/Linux 5.4.0-90-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

  System information as of Fri 13 Feb 2026 05:19:25 PM UTC

  System load:  0.02              Processes:               177
  Usage of /:   86.3% of 3.87GB   Users logged in:         0
  Memory usage: 14%               IPv4 address for ens192: 10.129.3.207
  Swap usage:   0%

  => / is using 86.3% of 3.87GB

 * Super-optimized for small spaces - read how we shrank the memory
   footprint of MicroK8s to make it the smallest full K8s around.

   https://ubuntu.com/blog/microk8s-memory-optimisation

116 updates can be installed immediately.
1 of these updates is a security update.
To see these additional updates run: apt list --upgradable


The list of available updates is more than a week old.
To check for new updates run: sudo apt update

Last login: Wed Nov 10 05:48:02 2021 from 10.10.14.20
ceil@NIXEASY:~$ whoami
ceil
```

### Getting `flag.txt` Location

From the below result we find out the location of the `flag.txt` file.

```bash
$ cd .. && ls -alh
total 20K
drwxr-xr-x  5 root     root     4.0K Nov 10  2021 .
drwxr-xr-x 20 root     root     4.0K Dec 15  2020 ..
drwxr-xr-x  4 ceil     ceil     4.0K Nov 10  2021 ceil
drwxr-xr-x  3 cry0l1t3 cry0l1t3 4.0K Nov 10  2021 cry0l1t3
drwxr-xr-x  4 ceil     ceil     4.0K Nov 10  2021 flag
```

### Getting `flag.txt`

```bash
ceil@NIXEASY:/home$ cat flag/flag.txt
HTB{redacted}
```
