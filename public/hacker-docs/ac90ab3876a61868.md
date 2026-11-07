
## Manual Enumeration

### Searching for config files

```bash
for l in $(echo ".conf .config .cnf");do echo -e "\nFile extension: " $l; find / -name *$l 2>/dev/null | grep -v "lib\|fonts\|share\|core" ;done
```

### Searching for database files

```bash
for l in $(echo ".sql .db .*db .db*");do echo -e "\nDB File extension: " $l; find / -name *$l 2>/dev/null | grep -v "doc\|lib\|headers\|share\|man";done
```

### Searching for notes

```bash
find /home/* -type f -name "*.txt" -o ! -name "*.*"
```

### Searching for scripts

```bash
for l in $(echo ".py .pyc .pl .go .jar .c .sh");do echo -e "\nFile extension: " $l; find / -name *$l 2>/dev/null | grep -v "doc\|lib\|headers\|share";done
```

### Enumerating Cronjobs

#### List Periodic Automation Directories

- **PERIODIC AUTOMATION DIRECTORIES :** specialized system folders in Linux used to execute scripts automatically at fixed, predictable time intervals.

```bash
ls -la /etc/cron.*/
```

### Enumerating history files

```bash
tail -n5 /home/*/.bash*
```

### Enumerating log files

The entirety of log files can be divided into four categories:

- Application logs
- Event logs
- Service logs
- System logs

|**File**|**Description**|
|---|---|
|`/var/log/messages`|Generic system activity logs.|
|`/var/log/syslog`|Generic system activity logs.|
|`/var/log/auth.log`|(Debian) All authentication related logs.|
|`/var/log/secure`|(RedHat/CentOS) All authentication related logs.|
|`/var/log/boot.log`|Booting information.|
|`/var/log/dmesg`|Hardware and drivers related information and logs.|
|`/var/log/kern.log`|Kernel related warnings, errors and logs.|
|`/var/log/faillog`|Failed login attempts.|
|`/var/log/cron`|Information related to cron jobs.|
|`/var/log/mail.log`|All mail server related logs.|
|`/var/log/httpd`|All Apache related logs.|
|`/var/log/mysqld.log`|All MySQL server related logs.|

```bash
for i in $(ls /var/log/* 2>/dev/null);do GREP=$(grep "accepted\|session opened\|session closed\|failure\|failed\|ssh\|password changed\|new user\|delete user\|sudo\|COMMAND\=\|logs" $i 2>/dev/null); if [[ $GREP ]];then echo -e "\n#### Log file: " $i; grep "accepted\|session opened\|session closed\|failure\|failed\|ssh\|password changed\|new user\|delete user\|sudo\|COMMAND\=\|logs" $i 2>/dev/null;fi;done
```

## Scripts Way
### Credential Hunting using `mimipenguin`

- `git clone` the repository from the link [mimipenguin](https://github.com/huntergregal/mimipenguin) A tool to dump the login password from the current linux desktop user.
- Then run the below command.

```bash
sudo python mimipenguin.py 
```

### Credential Hunting using `LaZagne`

- `git clone` the repository from the link [LaZagne](https://github.com/alessandroz/lazagne) Then setup the tool by creating a python virtual environment and installing the requirements.txt file and then `cd` into the Linux folder and run the `laZagne.py`.

```bash
sudo python laZagne.py all
```

### Credential Hunting of Browser Data

- `git clone` from this repo [firefox_decrypt](https://github.com/unode/firefox_decrypt)
- Run the below command to extract browser credentials.
- Form the compiled binary using `pyinstaller -F firefox_decrypt.py` and then transfer this binary to the target machine and run the tool. This creates a standalone binary which doesn't require any dependencies during runtime. You need to install `pyinstaller` first inside a python virtual environment.

```bash
python firefox_decrypt.py
# OR
./firefox_decrypt
```

