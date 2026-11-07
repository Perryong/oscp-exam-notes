
## Bruteforce Attack

#### Domain Joined Account

- This is to bruteforce domain joined accounts i.e. accounts associated with the Active Directory network.

```bash
netexec smb <TARGET IP> -u <user/user wordlist> -p <password/password wordlist>
```

#### Non Domain Joined Account

- If the `enum4linux` output shows Domain is `WORKGROUP` then the target machine/user is not domain joined. Hence, we need to look for passwords locally.
- Use `enum4linux` first to determine whether the user/machine is domain joined or not based on that the `--local-auth` will be appended. If you get `Local User` state explicitly then use `--local-auth` and otherwise don't.

```bash
netexec smb <TARGET IP> -u <user/user wordlist> -p <password/password wordlist> --local-auth
```


## Non Anonymous Share Listing

- password for the user may be prompted later.

```bash
smbclient -U <username> -L //<TARGET IP>
```

**OR**

```bash
netexec smb <TARGET IP> -u "<username>" -p "<password>" --shares
```

## Anonymous Share Listing

- `-N` is for NULL session or anonymous access without username or password.
- `-L` is for listing shares.

```bash
smbclient -N -L //<TARGET IP>
```

**OR**

```bash
nxc smb <TARGET IP> --shares -u '' -p ''
```

## Connecting to Share

```bash
smbclient //<TARGET IP>/<share_name>
```

**OR**

- May require a password. The below command incase a certain share is only accessible by a particular user.

```bash
smbclient -U <username> //<TARGET IP>/<share_name>
```

## Download files from SMB

- When you are inside the SMB server, use the below command to download the file.

```bash
get <filename>
```

## Footprinting the Service

```bash
 sudo nmap <TARGET IP> -sV -sC -p139,445
```

## Connecting with rpcclient

- Tool can be used to perform administrative tasks, enumerate users in the SMB server .etc.

```bash
rpcclient -U "" <TARGET IP>
```

## rpcclient Commands

| **Query**                 | **Description**                                                    |
| ------------------------- | ------------------------------------------------------------------ |
| `srvinfo`                 | Server information.                                                |
| `enumdomains`             | Enumerate all domains that are deployed in the network.            |
| `querydominfo`            | Provides domain, server, and user information of deployed domains. |
| `netshareenumall`         | Enumerates all available shares.                                   |
| `netsharegetinfo <share>` | Provides information about a specific share.                       |
| `enumdomusers`            | Enumerates all domain users.                                       |
| `queryuser <RID>`         | Provides information about a specific user.                        |

## SMB enumeration (USERS, GROUP RIDS, etc)

- Used for enumerating users in SMB server.
- Used for finding Group RIDs.
- Used for enumerating SMB shares and their permissions.

```bash
enum4linux <TARGET IP> -A
```



