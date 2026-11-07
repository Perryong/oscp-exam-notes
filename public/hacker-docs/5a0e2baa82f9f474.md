
## Footprinting the Service

```bash
sudo nmap <TARGET IP> -p111,2049 -sV -sC
```

**OR**

```bash
sudo nmap --script nfs* <TARGET IP> -sV -p111,2049
```

- **RPC Service Discovery** -> Communicates with Portmapper(`port 111`) to identify RPC programs running.
- **Export Enumeration** -> checks which NFS shares are available for mounting.
- **Directory Traversal** -> It connects to the **export** i.e. `/nfs/export` and requests list of files.
- **etc...**


## Show Available NFS Shares

```bash
showmount -e <TARGET IP>
```

## Mounting Share

```bash
mkdir <mounting directory_name>
sudo mount -t nfs <TARGET IP>:/<nfs_share> ./<mounted directory_name>/ -o nolock
cd <mounted directory_name>
tree .
```

## Unmounting Share

```bash
unmount <mounted directory_name>
```

## List Contents and Usernames of Mounted Share

```bash
ls -l <mounted directory_name>
```

## List UIDs and GIDs of Mounted Share

```bash
ls -n <mounted directory_name>
```

