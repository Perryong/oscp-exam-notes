
## Importance of Directory and File Fuzzing
### Uncovering Hidden Assets

- Sensitive Data -> backup files, configuration files, or logs containing user credentials .etc.
- Outdated content -> Older versions of files or scripts that may have potential vulnerabilities or known exploits.
- Development resources -> Testing environments or administrative panels that can be leveraged for further attacks.
- Hidden Functionalities -> Undocumented features or endpoints that could expose to unexpected vulnerabilities.

### Wordlists to use

### Seclists

The below wordlists are part of the `seclists`. In Kali Linux download them using the command. `sudo apt install seclists`.

- `Discovery/Web-Content/common.txt`
- `Discovery/Web-Content/directory-list-2.3-medium.txt`
- `Discovery/Web-Content/raft-large-directories.txt`
- `Discovery/Web-Content/big.txt`


---
## Questions and Solutions

- Within the "webfuzzing_hidden_path" path on the target system (ie http://IP:PORT/webfuzzing_hidden_path/), fuzz for folders and then files to find the flag.
	- **HTB{redacted}**


First as mentioned in the question we need to perform directory fuzzing. Below is the command for directory fuzzing performed using `ffuf`.

```bash
ffuf -w /usr/share/wordlists/seclists/Discovery/Web-Content/big.txt -u http://94.237.61.202:45294/webfuzzing_hidden_path/FUZZ
```

We will get our directory through the above directory fuzzing technique and after that perform File Fuzzing using `ffuf`. Below is the command.

```bash
ffuf -w /usr/share/wordlists/seclists/Discovery/Web-Content/big.txt -u http://94.237.61.202:45294/webfuzzing_hidden_path/flag/FUZZ -e .php,.html,.txt,.bak,.js -v
```

I got a hit after applying the above command and then I used `curl` to print the contents of the webpage. Below is the demonstration of it.

```bash
curl http://94.237.61.202:45294/webfuzzing_hidden_path/flag/flag.html
```

You will get the flag in the HTML code.

- Recursively fuzz the "recursive_fuzz" path on the target system (ie http://IP:PORT/recursive_fuzz/) to find the flag.
	- **HTB{redacted}**

Recursively finding possible directories inside the target URL and specifically looking for `.html` files. The below command helps us do that. I kept the `-recursion-depth 1` because higher number will not be required to solve this level(**NOTE : a higher recursive depth is equal to more scanning time**).

```bash
ffuf -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-small.txt -u http://94.237.120.119:48108/FUZZ -recursion -recursion-depth 1 -e .php -v -t 80
```

After getting our directory we can use `curl` to get content from the flag page and get our flag value.

```bash
curl -L http://94.237.120.119:48108/recursive_fuzz/level1/level2/level3/threatcon_level2
```



