

## Send POST request

```bash
curl -X POST -d 'username=<username>&password=<password>' <URL>
```

## Login with Set-Cookie

After successful login we get a **set-cookie** in the Response body. We can use this cookie to Login to the website.

```bash
curl -H 'Cookie: <cookie_name>=<set_cookie_value>' <URL>
```

**OR**

```bash
curl -b '<cookie_name>=<set_cookie_value>' <URL>
```


## Login with JSON and Set-Cookie

```bash
curl -X POST -d '{"key":"value"}' -b '<cookie_name>=<set_cookie_value>' -H 'Content-Type: application/json' <URL>
```
