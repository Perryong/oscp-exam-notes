
## Questions and Solutions


- What is the department number for the 'Development' department?
	- **d005**


#### Connecting to Database

Connecting to remote host in MySQL. I used `--skip-ssl` because the remote host doesn't use SSL encryption but since its a practice lab we can use the `--skip-ssl` option to bypass this warning but in real word scenario don't ignore it for security reasons.

```mysql
mysql -u root -h 94.237.120.119 -P 33995 -p --skip-ssl 
```


#### Finding the Department Number

In the question the **Hint: says to look inside developments table.** In the previous section we found the answer to be **employees** database so we need to use that database. I went inside the **employees** database and looked for the **departments** table and then used `SELECT` query command to get details about the department number.

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
5 rows in set (0.164 sec)

MariaDB [(none)]> USE employees;
Reading table information for completion of table and column names
You can turn off this feature to get a quicker startup with -A

Database changed
MariaDB [employees]> SHOW TABLES;
+----------------------+
| Tables_in_employees  |
+----------------------+
| current_dept_emp     |
| departments          |
| dept_emp             |
| dept_emp_latest_date |
| dept_manager         |
| employees            |
| salaries             |
| titles               |
+----------------------+
8 rows in set (0.163 sec)

MariaDB [employees]> SELECT * FROM departments;
+---------+--------------------+
| dept_no | dept_name          |
+---------+--------------------+
| d009    | Customer Service   |
| d005    | Development        |
| d002    | Finance            |
| d003    | Human Resources    |
| d001    | Marketing          |
| d004    | Production         |
| d006    | Quality Management |
| d008    | Research           |
| d007    | Sales              |
+---------+--------------------+
9 rows in set (0.161 sec)
```