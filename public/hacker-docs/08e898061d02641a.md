
## NFS

- NFS stands for Network File System.
- Has the same purpose as the SMB i.e. files can be accessed over a network as if they were local. But NFS uses a different protocol. It is based on **Open Network Computing Remote Procedure Call**.
- NFS protocol has no **authentication** or **authorization**, instead authentication is handled by RPC(**allows a program to execute a function on a different computer (remote server) as if it were a local**).
- NFS is used by both Linux and Windows.
- Port `TCP/UDP 111` or `TCP/UDP 2049`.

| **Version** | **Features**                                                                                                                                                                                                                                                         |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NFSv2`     | It is older but is supported by many systems and was initially operated entirely over UDP.                                                                                                                                                                           |
| `NFSv3`     | It has more features, including variable file size and better error reporting, but is not fully compatible with NFSv2 clients.                                                                                                                                       |
| `NFSv4`     | It includes Kerberos, works through firewalls and on the Internet, no longer requires portmappers, supports ACLs, applies state-based operations, and provides performance improvements and high security. It is also the first version to have a stateful protocol. |

## NFS Configurations

- The default `exports` file contains some examples of configuring NFS shares.
- Location `/etc/exports` or try `/etc/nfs.conf`.

### Dangerous Settings

| **Option**       | **Description**                                                                                                      |
| ---------------- | -------------------------------------------------------------------------------------------------------------------- |
| `rw`             | Read and write permissions.                                                                                          |
| `insecure`       | Ports above 1024 will be used.                                                                                       |
| `nohide`         | If another file system was mounted below an exported directory, this directory is exported by its own exports entry. |
| `no_root_squash` | All files created by root are kept with the UID/GID 0.                                                               |

*So lets say if I am on my own local machine as root I access the NFS share as that local root user I will be root in the NFS server as well because of `no_root_squash` but in `root_squash` rule if my `GID=RID=0` i.e. root but locally so I am made nobody user i.e. anonymous by reducing my privilege on that NFS server or share while accessing*

---
## Questions and Solutions

- Enumerate the NFS service and submit the contents of the flag.txt in the "nfs" share as the answer.
	- **HTB{redacted}**

- Enumerate the NFS service and submit the contents of the flag.txt in the "nfsshare" share as the answer.
	- **HTB{redacted}**

### Footprinting the service

First we need to enumerate the NFS service using `nmap` and `nmap script engine` .

```bash
$ sudo nmap --script nfs* 10.129.202.5 -p111,2049 -sV                            
Starting Nmap 7.95 ( https://nmap.org ) at 2026-01-25 09:25 EST
Nmap scan report for 10.129.202.5
Host is up (0.60s latency).

Bug in rpcinfo: no string output.
PORT     STATE SERVICE VERSION
111/tcp  open  rpcbind 2-4 (RPC #100000)
|_nfs-statfs: ERROR: Script execution failed (use -d to debug)
|_nfs-ls: ERROR: Script execution failed (use -d to debug)
2049/tcp open  nfs     3-4 (RPC #100003)

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 24.29 seconds
```

### Listing Available Shares

```bash
$ showmount -e 10.129.202.5                                                                                                                  
Export list for 10.129.202.5:
/var/nfs      10.0.0.0/8
/mnt/nfsshare 10.0.0.0/8
```

### Creating Mount Points and Mounting

After finding our available shares for mounting, we need to create the following mount points and check the files present in those NFS share.

```bash
$ mkdir nfs
$ mkdir nfsshare
$ sudo mount -t nfs 10.129.202.5:/var/nfs ./nfs/ -nolock
$ sudo mount -t nfs 10.129.202.5:/mnt/nfsshare ./nfsshare/ -nolock
```

Read the NFS shares to get the flag.
