
## Files

One core principle of Linux is that everything is a file. These categories are the following:
- Configuration files
- Databases
- Notes
- Scripts
- Cronjobs
- SSH keys

## Cronjobs

- Cronjobs are scheduled tasks in the Linux system.
- These jobs are time based and can be anything from simple scripts to complex system maintenance tasks and run automatically at predetermined intervals of time.
- Cron Jobs are managed by the Cron Daemon, a background process that continuously checks a configuration file called the “crontab” for scheduled tasks.

---
## Questions and Solutions


- Examine the target and find out the password of the user Will. Then, submit the password as the answer.
	- **TUqr7QfLTLhruhVbCP**

SSH to with user "`kira`" and password "`L0vey0u1!`"

#### SSH into the Target Machine

```bash
ssh kira@10.129.202.64
```

```bash
kira@nix01:~$ ls
Desktop  Documents  Downloads  Music  Pictures  Public  Templates  Videos
kira@nix01:~$ whoami
kira
```

The target machine contains `python3.8` version you can checking using `python3 -V` so the `.py` will crash and hence we use `python3.9` the newer version to execute the program. The program crashed earlier due to a piece of code which was not present in `python 3.8` or earlier versions.

```bash
kira@nix01:~$ python3.9 firefox_decrypt.py 
Select the Mozilla profile you wish to decrypt
1 -> lktd9y8y.default
2 -> ytb95ytb.default-release
2

Website:   https://dev.inlanefreight.com
Username: 'will@inlanefreight.htb'
Password: 'TUqr7QfLTLhruhVbCP'
```