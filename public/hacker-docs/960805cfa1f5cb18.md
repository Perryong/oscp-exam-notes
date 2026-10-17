
## 1. Check Domain Joined or Not

- We can identify a Linux machine is domain joined or not by using the `realm` tool. Domain joined means whether the particular machine is associated with the Active Directory network or is basically an user in that AD network or Kerberos member which would associate the machine to be part of the AD network.
- If the `realm` tool is not present then the presence of services like `sssd` and `winbind` would infer association with AD environment.

### using `realm`

```bash
realm list
```

### checking `sssd` and `winbind` services

```bash
ps -ef | grep -i "winbind\|sssd"
```

---
## Pass the Ticket (PtT) in Linux
#### STEP 1 : Finding the Kerberos Tickets

As an attacker we are always going to be more interested about finding credentials. On Linux based systems we need to find the **Kerberos tickets** to gain more access. **Kerberos tickets** can be found in different places depending on the Linux implementation or administrator changing the default settings. So the **Kerberos tickets** can be found using the following stuff. They are :-
 - Finding the `keytab` files.
 - Finding the `ccache` files.

##### a) Finding `keytab`
##### using `find` to search for files with `keytab` in the name

```bash
find / -name *keytab* -ls 2>/dev/null
```

##### identifying `keytab` in `cronjobs`

```bash
crontab -l
```


##### a) Finding `ccache`

###### Reviewing environment variables for `ccache` files

```bash
env | grep -i krb5
```

###### Searching for `ccache` files in `/tmp`

```bash
ls -la /tmp
```

#### STEP 2 : Exploiting `KEYTAB` 

- If we found a legit `keytab` we can use its contents or credentials inside to impersonate as another user. We can use `kinit` tool for this but we also need to know for which user that `keytab` file was created for 


##### a) Listing the `keytab` file information

```bash
klist -k -t <keytab_file_path>
```

**OR**

- This `krb5cc` file is the `ccache` file which is a temporary session of the AD user. Exporting authenticates the current shell environment as that particular user.
- After exporting `klist` command would use this `ccache` file and list its contents containing hashes or something else.

**NOTE: Before exporting the `ccache` file, first cd into that path otherwise the `ccache` file will not load into the `KRB5CCNAME` environment variable.**

```bash
export KRB5CCNAME=<Kerberos_CCACHE_FILENAME>
klist
```


##### b) Impersonation using `keytab` info

- `PRINCIPAL_NAME` is the user account's name in the Kerberos realm or the Active Directory network.
- Also provide the `keytab` file path of that respective user only not any other random `keytab` file paths.
- If the impersonation was successful, we would be able to access files/folders privileged or accessible by the user we just impersonated.

```bash
kinit <PRINCIPAL_NAME> -k -t <keytab_file_path>
```

##### c) Connecting to SMB Client 

- `-k` used to authenticate to the SMB client network using the Kerberos ticket.
- `-c` used to execute a command upon login and exit. This is one shot, that's why we use the switch.
- `-no-pass` used to not ask the password since we are using the Kerberos ticket. 

```bash
smbclient <NETWORK_SHARE> -c <COMMAND_TO_EXECUTE_UPON_LOGIN> -k -no-pass# this command is one time
```

##### d) Extracting `keytab` hashes using `keyTabExtract`

- We can use the `keyTabExtract.py` tool to extract hashes from the `keytab` file and if we get `NTLM`, `AES256` or `AES128` related hashes, we can use them to perform **Pass the Hash** attacks.
- **Note:** A `KeyTab` file can contain different types of hashes and can be merged to contain multiple credentials even from different users.
- For cracking the hash we can use `hashcat` or `john`.

```bash
python3 /opt/keytabextract.py <keytab_filepath>
```


#### STEP 2 : Exploiting `KEYTAB CCACHE`

- To abuse `ccache` files, we need to have read privileges on that particular `keytab ccache` file. -These files, located `/tmp` directory but we could read them if we get `root` access.
- For commands refer to the above commands, they are the same for `ccache`.

##### a) Looking for `ccache` files

- Will list the domain users. Must require read permissions or be higher privileged user to read the `/tmp` details.
##### b) Identifying the group membership 

##### c) Impersonation of an user with a `Keytab`

##### d) Connecting to SMB Share

---
## `Keytab` Extraction


### Extracting hashes from `keytab` using `keyTabExtract`

- You might get hashes so you can use them to perform **Pass the Hash** attacks or you can crack them offline using cracking tools like `hashcat` or `john`.
- **Note:** A KeyTab file can contain different types of hashes and can be merged to contain multiple credentials even from different users.

```bash
python3 /opt/keytabextract.py <keytab_filepath>
```


















