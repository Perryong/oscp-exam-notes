
## MSSQL

- MSSQL is Microsoft's SQL-based relational database management system.
- MSSQL is a closed source and initially invented to run to Windows Operating System.
- Developers created MSSQL to maintain .NET applications in mind but there are versions of MSSQL which also run on Linux and MacOS platforms.
- Default `TCP Port 1433`.

## MSSQL Clients

- SQL Server Management Studio or SSMS comes as a feature or part of the package when the MSSQL is downloaded and installed.
- It is commonly installed on the server for initial configuration and long term management of databases by clients.
- SSMS is a client-side application so it can be installed and used on any system by both admin and user planning to manage the SSQL database.
- This means we could come across a vulnerable system with SSMS with saved credentials that allow us to connect to the database.
- SQL Server Management Studio (SSMS) is an integrated environment for managing any SQL infrastructure. Use SSMS to access, configure, manage, administer, and develop all components of SQL Server.

## MSSQL Databases

MSSQL has default system databases that can help us understand the structure of all the databases that may be hosted on a target server. Here are the default databases and a brief description of each:

|Default System Database|Description|
|---|---|
|`master`|Tracks all system information for an SQL server instance|
|`model`|Template database that acts as a structure for every new database created. Any setting changed in the model database will be reflected in any new database created after changes to the model database|
|`msdb`|The SQL Server Agent uses this database to schedule jobs & alerts|
|`tempdb`|Stores temporary objects|
|`resource`|Read-only database containing system objects included with SQL server|

## MSSQL Configurations

- When an admin initially installs and configures MSSQL to be network accessible, the SQL service will likely run as `NT SERVICE\MSSQLSERVER`.

### Dangerous Settings

This is not an extensive list because there are countless ways MSSQL databases can be configured by admins based on the needs of their respective organizations. We may benefit from looking into the following:

- MSSQL clients not using encryption to connect to the MSSQL server
- The use of self-signed certificates when encryption is being used. It is possible to spoof self-signed certificates.
- The use of [named pipes](https://docs.microsoft.com/en-us/sql/tools/configuration-manager/named-pipes-properties?view=sql-server-ver15)
- Weak & default `sa` credentials. Admins may forget to disable this account.


---
## Questions and Solutions


- Enumerate the target using the concepts taught in this section. List the hostname of MSSQL server.
	- **ILF-SQL-01**

Using the metasploit `auxiliary/scanner/mssql/mssql_ping` to find MSSQL server hostname.

```bash
$ msfconsole
msf > use auxiliary/scanner/mssql/mssql_ping
msf auxiliary(scanner/mssql/mssql_ping) > set RHOSTS 10.129.24.157
RHOSTS => 10.129.24.157
msf auxiliary(scanner/mssql/mssql_ping) > run
[*] 10.129.24.157         - SQL Server information for 10.129.24.157:
[+] 10.129.24.157         -    ServerName      = ILF-SQL-01
[+] 10.129.24.157         -    InstanceName    = MSSQLSERVER
[+] 10.129.24.157         -    IsClustered     = No
[+] 10.129.24.157         -    Version         = 15.0.2000.5
[+] 10.129.24.157         -    tcp             = 1433
[+] 10.129.24.157         -    np              = \\ILF-SQL-01\pipe\sql\query
[*] 10.129.24.157         - Scanned 1 of 1 hosts (100% complete)
[*] Auxiliary module execution completed
```


- Connect to the MSSQL instance running on the target using the account (backdoor:Password1), then list the non-default database present on the server.
	- **Employees**


We will use the below credentials and `mssqlclient.py` to connect to the target MSSQL server and then list the non-default database present in the server. The code link is provided above and the default databases are listed above as well so read it and answer accordingly.

### Connecting to MSSQL

```bash
$ python3 mssqlclient.py backdoor@10.129.24.157 -windows-auth
Impacket v0.14.0.dev0+20260130.223114.851fea86 - Copyright Fortra, LLC and its affiliated companies 

Password:
[*] Encryption required, switching to TLS
[*] ENVCHANGE(DATABASE): Old Value: master, New Value: master
[*] ENVCHANGE(LANGUAGE): Old Value: , New Value: us_english
[*] ENVCHANGE(PACKETSIZE): Old Value: 4096, New Value: 16192
[*] INFO(ILF-SQL-01): Line 1: Changed database context to 'master'.
[*] INFO(ILF-SQL-01): Line 1: Changed language setting to us_english.
[*] ACK: Result: 1 - Microsoft SQL Server 2019 RTM (15.0.2000)
[!] Press help for extra shell commands
SQL (ILF-SQL-01\backdoor  dbo@master)>
```

### Listing Databases

```bash
SQL (ILF-SQL-01\backdoor  dbo@master)> SELECT name FROM sys.databases;
name        
---------   
master      
tempdb      
model       
msdb        
Employees
```