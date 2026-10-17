
## John The Ripper

### Single Crack Mode

- Rule based password cracking technique used against Linux credentials.
- It generates passwords based on the victim's username, home directory name, and `GECHOS` values. (**fullname**, **room number**, **phone number** .etc.) 

**Example** : 

```bash
r0lf:$6$ues25dIanlctrWxg$nZHVz2z4kCy1760Ee28M1xtHdGoy0C2cYzZ8l2sVa1kIa8K9gAcdBP.GI6ng/qA4oaMrgElZ1Cb9OeXO4Fvy3/:0:0:Rolf Sebastian:/home/r0lf:/bin/bash
```

Based on the contents of the file, it can be inferred that the victim has the username `r0lf`, the real name `Rolf Sebastian`, and the home directory `/home/r0lf`. Single crack mode will use this information to generate candidate passwords and test them against the hash. 


### Wordlist Mode

- Used to crack passwords with a dictionary attack.
- Basically attempting all passwords supplied in the wordlist against the password hash.

### Incremental Mode

- Powerful bruteforce password cracking mode that generates passwords based on a statistical model (**Markov chains**).
- Designed to test all character combinations defined by a specific character set, training data or rule.
- Efficient because passwords generated on educated guess instead of plain dictionary/wordlist attack but time consuming process. 
- Not suitable for long and complex passwords.
- By default, John the Ripper uses predefined incremental modes specified in its configuration file (`john.conf`)


---
## Questions and Solutions


- Use single-crack mode to crack r0lf's password.
	- **NAITSABES**


The **rolf's** hash to crack -> `r0lf:$6$ues25dIanlctrWxg$nZHVz2z4kCy1760Ee28M1xtHdGoy0C2cYzZ8l2sVa1kIa8K9gAcdBP.GI6ng/qA4oaMrgElZ1Cb9OeXO4Fvy3/:0:0:Rolf Sebastian:/home/r0lf:/bin/bash`

Using **john's** Single Cracking Mode to crack the password hash of **rolf** user.

```bash
$ john --single rolf_hash
Using default input encoding: UTF-8
Loaded 1 password hash (sha512crypt, crypt(3) $6$ [SHA512 128/128 AVX 2x])
Cost 1 (iteration count) is 5000 for all loaded hashes
Will run 4 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status
NAITSABES        (r0lf)     
1g 0:00:00:00 DONE (2026-03-11 13:27) 2.564g/s 1087p/s 1087c/s 1087C/s NAITSABESFL0R..FL0RNAITSABES
Use the "--show" option to display all of the cracked passwords reliably
Session completed.
```


- Use wordlist-mode with rockyou.txt to crack the RIPEMD-128 password.
	- **50cent**

The **RIPEMD-128** hash -> `193069ceb0461e1d40d216e32c79c704`

Using **john's** Wordlist Attack Mode to crack the **RIPEMD-128** password.

```bash
$ john --format=ripemd-128 --wordlist=/usr/share/wordlists/rockyou.txt hash
Using default input encoding: UTF-8
Loaded 1 password hash (ripemd-128, RIPEMD 128 [32/64])
Warning: no OpenMP support for this hash type, consider --fork=4
Press 'q' or Ctrl-C to abort, almost any other key for status
50cent           (?)     
1g 0:00:00:00 DONE (2026-03-11 13:31) 100.0g/s 32000p/s 32000c/s 32000C/s angelo..101010
Use the "--show" option to display all of the cracked passwords reliably
Session completed. 
```

Many algorithms use **128-bit outputs**. Examples John listed:
- LM
- MD5
- MD2
- RIPEMD-128
- Snefru-128
- etc...

So we had to use the `--format` to explicitly specify the hash format to **john**.


