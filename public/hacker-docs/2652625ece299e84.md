
## Provide Credentials 

The `-u` command is used to login to a website by providing the necessary credentials.

```bash
curl -u <username>:<password> <URL>
```

---
## Provide HTTP Authorization Header

Using the `-v` switch you can find out the **HTTP Authorization Header** format in the Request section and pass it manually since it is basically the encoded format of the same credentials. **HTTP Authorization Header** uses `base64` or `JWT` depending on the HTTP version.

```bash
curl -H 'Authorization: <HTTP Authorization data format>' <URL>
```

---
## Passing Parameters (Query String)

```bash
curl <URL>/?<param1=value1>&<param2=value2>
```

