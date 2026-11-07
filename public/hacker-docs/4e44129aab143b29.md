

- Fuzz the target system using directory-list-2.3-medium.txt, looking for a hidden directory. Once you have found the hidden directory, responsibly determine the validity of the vulnerability by analyzing the tar.gz file in the directory. Answer using the full Content-Length header, eg "Content-Length: 1337"
	- **Content-Length: 210**



#### File fuzzing

I didn't know the hidden directory but the question hinted at trying to find a `tar.gz` file so I used `feroxbuster` to perform file fuzzing and add certain extensions to look for as well including a `tar.gz` file type. Using the `feroxbuster` I found both the hidden directory and the `tar.gz` file.

```bash
$ feroxbuster -u http://83.136.255.170:40606 -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt -x .php,.html,.gz -t 300
```

#### Finding Content-Length

The question has asked what is the content length of the `tar.gz` file so I used `cURL` to find the content length of the `tar.gz` file.

```bash
curl http://83.136.255.170:40606/ur-hiddenmember/backup.tar.gz -v
```


