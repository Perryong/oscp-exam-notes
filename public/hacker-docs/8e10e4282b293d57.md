
## SMB

- **SMB** stands for **Server Message Block**.
- Client server protocol that regulates access to files, directories and other network resources like printers, routers or interfaces released for the SMB network. 
- The SMB protocol enables the client to communicate with other participants in the same network to access files or services shared with it on the network.
- Access rights are maintained by **Access Control Lists (ACL)**. They are controlled on the basis of **read**, **write**, **full access** for individual users or groups. 
- These files, directories or other network resources are called **shares** in SMB. **ACL**s are defined over these **shares**.


## Samba

- Alternative implementation of the SMB protocol developed for Unix based operating systems.
- Samba implements **CIFS** which allows it to communicate with Windows systems.
- When SMB commands are transmitted over Samba in older NetBIOS service, connections typically occur in TCP ports `137`, `138`, `139`.
- **CIFS** operates over TCP port `445` exclusively.
- **SMB** is the protocol and **Samba** is the implementation of the **SMB** protocol.
- **The NetBIOS API** provided a blueprint for an application to connect and share data with other computers. A group or collection of computers in the **SMB** protocol is called a **workgroup**.

## samba.conf Configurations

- Configuration file location -> `/etc/samba/samba.conf` 

### Dangerous Settings

|**Setting**|**Description**|
|---|---|
|`browseable = yes`|Allow listing available shares in the current share?|
|`read only = no`|Forbid the creation and modification of files?|
|`writable = yes`|Allow users to create and modify files?|
|`guest ok = yes`|Allow connecting to the service without using a password?|
|`enable privileges = yes`|Honor privileges assigned to specific SID?|
|`create mask = 0777`|What permissions must be assigned to the newly created files?|
|`directory mask = 0777`|What permissions must be assigned to the newly created directories?|
|`logon script = script.sh`|What script needs to be executed on the user's login?|
|`magic script = script.sh`|Which script should be executed when the script gets closed?|
|`magic output = script.out`|Where the output of the magic script needs to be stored?|

---
## Questions and Solutions

- What version of the SMB server is running on the target system? Submit the entire banner as the answer.
	- **Samba smbd 4.6.2**


```bash
sudo nmap -sV -sC 10.129.5.71
```

- What is the name of the accessible share on the target?
	- **sambashare**

```bash
$ nxc smb 10.129.5.71 --shares -u '' -p ''
SMB         10.129.5.71     445    DEVSMB           [*] Unix - Samba (name:DEVSMB) (domain:) (signing:False) (SMBv1:False) 
SMB         10.129.5.71     445    DEVSMB           [+] \: 
SMB         10.129.5.71     445    DEVSMB           [*] Enumerated shares
SMB         10.129.5.71     445    DEVSMB           Share           Permissions     Remark
SMB         10.129.5.71     445    DEVSMB           -----           -----------     ------
SMB         10.129.5.71     445    DEVSMB           print$                          Printer Drivers
SMB         10.129.5.71     445    DEVSMB           sambashare      READ            InFreight SMB v3.1
SMB         10.129.5.71     445    DEVSMB           IPC$                            IPC Service (InlaneFreight SMB server (Samba, Ubuntu))
```

- Connect to the discovered share and find the flag.txt file. Submit the contents as the answer.
	- **HTB{redacted}**


First we need to connect to the particular share and download the file.

```bash
$ smbclient //10.129.5.71/sambashare
Password for [WORKGROUP\kali]:
Try "help" to get a list of possible commands.
smb: \> ls
  .                                   D        0  Mon Nov  8 08:43:14 2021
  ..                                  D        0  Mon Nov  8 10:53:19 2021
  .profile                            H      807  Tue Feb 25 07:03:22 2020
  contents                            D        0  Mon Nov  8 08:43:45 2021
  .bash_logout                        H      220  Tue Feb 25 07:03:22 2020
  .bashrc                             H     3771  Tue Feb 25 07:03:22 2020

                4062912 blocks of size 1024. 506288 blocks available
smb: \> cd contents
smb: \contents\> ls
  .                                   D        0  Mon Nov  8 08:43:45 2021
  ..                                  D        0  Mon Nov  8 08:43:14 2021
  flag.txt                            N       38  Mon Nov  8 08:43:45 2021

                4062912 blocks of size 1024. 506288 blocks available
smb: \contents\> get flag.txt
getting file \contents\flag.txt of size 38 as flag.txt (0.0 KiloBytes/sec) (average 0.0 KiloBytes/sec)
smb: \contents\> exit
```

The `flag.txt` got downloaded in your local machine so use `cat` command to read its contents.

- Find out which domain the server belongs to.
	- **DEVOPS**

The domain in SMB is basically used for authentication in the SMB server. We are using `rpcclient` to enumerate the SMB service and make queries on the server to gather information like domain.

```bash
$ rpcclient -U "" 10.129.5.71                     
Password for [WORKGROUP\]:
rpcclient $> querydominfo
Domain:         DEVOPS
Server:         DEVSMB
Comment:        InlaneFreight SMB server (Samba, Ubuntu)
Total Users:    0
Total Groups:   0
Total Aliases:  0
Sequence No:    1769159935
Force Logoff:   4294967295
Domain Server State:    0x1
Server Role:    ROLE_DOMAIN_PDC
Unknown 3:      0x1
```

- Find additional information about the specific share we found previously and submit the customized version of that specific share as the answer.
	- **InFreight SMB v3.1**


From our `netexec` or `nxc` anonymous share listing we found remark on the **smbshare**. That is the answer to the above question.

- What is the full system path of that specific share? (format: "/directory/names")
	- **/home/sambashare**

Using `rpcclient` to get the **sambashare** path.

```bash
$ rpcclient -U "" 10.129.5.71
Password for [WORKGROUP\]:
rpcclient $> netsharegetinfo sambashare
netname: sambashare
        remark: InFreight SMB v3.1
        path:   C:\home\sambauser\
        password:
        type:   0x0
        perms:  0
        max_uses:       -1
        num_uses:       1
revision: 1
type: 0x8004: SEC_DESC_DACL_PRESENT SEC_DESC_SELF_RELATIVE 
DACL
        ACL     Num ACEs:       1       revision:       2
        ---
        ACE
                type: ACCESS ALLOWED (0) flags: 0x00 
                Specific bits: 0x1ff
                Permissions: 0x1f01ff: SYNCHRONIZE_ACCESS WRITE_OWNER_ACCESS WRITE_DAC_ACCESS READ_CONTROL_ACCESS DELETE_ACCESS 
                SID: S-1-1-0
```