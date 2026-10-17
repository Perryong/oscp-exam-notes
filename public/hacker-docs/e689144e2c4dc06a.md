

- What is the last name of the employee whose first name starts with "Bar" AND who was hired on 1990-01-01?
	- **Mitchem**

You need to use **Database => employees** and **table => employees**.

```bash
SELECT last_name FROM employees WHERE first_name LIKE 'Bar%' AND hire_date='1990-01-01';
```



