## Hunting in Windows

### Snaffler  [link](https://github.com/SnaffCon/Snaffler)

- A C# tool used for **automated hunting of sensitive files** in network shares.
- Designed for **domain-joined Windows machines**.
- Searches **accessible shares** for credentials, config files, and other sensitive data.
- **Discovers DFS shares** and computers from Active Directory (AD). **DFS** shares refer to shared folders on a network that are organized and managed using Microsoft's [Distributed File System (DFS)](https://learn.microsoft.com/en-us/windows/win32/dfs/distributed-file-system-dfs-functions) technology
- Identifies **readable shares** on those systems.
- Searches for **interesting files** using **regex patterns** (e.g., for passwords, keys).
- Highlights results by color:
    - 🟥 `{Red}`: High-interest match (e.g., passwords)
    - 🟨 `{Yellow}`: Medium-interest match (e.g., system images)
    - 🟩 `{Green}`: Readable shares
    - ⚫ `{Black}`: Inaccessible shares


```cmd
Snaffler.exe -s
```


## Hunting in Linux


### ManSpider [Link](github.com/blacklanternsecurity/MANSPIDER)

- **Connect to a remote Windows system** over SMB
- Use provided **username and password**
- **Search for sensitive files** (e.g., passwords) using a keyword filter (`passw`)
- Search for sensitive files (like those containing "passw") on a remote system over **SMB**, using provided credentials.

```bash
 docker run --rm -v ./<HOST_MACHINE_MOUNT_POINT>:/root/.manspider blacklanternsecurity/manspider <TARGET_SERVER_IP> -c '<STRING_PATTERN>' -u '<USERNAME>' -p '<PASSWORD>'
```