
## GZIP

- `openssl` can be used to encrypt files in the `GZIP` format. To determine the actual format of a file, we can use the `file` command

## BitLocker

- [BitLocker](https://docs.microsoft.com/en-us/windows/security/information-protection/bitlocker/bitlocker-device-encryption-overview-windows-10) is a full-disk encryption feature developed by Microsoft for the Windows operating system. Available since Windows Vista, it uses the `AES` encryption algorithm with either 128-bit or 256-bit key lengths. If the password or PIN used for BitLocker is forgotten, decryption can still be performed using a recovery key—a 48-digit string generated during the setup process.
- After we crack the BitLocker password it is important we mount the drive because the password is just the key for decrypting the file but we need to mount the drive to access the contents inside it. **Mount BitLocker Drive + Hash Password** => required to access the contents inside the drive.

## VHD

- Virtual Hard Disk.
- Acts as a real physical disk
- A VHD file can have the following stuff, so to a VM it looks like a real disk :-
	- Partitions
	- Filesystems
	- Bootloader
	- Operating System
- VMs stored in VHD files because on the real physical disk the Host OS is installed.


## Hypervisor

- Its the software layer that creates and manages virtual machines.
- Hypervisor uses VHD files because of the following reasons :-
	- **Isolation** : Prevent the VM from modifying the host disk.
	- **Snapshots** : Save the VM state.
	- **Multiple VMs** : Run many VMs on the same physical disk.
	- **Portability** : Move the VM easily.
- Without Hypervisor :-
	- VM could overwrite the host OS
	- Hard to run multiple VMs
	- Snapshots impossible
	- Risk of data corruption
- The **hypervisor is what converts a VHD file into a virtual hard drive for the VM and manages all disk operations between the VM and the physical SSD/HDD.**


## Loop Device

- a **loop device**, **vnd** (vnode disk), or **lofi** (loop file interface) is a [pseudo-device](https://en.wikipedia.org/wiki/Device_file#Pseudo-devices "Device file") that makes a [computer file](https://en.wikipedia.org/wiki/Computer_file "Computer file") accessible as a [block device](https://en.wikipedia.org/wiki/Device_file_system#Block_devices "Device file system") or a real disk.

---
## Questions and Solutions

- Run the above target then navigate to http://ip:port/download, then extract the downloaded file. Inside, you will find a password-protected VHD file. Crack the password for the VHD and submit the recovered password as your answer.
	- **francisco**


#### Getting the VHD file

```bash
$ wget http://154.57.164.71:30654/download
--2026-03-14 10:04:06--  http://154.57.164.71:30654/download
Connecting to 154.57.164.71:30654... connected.
HTTP request sent, awaiting response... 200 OK
Length: unspecified [application/octet-stream]
Saving to: ‘download’

download                                                       [                                                                 <=>                                                                     ]  60.31M  4.40MB/s    in 16s     

2026-03-14 10:04:23 (3.68 MB/s) - ‘download’ saved [63237414]
$ ls
download
$ file download 
download: Zip archive data, at least v2.0 to extract, compression method=deflate
$ unzip download
Archive:  download
  inflating: Private.vhd
$ ls
download  Private.vhd
$ file Private.vhd 
Private.vhd: DOS/MBR boot sector MS-MBR Windows 7 english at offset 0x163 "Invalid partition table" at offset 0x17b "Error loading operating system" at offset 0x19a "Missing operating system", disk signature 0x1d6fbd57; partition 1 : ID=0x7, start-CHS (0x0,2,3), end-CHS (0x7,200,1), startsector 128, 124928 sectors       
```

#### Extracting Hashes from VHD file

Using `bitlocker2john` to extract hashes from the VHD file.

```bash
$ bitlocker2john -i Private.vhd > Private.hash

Signature found at 0x10003
Version: 8 
Invalid version, looking for a signature with valid version...

Signature found at 0x2200000
Version: 2 (Windows 7 or later)

VMK entry found at 0x22000bb

VMK encrypted with User Password found at 22000dc
VMK encrypted with AES-CCM

VMK entry found at 0x220019b

VMK encrypted with Recovery Password found at 0x22001bc
Searching AES-CCM from 0x22001d8
Trying offset 0x220026b....
VMK encrypted with AES-CCM!!

Signature found at 0x2956000
Version: 2 (Windows 7 or later)

VMK entry found at 0x29560bb

VMK entry found at 0x295619b

Signature found at 0x30ab000
Version: 2 (Windows 7 or later)

VMK entry found at 0x30ab0bb

VMK entry found at 0x30ab19b
```

Checking contents of the **Private.hash** file.

```bash
$ cat Private.hash
Encrypted device Private.vhd opened, size 64MB
UP Nonce: b020fe18bbb1db0103000000
UP MAC: e9c6b548788aeff190e517b0d85ada5d
UP VMK: aad7a0a3f40c4467307011ac17f79f8c99768419903025fd7072ee78b15a729afcf54b8c2e3af05bb18d4ba0

Salt: 1d06e8b3aa5f14ddcb5ad7415c1d24f5
RP Nonce: b020fe18bbb1db0106000000
RP MAC: 8ff2e9cdd6ec25df9060e95e3c490a9a
RP VMK: efd5601f4cefa47da810339f809a90187cbbd907bd1077565293727114f3c218c078e03f2f8baa214f1de800


User Password hash:
$bitlocker$0$16$b3c105c7ab7faaf544e84d712810da65$1048576$12$b020fe18bbb1db0103000000$60$e9c6b548788aeff190e517b0d85ada5daad7a0a3f40c4467307011ac17f79f8c99768419903025fd7072ee78b15a729afcf54b8c2e3af05bb18d4ba0
Hash type: User Password with MAC verification (slower solution, no false positives)
$bitlocker$1$16$b3c105c7ab7faaf544e84d712810da65$1048576$12$b020fe18bbb1db0103000000$60$e9c6b548788aeff190e517b0d85ada5daad7a0a3f40c4467307011ac17f79f8c99768419903025fd7072ee78b15a729afcf54b8c2e3af05bb18d4ba0
Hash type: Recovery Password fast attack
$bitlocker$2$16$1d06e8b3aa5f14ddcb5ad7415c1d24f5$1048576$12$b020fe18bbb1db0106000000$60$8ff2e9cdd6ec25df9060e95e3c490a9aefd5601f4cefa47da810339f809a90187cbbd907bd1077565293727114f3c218c078e03f2f8baa214f1de800
Hash type: Recovery Password with MAC verification (slower solution, no false positives)
$bitlocker$3$16$1d06e8b3aa5f14ddcb5ad7415c1d24f5$1048576$12$b020fe18bbb1db0106000000$60$8ff2e9cdd6ec25df9060e95e3c490a9aefd5601f4cefa47da810339f809a90187cbbd907bd1077565293727114f3c218c078e03f2f8baa214f1de800
```

We are interested in the User Password `bitlocker$0` hash one.

#### Extracting the User Password Hash

```bash
$ grep "bitlocker\$0" Private.hash > UserPassword.hash
$ cat UserPassword.hash
$bitlocker$0$16$b3c105c7ab7faaf544e84d712810da65$1048576$12$b020fe18bbb1db0103000000$60$e9c6b548788aeff190e517b0d85ada5daad7a0a3f40c4467307011ac17f79f8c99768419903025fd7072ee78b15a729afcf54b8c2e3af05bb18d4ba0
```

#### Cracking the BitLocker Hash

```bash
$ hashcat -a 0 -m 22100 UserPassword.hash /usr/share/wordlists/rockyou.txt
```

The above command revealed the password is -> **francisco**


- Mount the BitLocker-encrypted VHD and enter the contents of flag.txt as your answer.
	- **43d95aeed3114a53ac66f01265f9b7af**

#### Mounting the Encrypted Drive

Creating two folders for the 2 following reasons :-

- folder1 -> will act as the container where the decrypted disk file will be.
- folder2 -> where the decrypted disk file will be mounted.

```bash
$ sudo mkdir -p /media/bitlocker
$ sudo mkdir -p /media/bitlockermount
```

We configure the VHD file as loop device and then check which loop device and partition number its assigned to.

```bash
$ sudo modprobe loop
$ ls /dev/loop*
/dev/loop0  /dev/loop1  /dev/loop2  /dev/loop3  /dev/loop4  /dev/loop5  /dev/loop6  /dev/loop7  /dev/loop-control
$ sudo losetup -f -P Private.vhd
$ losetup -l
NAME       SIZELIMIT OFFSET AUTOCLEAR RO BACK-FILE                                  DIO LOG-SEC
/dev/loop0         0      0         0  0 /home/kali/Desktop/HTB_Academy/Private.vhd   0     512
$ lsblk          
NAME      MAJ:MIN RM  SIZE RO TYPE MOUNTPOINTS
loop0       7:0    0   64M  0 loop 
└─loop0p1 259:0    0   61M  0 part 
sda         8:0    0 80.1G  0 disk 
└─sda1      8:1    0 80.1G  0 part /
```


#### Decrypting Encrypted Partition

- Password -> **francisco**

```
$ sudo dislocker /dev/loop0p1 -u -- /media/bitlocker 
Enter the user password:
$ sudo ls -alh /media/bitlocker/
total 4.0K
dr-xr-xr-x 2 root root    0 Dec 31  1969 .
drwxr-xr-x 4 root root 4.0K Mar 14 10:24 ..
-rw-rw-rw- 1 root root  61M Dec 31  1969 dislocker-file
```

#### Mounting Decrypted Partition

```bash
$ sudo mount -o loop /media/bitlocker/dislocker-file /media/bitlockermount
$ ls -alh /media/bitlockermount
total 17K
drwxrwxrwx 1 root root 4.0K Apr 20  2025  .
drwxr-xr-x 4 root root 4.0K Mar 14 10:24  ..
-rwxrwxrwx 1 root root   32 Apr 20  2025  flag.txt
drwxrwxrwx 1 root root 8.0K Apr 20  2025 'System Volume Information'
```

Read the `flag.txt` file to get the flag.


#### Always Unmount Partitions

Unmount the 2 partitions :-
- `/media/bitlocker`
- `/media/bitlockermount`

```bash
$ sudo umount /media/bitlocker
$ sudo unmount /media/bitlockermount
```

