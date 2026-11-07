## Hashcat
### Wordlist Mode

- Used to crack passwords with a dictionary attack.
- Basically attempting all passwords supplied in the wordlist against the password hash.


## Mask Attack

- In this type of attack instead of checking all passwords from a file, a certain pattern or characters specified are tried.
- A mask attack is defined by combining a sequence of symbols, each representing a built in or custom character set.


### Rule Based Attack

- We can use Hashcat to combine lists of potential names and labels with specific mutation rules to create custom wordlists.
- Hashcat uses a specific syntax to define characters, words, and their transformations.
- In rule based attack each rule is applied once for every word.
- So if the wordlist has 1 word and rules are 4 so mutated wordlist will have 4 words.

---
## Questions and Solutions


- Use a dictionary attack to crack the first password hash. (Hash: e3e3ec5831ad5e7288241960e5d4fdb8)
	- **crazy!**

#### Hash type

Identifying the hash type before hash cracking.

```bash
$ hashid -m hash
--File 'hash'--
Analyzing 'e3e3ec5831ad5e7288241960e5d4fdb8'
[+] MD2 
[+] MD5 [Hashcat Mode: 0]
[+] MD4 [Hashcat Mode: 900]
[+] Double MD5 [Hashcat Mode: 2600]
[+] LM [Hashcat Mode: 3000]
[+] RIPEMD-128 
[+] Haval-128 
[+] Tiger-128 
[+] Skein-256(128) 
[+] Skein-512(128) 
[+] Lotus Notes/Domino 5 [Hashcat Mode: 8600]
[+] Skype [Hashcat Mode: 23]
[+] Snefru-128 
[+] NTLM [Hashcat Mode: 1000]
[+] Domain Cached Credentials [Hashcat Mode: 1100]
[+] Domain Cached Credentials 2 [Hashcat Mode: 2100]
[+] DNSSEC(NSEC3) [Hashcat Mode: 8300]
[+] RAdmin v2.x [Hashcat Mode: 9900]
--End of file 'hash'--  
```

#### Dictionary Attack

Using `hashcat` dictionary attack to crack the MD5 hash.

```bash
$ hashcat -a 0 -m 0 e3e3ec5831ad5e7288241960e5d4fdb8 /usr/share/wordlists/rockyou.txt 
hashcat (v6.2.6) starting

OpenCL API (OpenCL 3.0 PoCL 6.0+debian  Linux, None+Asserts, RELOC, SPIR-V, LLVM 18.1.8, SLEEF, DISTRO, POCL_DEBUG) - Platform #1 [The pocl project]
====================================================================================================================================================
* Device #1: cpu-sandybridge-AMD Ryzen 7 4800H with Radeon Graphics, 2135/4335 MB (1024 MB allocatable), 4MCU

Minimum password length supported by kernel: 0
Maximum password length supported by kernel: 256

Hashes: 1 digests; 1 unique digests, 1 unique salts
Bitmaps: 16 bits, 65536 entries, 0x0000ffff mask, 262144 bytes, 5/13 rotates
Rules: 1

Optimizers applied:
* Zero-Byte
* Early-Skip
* Not-Salted
* Not-Iterated
* Single-Hash
* Single-Salt
* Raw-Hash

ATTENTION! Pure (unoptimized) backend kernels selected.
Pure kernels can crack longer passwords, but drastically reduce performance.
If you want to switch to optimized kernels, append -O to your commandline.
See the above message to find out about the exact limits.

Watchdog: Temperature abort trigger set to 90c

Host memory required for this attack: 1 MB

Dictionary cache hit:
* Filename..: /usr/share/wordlists/rockyou.txt
* Passwords.: 14344385
* Bytes.....: 139921507
* Keyspace..: 14344385

e3e3ec5831ad5e7288241960e5d4fdb8:crazy!                   
                                                          
Session..........: hashcat
Status...........: Cracked
Hash.Mode........: 0 (MD5)
Hash.Target......: e3e3ec5831ad5e7288241960e5d4fdb8
Time.Started.....: Fri Mar 13 09:44:43 2026 (0 secs)
Time.Estimated...: Fri Mar 13 09:44:43 2026 (0 secs)
Kernel.Feature...: Pure Kernel
Guess.Base.......: File (/usr/share/wordlists/rockyou.txt)
Guess.Queue......: 1/1 (100.00%)
Speed.#1.........:  1372.7 kH/s (0.31ms) @ Accel:512 Loops:1 Thr:1 Vec:8
Recovered........: 1/1 (100.00%) Digests (total), 1/1 (100.00%) Digests (new)
Progress.........: 28672/14344385 (0.20%)
Rejected.........: 0/28672 (0.00%)
Restore.Point....: 26624/14344385 (0.19%)
Restore.Sub.#1...: Salt:0 Amplifier:0-1 Iteration:0-1
Candidate.Engine.: Device Generator
Candidates.#1....: 200390 -> spongebob9
Hardware.Mon.#1..: Util: 26%

Started: Fri Mar 13 09:44:42 2026
Stopped: Fri Mar 13 09:44:45 2026
```


- Use a dictionary attack with rules to crack the second password hash. (Hash: 1b0556a75770563578569ae21392630c)
	- **c0wb0ys1**

#### Identifying hash

```bash
$ hashid -m hash
--File 'hash'--
Analyzing '1b0556a75770563578569ae21392630c'
[+] MD2 
[+] MD5 [Hashcat Mode: 0]
[+] MD4 [Hashcat Mode: 900]
[+] Double MD5 [Hashcat Mode: 2600]
[+] LM [Hashcat Mode: 3000]
[+] RIPEMD-128 
[+] Haval-128 
[+] Tiger-128 
[+] Skein-256(128) 
[+] Skein-512(128) 
[+] Lotus Notes/Domino 5 [Hashcat Mode: 8600]
[+] Skype [Hashcat Mode: 23]
[+] Snefru-128 
[+] NTLM [Hashcat Mode: 1000]
[+] Domain Cached Credentials [Hashcat Mode: 1100]
[+] Domain Cached Credentials 2 [Hashcat Mode: 2100]
[+] DNSSEC(NSEC3) [Hashcat Mode: 8300]
[+] RAdmin v2.x [Hashcat Mode: 9900]
--End of file 'hash'-- 
```

So its a MD5 hash again.

#### Dictionary Attack + Rules

Dictionary attack + using `hashcat` rules to crack the above hash.

```bash
 hashcat -a 0 -m 0 1b0556a75770563578569ae21392630c /usr/share/wordlists/rockyou.txt -r /usr/share/hashcat/rules/best64.rule 
hashcat (v6.2.6) starting

OpenCL API (OpenCL 3.0 PoCL 6.0+debian  Linux, None+Asserts, RELOC, SPIR-V, LLVM 18.1.8, SLEEF, DISTRO, POCL_DEBUG) - Platform #1 [The pocl project]
====================================================================================================================================================
* Device #1: cpu-sandybridge-AMD Ryzen 7 4800H with Radeon Graphics, 2135/4335 MB (1024 MB allocatable), 4MCU

Minimum password length supported by kernel: 0
Maximum password length supported by kernel: 256

Hashes: 1 digests; 1 unique digests, 1 unique salts
Bitmaps: 16 bits, 65536 entries, 0x0000ffff mask, 262144 bytes, 5/13 rotates
Rules: 77

Optimizers applied:
* Zero-Byte
* Early-Skip
* Not-Salted
* Not-Iterated
* Single-Hash
* Single-Salt
* Raw-Hash

ATTENTION! Pure (unoptimized) backend kernels selected.
Pure kernels can crack longer passwords, but drastically reduce performance.
If you want to switch to optimized kernels, append -O to your commandline.
See the above message to find out about the exact limits.

Watchdog: Temperature abort trigger set to 90c

Host memory required for this attack: 1 MB

Dictionary cache hit:
* Filename..: /usr/share/wordlists/rockyou.txt
* Passwords.: 14344385
* Bytes.....: 139921507
* Keyspace..: 1104517645

1b0556a75770563578569ae21392630c:c0wb0ys1                 
                                                          
Session..........: hashcat
Status...........: Cracked
Hash.Mode........: 0 (MD5)
Hash.Target......: 1b0556a75770563578569ae21392630c
Time.Started.....: Fri Mar 13 09:55:40 2026 (0 secs)
Time.Estimated...: Fri Mar 13 09:55:40 2026 (0 secs)
Kernel.Feature...: Pure Kernel
Guess.Base.......: File (/usr/share/wordlists/rockyou.txt)
Guess.Mod........: Rules (/usr/share/hashcat/rules/best64.rule)
Guess.Queue......: 1/1 (100.00%)
Speed.#1.........:  9810.7 kH/s (7.28ms) @ Accel:256 Loops:77 Thr:1 Vec:8
Recovered........: 1/1 (100.00%) Digests (total), 1/1 (100.00%) Digests (new)
Progress.........: 236544/1104517645 (0.02%)
Rejected.........: 0/236544 (0.00%)
Restore.Point....: 2048/14344385 (0.01%)
Restore.Sub.#1...: Salt:0 Amplifier:0-77 Iteration:0-77
Candidate.Engine.: Device Generator
Candidates.#1....: slimshady -> drousd
Hardware.Mon.#1..: Util: 31%

Started: Fri Mar 13 09:55:39 2026
Stopped: Fri Mar 13 09:55:42 2026
```


- Use a mask attack to crack the third password hash. (Hash: 1e293d6912d074c0fd15844d803400dd)
	- **Mouse5!**
#### Identifying the hash

```bash
$ hashid -m hash
--File 'hash'--
Analyzing '1e293d6912d074c0fd15844d803400dd'
[+] MD2 
[+] MD5 [Hashcat Mode: 0]
[+] MD4 [Hashcat Mode: 900]
[+] Double MD5 [Hashcat Mode: 2600]
[+] LM [Hashcat Mode: 3000]
[+] RIPEMD-128 
[+] Haval-128 
[+] Tiger-128 
[+] Skein-256(128) 
[+] Skein-512(128) 
[+] Lotus Notes/Domino 5 [Hashcat Mode: 8600]
[+] Skype [Hashcat Mode: 23]
[+] Snefru-128 
[+] NTLM [Hashcat Mode: 1000]
[+] Domain Cached Credentials [Hashcat Mode: 1100]
[+] Domain Cached Credentials 2 [Hashcat Mode: 2100]
[+] DNSSEC(NSEC3) [Hashcat Mode: 8300]
[+] RAdmin v2.x [Hashcat Mode: 9900]
--End of file 'hash'-- 
```

So its a MD5 hash again.


#### Mask Attack

```bash
$ hashcat -a 3 -m 0 1e293d6912d074c0fd15844d803400dd '?u?l?l?l?l?d?s'          
hashcat (v6.2.6) starting

OpenCL API (OpenCL 3.0 PoCL 6.0+debian  Linux, None+Asserts, RELOC, SPIR-V, LLVM 18.1.8, SLEEF, DISTRO, POCL_DEBUG) - Platform #1 [The pocl project]
====================================================================================================================================================
* Device #1: cpu-sandybridge-AMD Ryzen 7 4800H with Radeon Graphics, 2135/4335 MB (1024 MB allocatable), 4MCU

Minimum password length supported by kernel: 0
Maximum password length supported by kernel: 256

Hashes: 1 digests; 1 unique digests, 1 unique salts
Bitmaps: 16 bits, 65536 entries, 0x0000ffff mask, 262144 bytes, 5/13 rotates

Optimizers applied:
* Zero-Byte
* Early-Skip
* Not-Salted
* Not-Iterated
* Single-Hash
* Single-Salt
* Brute-Force
* Raw-Hash

ATTENTION! Pure (unoptimized) backend kernels selected.
Pure kernels can crack longer passwords, but drastically reduce performance.
If you want to switch to optimized kernels, append -O to your commandline.
See the above message to find out about the exact limits.

Watchdog: Temperature abort trigger set to 90c

Host memory required for this attack: 1 MB

1e293d6912d074c0fd15844d803400dd:Mouse5!                  
                                                          
Session..........: hashcat
Status...........: Cracked
Hash.Mode........: 0 (MD5)
Hash.Target......: 1e293d6912d074c0fd15844d803400dd
Time.Started.....: Fri Mar 13 10:00:16 2026 (4 secs)
Time.Estimated...: Fri Mar 13 10:00:20 2026 (0 secs)
Kernel.Feature...: Pure Kernel
Guess.Mask.......: ?u?l?l?l?l?d?s [7]
Guess.Queue......: 1/1 (100.00%)
Speed.#1.........:   117.4 MH/s (7.94ms) @ Accel:256 Loops:1024 Thr:1 Vec:8
Recovered........: 1/1 (100.00%) Digests (total), 1/1 (100.00%) Digests (new)
Progress.........: 456237056/3920854080 (11.64%)
Rejected.........: 0/456237056 (0.00%)
Restore.Point....: 25600/223080 (11.48%)
Restore.Sub.#1...: Salt:0 Amplifier:5120-6144 Iteration:0-1024
Candidate.Engine.: Device Generator
Candidates.#1....: Uayvf7- -> Dikqn5!
Hardware.Mon.#1..: Util: 97%

Started: Fri Mar 13 09:59:54 2026
Stopped: Fri Mar 13 10:00:22 2026
```


- What is Mark's password?
	- **Baseball1998!**

For this sections exercise, imagine that we compromised the password hash of a `work email` belonging to `Mark White`. After performing a bit of OSINT, we have gathered the following information about Mark:

- He was born on `August 5, 1998`
- He works at `Nexura, Ltd.`
    - The company's password policy requires passwords to be at least 12 characters long, to contain at least one uppercase letter, at least one lowercase letter, at least one symbol and at least one number
- He lives in `San Francisco, CA, USA`
- He has a pet cat named `Bella`
- He has a wife named `Maria`
- He has a son named `Alex`
- He is a big fan of `baseball`

The password hash is: `97268a8ae45ac7d15c3cea4ce6ea550b`. Use the techniques covered in this section to generate a custom wordlist and ruleset targeting Mark specifically, and crack the password.

#### Custom wordlist file
Created my **custom_wordlist** file. I used ChatGPT to generate possible words by giving the above information as prompt.

```
MarkWhite1998
MarkWhite05081998
MarkWhite08051998
MarkWhite05
MarkWhite98
Bella1998
Bella05081998
Bella08051998
Bella1998Mark
Bella98
Maria1998
Maria05081998
Maria1998Mark
Maria98
Alex1998
Alex05081998
Alex1998Mark
Alex98
MarkBella1998
MarkMaria1998
MarkAlex1998
MariaAlex1998
BellaAlex1998
Nexura1998
Nexura05081998
NexuraMark1998
NexuraWhite1998
Baseball1998
MarkBaseball1998
WhiteBaseball1998
BellaBaseball98
SanFrancisco1998
MarkSF1998
WhiteSF1998
California1998
Mark1998Bella
Mark1998Maria
Mark1998Alex
Bella199805
Maria199805
Alex199805
```

#### Custom rule file
Created my **custom.rule** file.

```
:
l
u
c
$!
```

#### Creating Mutated Wordlist

```bash
$ hashcat --force custom_wordlist -r custom.rule --stdout | sort -u > mutated_wordlist
$ wc -l mutated_wordlist 
188 mutated_wordlist
```

#### Rule Based Attack

Running `hashcat` rule based attack using the mutated wordlist against the provided hash.

```bash
$ hashcat -a 0 -m 0 97268a8ae45ac7d15c3cea4ce6ea550b mutated_wordlist
hashcat (v6.2.6) starting

OpenCL API (OpenCL 3.0 PoCL 6.0+debian  Linux, None+Asserts, RELOC, SPIR-V, LLVM 18.1.8, SLEEF, DISTRO, POCL_DEBUG) - Platform #1 [The pocl project]
====================================================================================================================================================
* Device #1: cpu-sandybridge-AMD Ryzen 7 4800H with Radeon Graphics, 2135/4335 MB (1024 MB allocatable), 4MCU

Minimum password length supported by kernel: 0
Maximum password length supported by kernel: 256

Hashes: 1 digests; 1 unique digests, 1 unique salts
Bitmaps: 16 bits, 65536 entries, 0x0000ffff mask, 262144 bytes, 5/13 rotates
Rules: 1

Optimizers applied:
* Zero-Byte
* Early-Skip
* Not-Salted
* Not-Iterated
* Single-Hash
* Single-Salt
* Raw-Hash

ATTENTION! Pure (unoptimized) backend kernels selected.
Pure kernels can crack longer passwords, but drastically reduce performance.
If you want to switch to optimized kernels, append -O to your commandline.
See the above message to find out about the exact limits.

Watchdog: Temperature abort trigger set to 90c

Host memory required for this attack: 1 MB

Dictionary cache built:
* Filename..: mutated_wordlist
* Passwords.: 188
* Bytes.....: 2560
* Keyspace..: 188
* Runtime...: 0 secs

The wordlist or mask that you are using is too small.
This means that hashcat cannot use the full parallel power of your device(s).
Unless you supply more work, your cracking speed will drop.
For tips on supplying more work, see: https://hashcat.net/faq/morework

Approaching final keyspace - workload adjusted.           

97268a8ae45ac7d15c3cea4ce6ea550b:Baseball1998!            
                                                          
Session..........: hashcat
Status...........: Cracked
Hash.Mode........: 0 (MD5)
Hash.Target......: 97268a8ae45ac7d15c3cea4ce6ea550b
Time.Started.....: Fri Mar 13 13:10:00 2026 (0 secs)
Time.Estimated...: Fri Mar 13 13:10:00 2026 (0 secs)
Kernel.Feature...: Pure Kernel
Guess.Base.......: File (mutated_wordlist)
Guess.Queue......: 1/1 (100.00%)
Speed.#1.........:   261.4 kH/s (0.04ms) @ Accel:512 Loops:1 Thr:1 Vec:8
Recovered........: 1/1 (100.00%) Digests (total), 1/1 (100.00%) Digests (new)
Progress.........: 188/188 (100.00%)
Rejected.........: 0/188 (0.00%)
Restore.Point....: 0/188 (0.00%)
Restore.Sub.#1...: Salt:0 Amplifier:0-1 Iteration:0-1
Candidate.Engine.: Device Generator
Candidates.#1....: alex05081998 -> WHITESF1998
Hardware.Mon.#1..: Util: 28%

Started: Fri Mar 13 13:09:59 2026
Stopped: Fri Mar 13 13:10:02 2026
```

