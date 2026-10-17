
## Questions and Solutions


- Download the attached ZIP archive (cracking-protected-files.zip), and crack the file within. What is the password?
	- **beethoven**

#### Forming the ZIP Hash

Forming the zip file hash using `zip2john`.

```bash
$ office2john Confidential.xlsx > hash
```

#### Cracking the Hash

```bash
$ john --wordlist=/usr/share/wordlists/rockyou.txt hash
Using default input encoding: UTF-8
Loaded 1 password hash (Office, 2007/2010/2013 [SHA1 128/128 AVX 4x / SHA512 128/128 AVX 2x AES])
Cost 1 (MS Office version) is 2013 for all loaded hashes
Cost 2 (iteration count) is 100000 for all loaded hashes
Will run 4 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status
beethoven        (Confidential.xlsx)     
1g 0:00:00:38 DONE (2026-03-14 05:27) 0.02591g/s 173.3p/s 173.3c/s 173.3C/s lionheart..beethoven
Use the "--show" option to display all of the cracked passwords reliably
Session completed. 
```
