
- Download the attached ZIP file (linux-authentication-process.zip), and use single crack mode to find martin's password. What is it?
	- **Martin1**


- Use a wordlist attack to find sarah's password. What is it?
	- **mariposa**

Download the `download.zip` file and unzip its contents. You will get `passwd` and `shadow` file. So crack them offline using `hashcat` or `john`.

#### Cracking the shadow file

Wordlist attack done using `john` to get the credentials of `martin` and `sarah`.

```bash
$ john --wordlist=/usr/share/wordlists/rockyou.txt shadow
Using default input encoding: UTF-8
Loaded 2 password hashes with 2 different salts (sha512crypt, crypt(3) $6$ [SHA512 256/256 AVX2 4x])
Cost 1 (iteration count) is 5000 for all loaded hashes
Will run 4 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status
mariposa         (sarah)     
Martin1          (martin)     
2g 0:00:00:29 DONE (2026-09-20 12:40) 0.06761g/s 5158p/s 5175c/s 5175C/s Muhammad..850112
Use the "--show" option to display all of the cracked passwords reliably
Session completed.
```


