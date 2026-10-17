
- In the 'titles' table, what is the number of records WHERE the employee number is greater than 10000 OR their title does NOT contain 'engineer'?

**Database = employees** and **table = titles**.

```mysql
SELECT COUNT(emp_no) FROM titles WHERE emp_no > 10000 OR title != 'Engineer';
```

