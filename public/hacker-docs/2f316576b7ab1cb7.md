
## Cracking SSH Key
### 1. Extract Hash from SSH Private Key

```bash
ssh2john <SSH private key> > <SSH private key hash filename>
```


## Cracking PDF File

### 1. Extract Hash from PDF File

```bash
pdf2john <PDF filename> > <PDF hash filename>
```

## 2. Cracking the Hash

```bash
john --wordlist=<wordlist path> <hash filename>
```

