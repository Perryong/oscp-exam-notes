
## Sorting Results

#### Ascending Order

```mysql
SELECT * FROM <table_name> ORDER BY <column_name>;
```

#### Descending Order

```mysql
SELECT * FROM <table_name> ORDER BY <column_name> DESC;
```

---
## LIMIT Results

```mysql
SELECT * FROM <table_name> LIMIT <row_number>;
```

---
## WHERE Clause

```mysql
SELECT * FROM <table_name> WHERE <clause>;
```

---
## LIKE Clause

#### CASE 1

- matches all `<column_name>` starting with `admin`.
- The string `admin` is will vary based on the user search query.

```mysql
SELECT * FROM <table_name> WHERE <column_name> LIKE <admin%>;
```

#### CASE 2

- matches all `<column_name>` ending with `admin`.
- The string `admin` is will vary based on the user search query.

```mysql
SELECT * FROM <table_name> WHERE <column_name> LIKE <%admin>;
```


#### CASE 3

- matches all `<column_name>` which are equal to `admin` string.
- The string `admin` is will vary based on the user search query.

```mysql
SELECT * FROM <table_name> WHERE <column_name> LIKE <%admin%>;
```


#### CASE 4

- matches all `<column_name>` which are exactly 3 characters long only. You need to provide `_` underscores based on the length you want. In the below mentioned query `_` (underscore) applied 3 times.
- The length will again vary based on the user search query.

```mysql
SELECT * FROM <table_name> WHERE <column_name> LIKE `___`;
```

#### CASE 5 

- All the other cases are basically variations and combinations of the above cases.


