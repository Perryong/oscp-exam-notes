
## Cracking Zip Files

### 1. Extract Hash from ZIP File

```bash
zip2john <ZIP filename> > <ZIP hash filename>
```


## Cracking Office Files

### 1. Extract Hash from Office File

```bash
office2john <Office filename> > <Office hash filename>
```


## 2. Cracking the Hash

```bash
john --wordlist=<wordlist path> <hash filename>
```



## Cracking BitLocker Encrypted Files

### 1. Extracting Hashes from BitLocker Encrypted Drive

- `Bitlocker diskname` => placeholder for BitLocker filename.
- `Bitlocker hash filename` => placeholder for BitLocker hash file. Give filename as per your own wish.

```bash
bitlocker2john -i <Bitlocker diskname> > <Bitlocker hash filename>
```

### 2. Extract Required Hash

- `intger value` => placeholder for the integer value you need to provide to extract a particular hash from the list of hashes extracted inside the `Bitlocker hash filename`. **Example** : `bitlocker$0`, `bitlocker$1` .... etc. so you need to provide `1`, `0` or any other digit to extract that particular hash.
- `Bitlocker new hash filename`=> placeholder for the new hash filename where the extracted hash is present.

```bash
grep "bitlocker\$<integer value>" <Bitlocker hash filename> > <Bitlocker new hash filename>
```

### 3. Cracking the BitLocker Hash

```bash
hashcat -a 0 -m 22100 <Bitlocker new hash filename>
```

### 4. Mount the Encrypted Drive

- **WHY MOUNTING REQUIRED** : After we crack the BitLocker password it is important we mount the drive because the password is just the key for decrypting the file but we need to mount the drive to access the contents inside it. **Mount BitLocker Drive + Hash Password** => required to access the contents inside the drive. 


#### IN WINDOWS :
- Double-click on the BitLocker encrypted drive and enter the hash password to access the file contents.

#### IN LINUX :

```bash
# create the below 2 folders
sudo mkdir -p /media/bitlocker # decrypted disk file
sudo mkdir -p /media/bitlockermount # actual mounted filesystem
```

- **NOTE** : Sometimes loop devices aren't loaded so use `sudo modprobe loop`.  **NOT REQUIRED IF LOOP DEVICES ARE SHOWING**.

```bash
sudo modprobe loop # load loop kernel module
ls /dev/loop* # check loop devices in the Linux system
sudo losetup -f -P <BitLocker diskname> # configure VHD as loop device
losetup -l # check loop device assigned to VHD file
lsblk # find loop device partition cuz VHD can have multiple partition numbers
sudo dislocker /dev/<loop device partion name> -u -- /media/bitlocker # decrypt encrypted bitlocker partition (loop device)
sudo ls -alh /media/bitlocker/ # check dislocker filenames
sudo mount -o loop /media/bitlocker/<dislocker filename> /media/bitlockermount # mount decrypted disk file to system so that OS can browse files.
```

- `cd /media/bitlockermount` to look for files.

```bash
# unmount the 2 partitions 
sudo umount /media/bitlockermount
sudo umount /media/bitlocker
```

## Cracking GZIP/OpenSSL Files

- `gzip` files are encrypted using `openssl`.
- Once the command execution is finished check the current directory to look for the file using `ls` command.

```bash
for i in $(cat <wordlist path>);do openssl enc -aes-256-cbc -d -in <gzip filename> -k $i 2>/dev/null| tar xz;done
```

