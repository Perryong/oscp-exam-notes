## Identify Hash Formats

```bash
hashid -j <hash to crack>
```

## Single Crack Mode

- Read the Theory to understand better what the command does.

```bash
john --single <filename to crack>
```


## Wordlist Mode

- Read the Theory to understand better what the command does.
- Multiple wordlists can be specified using the comma(`,`)
- Words need to be one per line in plain text.

```bash
john --wordlist=<wordlist path> <hash file to crack>
```


## Incremental Mode

- Read the Theory to understand better what the command does.

```bash
john --incremental <hash file to crack>
```


## Cracking files

- It is also possible to crack password-protected or encrypted files with JtR. Multiple `"2john"` tools come with JtR that can be used to process files and produce hashes compatible with JtR. The generalized syntax for these tools is:

```bash
<tool> <file to crack> > <file name to store hash>
```

- The idea is basically as shown below to understand the workflow.

`Protected File  →  *2john tool  →  Hash format  →  John the Ripper cracks it`

Some of the tools included with JtR are:

| **Tool**                | **Description**                               |
| ----------------------- | --------------------------------------------- |
| `pdf2john`              | Converts PDF documents for John               |
| `ssh2john`              | Converts SSH private keys for John            |
| `mscash2john`           | Converts MS Cash hashes for John              |
| `keychain2john`         | Converts OS X keychain files for John         |
| `rar2john`              | Converts RAR archives for John                |
| `pfx2john`              | Converts PKCS#12 files for John               |
| `truecrypt_volume2john` | Converts TrueCrypt volumes for John           |
| `keepass2john`          | Converts KeePass databases for John           |
| `vncpcap2john`          | Converts VNC PCAP files for John              |
| `putty2john`            | Converts PuTTY private keys for John          |
| `zip2john`              | Converts ZIP archives for John                |
| `hccap2john`            | Converts WPA/WPA2 handshake captures for John |
| `office2john`           | Converts MS Office documents for John         |
| `wpa2john`              | Converts WPA/WPA2 handshakes for John         |
| ...SNIP...              | ...SNIP...                                    |


