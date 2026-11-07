
## MySQL

- Open source relational database management system developed by Oracle.
- MySQL works according to the `client-server principle` and consists of a MySQL server and one or more MySQL clients.
- The data is stored in tables with different columns, rows, and data types. These databases are often stored in a single file with the file extension `.sql`, for example, like `wordpress.sql`.
- `TCP Port 3306`.


## MySQL Configurations

- Default location for MySQL config file -> `/etc/mysql/mysql.conf.d/mysqld.cnf`

### Dangerous Settings

|**Settings**|**Description**|
|---|---|
|`user`|Sets which user the MySQL service will run as.|
|`password`|Sets the password for the MySQL user.|
|`admin_address`|The IP address on which to listen for TCP/IP connections on the administrative network interface.|
|`debug`|This variable indicates the current debugging settings|
|`sql_warnings`|This variable controls whether single-row INSERT statements produce an information string if warnings occur.|
|`secure_file_priv`|This variable is used to limit the effect of data import and export operations.|

---
## Questions and Solutions

- Enumerate the MySQL server and determine the version in use. (Format: MySQL X.X.XX)
	- **MySQL 8.0.27**
### Footprinting the Service

Finding the MySQL server version using `nmap`.

```bash
$ sudo nmap 10.129.18.220 -sV -sC -p3306 --script mysql*
[sudo] password for kali: 
Starting Nmap 7.95 ( https://nmap.org ) at 2026-01-31 04:14 EST
Nmap scan report for 10.129.18.220
Host is up, received reset ttl 63 (0.24s latency).
Scanned at 2026-01-31 04:14:07 EST for 307s

PORT     STATE SERVICE REASON         VERSION
3306/tcp open  mysql   syn-ack ttl 63 MySQL 8.0.27-0ubuntu0.20.04.1
| mysql-info: 
|   Protocol: 10
|   Version: 8.0.27-0ubuntu0.20.04.1
|   Thread ID: 113
|   Capabilities flags: 65535
|   Some Capabilities: ConnectWithDatabase, Support41Auth, SupportsTransactions, FoundRows, IgnoreSigpipes, SwitchToSSLAfterHandshake, SupportsLoadDataLocal, Speaks41ProtocolNew, InteractiveClient, DontAllowDatabaseTableColumn, LongColumnFlag, ODBCClient, IgnoreSpaceBeforeParenthesis, SupportsCompression, Speaks41ProtocolOld, LongPassword, SupportsAuthPlugins, SupportsMultipleResults, SupportsMultipleStatments
|   Status: Autocommit
|   Salt: |^k~kPA_\x03@nO\x17BI\x05M-KD
|_  Auth Plugin Name: caching_sha2_password
| mysql-enum: 
|   Accounts: No valid accounts found
|_  Statistics: Performed 8 guesses in 5 seconds, average tps: 1.6
| mysql-brute: 
|   Accounts: No valid accounts found
|   Statistics: Performed 6835 guesses in 300 seconds, average tps: 21.4
|_  ERROR: The service seems to have failed or is heavily firewalled...

NSE: Script Post-scanning.
NSE: Starting runlevel 1 (of 2) scan.
Initiating NSE at 04:19
Completed NSE at 04:19, 0.00s elapsed
NSE: Starting runlevel 2 (of 2) scan.
Initiating NSE at 04:19
Completed NSE at 04:19, 0.00s elapsed
Read data files from: /usr/share/nmap
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 307.24 seconds
           Raw packets sent: 5 (196B) | Rcvd: 2 (84B)
```


- During our penetration test, we found weak credentials "robin:robin". We should try these against the MySQL server. What is the email address of the customer "Otto Lang"?
	- ultrices@google.htb

### Logging in MySQL 

Logging inside the MySQL server using the `robin:robin` credentials. The `--skip-ssl` switch is to Bypass certificate verification for the SSL encryption. Although this is not recommended in accessing a MySQL server but since this is a lab environment probably setup of SSL in the MySQL server was not done.

```bash
$ mysql -u robin -p -h 10.129.18.220 --skip-ssl         
Enter password: 
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MySQL connection id is 296
Server version: 8.0.27-0ubuntu0.20.04.1 (Ubuntu)

Copyright (c) 2000, 2018, Oracle, MariaDB Corporation Ab and others.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

MySQL [(none)]> 
```

### Running MySQL Queries

```bash
MySQL [(none)]> show databases;
+--------------------+
| Database           |
+--------------------+
| customers          |
| information_schema |
| mysql              |
| performance_schema |
| sys                |
+--------------------+
5 rows in set (0.243 sec)

MySQL [(none)]> use customers;
Reading table information for completion of table and column names
You can turn off this feature to get a quicker startup with -A

Database changed
MySQL [customers]> show tables;
+---------------------+
| Tables_in_customers |
+---------------------+
| myTable             |
+---------------------+
1 row in set (0.581 sec)

MySQL [customers]> desc myTable;
+-----------+--------------------+------+-----+---------+----------------+
| Field     | Type               | Null | Key | Default | Extra          |
+-----------+--------------------+------+-----+---------+----------------+
| id        | mediumint unsigned | NO   | PRI | NULL    | auto_increment |
| name      | varchar(255)       | YES  |     | NULL    |                |
| email     | varchar(255)       | YES  |     | NULL    |                |
| country   | varchar(100)       | YES  |     | NULL    |                |
| postalZip | varchar(20)        | YES  |     | NULL    |                |
| city      | varchar(255)       | YES  |     | NULL    |                |
| address   | varchar(255)       | YES  |     | NULL    |                |
| pan       | varchar(255)       | YES  |     | NULL    |                |
| cvv       | varchar(255)       | YES  |     | NULL    |                |
+-----------+--------------------+------+-----+---------+----------------+
9 rows in set (2.293 sec)

MySQL [customers]> select email from myTable where name='Otto Lang';
+---------------------+
| email               |
+---------------------+
| ultrices@google.htb |
+---------------------+
1 row in set (0.231 sec)
```

