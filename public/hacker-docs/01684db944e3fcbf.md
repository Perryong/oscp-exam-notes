

## Connect to Database

### Connect to Localhost

- Connecting to the database via username(`-u`) and password(`-p`). 
- Password can be written directly beside the `-p` switch but should be avoided to write clear text password in shell because commands are logged in shell history.
- When we don't mention `-h` switch it will default to localhost.

```bash
mysql -u <username> -p
```

### Connect to Remote Host

- Specify a particular remote host by using `-h`.
- Specify a particular port using `-p`.

```bash
mysql -u <username> -h <remote hostname> -P <port number> -p
```

---
## Create Database

```mysql
CREATE DATABASE <database name>;
```


## Create Table

```mysql
CREATE TABLE <table name> (<col1> <datatype>, <col2> <datatype>,...);
```


## Show Tables

```mysql
SHOW TABLES;
```

## Show Databases

```mysql
SHOW DATABASES;
```



