
## Linux to Linux Transfer Methods

- The below methods are used to transfer files between 2 Linux systems.


## Python Download METHOD (ATTACK MACHINE)

- The below command is used to download a file from the target machine to local machine.

```bash
python3 -c "import urllib.request; urllib.request.urlretrieve('http://<Victim Machine IP>/<filename to download>', '<filename to save as>')"
```

## Python HTTP Server METHOD

- In this method we setup a python HTTP server on the victim machine.
- Then use the `wget` command to download the file from that victim machine.
- You must specify the victim machine IP, destination port, and filename to download.

### Start HTTP server (ATTACK MACHINE)

```bash
python -m http.server
```

### Download file (VICTIM MACHINE)

```bash
wget http://<Victim Machine IP>:<PORT>/<filename to download>
```

