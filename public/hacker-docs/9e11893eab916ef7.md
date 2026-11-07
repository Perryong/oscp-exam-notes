
## Parameter and Value Fuzzing

- `-w` for wordlist.
- `--hc` for ignoring 404 error responses.
- `param` placeholder for the parameter name.
- `FUZZ` will be replaced by words from the wordlist.

```bash
 wenum -w <wordlist> --hc 404 -u "http://<IP>:<PORT>/<directory_path>?<param>=FUZZ"
```


## Make GET request (Parameter and Value)

```bash
curl http://<IP>:<PORT>/<directory_path>?<param>=<value>
```

## Make POST request 

1. USING `cURL` 

```bash
curl -d "<param>=<value>" http://<IP>:<PORT>/<filepath>
```

2. USING `ffuf`

```bash
ffuf -u http://<IP>:<PORT>/<filepath> -X POST -H "Content-Type: application/x-www-form-urlencoded" -d "<param>=FUZZ" -w <wordlist> -mc 200 -v
```

