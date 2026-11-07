

## SQL injection (SQLi)

- Web security vulnerability.
- Allows attackers to interfere with the queries made to the database and retrieve data from the database that they are not normally able to retrieve.


## Impact of SQLi

- The attackers might get user credentials, personal information or credit card details .etc.
- In many cases, attackers are able to create, modify or delete data in the database causing significant damage to organization's infrastructure and reputation.


## Blind SQL Injection (SQLi)

- Many instances of SQLi are blind vulnerabilities.
- This means the application doesn't return the results of the SQL query or the details of any database errors within its response.
- Exploiting Blind SQLi can be very difficult and complicated for this very reason.


## Second-Order SQLi

- First order of SQLi is when the application processes user input from HTTP request and incorporates the input into a SQL query in an unsafe way.
- Second order of SQLi occurs when the application takes the user input from the HTTP request and stores it for future use. This is usually done by placing the user input safely into the database and retrieving it later from the database when required later. But when retrieved into a SQL query it is done in an unsafe way. This type of SQLi is also called Stored SQLi for this very reason.


## Preventing SQLi

- **Predefined SQL structure** : 
	- This prevents the attacker from changing the original query structure.
	- The attacker SQLi payload is treated as data instead of directly appending it to the SQL query.
	

- **Whitelisting permitted input values** :
	- Setting a list of input values which are allowed as input rest should be discarded.

- **Different query logic** :
	- Implement a different query logic to do the same task so that the attacker cannot guess the query structure and configure their payload accordingly.

- **No user input concatenation** : 
	- The user input should not be directly concatenated with the query.
	- The user input can be anything and directly incorporating it inside a query might lead to SQLi attacks.

