
## CRUD

- CRUD stands for Create, Read, Update, Delete.
- These four operations are mainly linked to the commonly known CRUD APIs.

| Operation | HTTP Method | Description                                        |
| --------- | ----------- | -------------------------------------------------- |
| `Create`  | `POST`      | Adds the specified data to the database table      |
| `Read`    | `GET`       | Reads the specified entity from the database table |
| `Update`  | `PUT`       | Updates the data of the specified database table   |
| `Delete`  | `DELETE`    | Removes the specified row from the database table  |

---

## Questions and Solutions

- First, try to update any city's name to be 'flag'. Then, delete any city. Once done, search for a city named 'flag' to get the flag. **Hint : Make sure that the number of cities is less than when you started. If you added any new cities, you should deleted them as well.**
	- **HTB{redacted}**


### Reading the city names

```bash
$ curl -s 94.237.61.202:56424/api.php/city | jq
```

### Update any city

```bash
$ curl -X PUT 94.237.61.202:56424/api.php/city/London -d '{"city_name":"flag", "country_name":"flag"}' -H 'Content-Type: application/json'
```

### Read the Hint

So we need to make sure the number of cities are less than when we started.

```bash
$ curl -X DELETE 94.237.61.202:56424/api.php/city/Baltimore
```

### Read the flag

```bash
$ curl -s 94.237.61.202:56424/api.php/city/flag
[{"city_name":"flag","country_name":"HTB{redacted}"}
```

