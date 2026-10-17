

## Directory Fuzzing

- `-t` switch to increase threads amount. Don't keep number too high or might show wrong scan results.

```bash
gobuster dir -u http://<IP>:<PORT> -w <wordlist> -t 50
```

---
## File Fuzzing

- `-t` switch to increase threads amount. Don't keep number too high or might show wrong scan results.

```bash
feroxbuster -u http://<IP>:<PORT> -w <wordlist> -x .php,.html,.js,.bak,.txt,.gz -t 100
```

---
## Recursive File Fuzzing

- Use `-recurion-depth` which allows maximum depth of recursive fuzzing.
- Use `-t` to increase number of threads.

```bash
ffuf -w <wordlist> -ic -v -u <URL>:<port>/FUZZ -e .html -recursion -recursion-depth <resursive depth amt>
```



