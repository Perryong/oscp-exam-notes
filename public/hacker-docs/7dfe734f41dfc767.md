
## INSERT Statement

```mysql
INSERT INTO <table_name> VALUES (<col1_value>, <col2_value>, <col3_value>, ...);
```

---
## SELECT Statement

```mysql
SELECT * FROM <table_name>;
```

---
## DROP Statement

```mysql
DROP TABLE <table_name>;
```

---
## ALTER Statement

#### Adding a Column

```mysql
ALTER TABLE <table_name> ADD <New_Column_name> <datatype>;
```

#### Dropping a Column

```mysql
ALTER TABLE <table_name> DROP <Column_name>;
```

#### Modifying a Column

```mysql
ALTER TABLE <table_name> MODIFY <Column_name> <new_dataype>;
```

#### Rename a Column

```mysql
ALTER TABLE <table_name> RENAME COLUMN <old_Column_name> TO <New_Column_name>;
```

---
## UPDATE Statement

```mysql
UPDATE <table_name> SET <col1>=<newvalue1>, <col2>=<newvalue2>, ... WHERE <condition>;
```

---
