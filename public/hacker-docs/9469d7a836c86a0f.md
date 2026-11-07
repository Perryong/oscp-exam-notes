

## Structured Query Language (SQL)

We will be following the MySQL/MariaDB syntax for the examples shown. SQL can be used to perform the following actions:

- Retrieve data
- Update data
- Delete data
- Create new tables and databases
- Add / remove users
- Assign permissions to these users

---

## Questions and Solutions

- Connect to the database using the MySQL client from the command line. Use the 'show databases;' command to list databases in the DBMS. What is the name of the first database?
	- **employees**


#### Connecting to Database

Connecting to remote host in MySQL. I used `--skip-ssl` because the remote host doesn't use SSL encryption but since its a practice lab we can use the `--skip-ssl` option to bypass this warning but in real word scenario don't ignore it for security reasons.

```bash
mysql -u root -h 94.237.120.119 -P 33995 -p --skip-ssl 
```

#### Showing the Databases

We can show all the databases using the `SHOW DATABASES;` command.

```bash
MariaDB [(none)]> SHOW DATABASES;
+--------------------+
| Database           |
+--------------------+
| employees          |
| information_schema |
| mysql              |
| performance_schema |
| sys                |
+--------------------+
5 rows in set (0.168 sec)
```


