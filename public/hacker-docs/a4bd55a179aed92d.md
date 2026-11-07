
To complete this Skills Assessment, you will need to apply the multitude of tools and techniques showcased throughout this module. All fuzzing can be completed using the `common.txt` SecLists Wordlist, found at `/usr/share/seclists/Discovery/Web-Content` on Pwnbox, or via the SecLists GitHub.


- After completing all steps in the assessment, you will be presented with a page that contains a flag in the format of HTB{...}. What is that flag?
	- **HTB{redacted}**


#### Directory fuzzing

Performed directory fuzzing using `gobuster` to find hidden directories and work our way from there.

```bash
gobuster dir -u http://83.136.253.144:35176 -w /usr/share/seclists/Discovery/Web-Content/common.txt -t 50
```

#### File Fuzzing

Looking for various file extensions including hidden directories using `feroxbuster`.

```bash
feroxbuster -u http://83.136.253.144:35176/ -w /usr/share/seclists/Discovery/Web-Content/common.txt -x .php,.html,.js,.bak,.txt,.gz -t 100
```

I got 2 hits with this command.

#### Parameter and Value fuzzing

After I got the `panel.php` inside the `/admin` directory. I ran the `cURL` command but the php file was asking for an accessID so I used `wenum` to perform parameter and value fuzzing on this. At first there was a bunch of `58` size responses coming so below I used `--hs` switch to filter those responses and get something apart from it.

```bash
wenum -w /usr/share/seclists/Discovery/Web-Content/common.txt --hc 404 -u "http://83.136.253.144:35176/admin/panel.php?accessID=FUZZ" --hs 58
```

I got a `200` status code hit and this response was of a different size so I used `cURL` command to make a GET request at this endpoint as shown below.

```bash
curl http://83.136.253.144:35176/admin/panel.php?accessID=getaccess
Head on over to the fuzzing_fun.htb vhost for some more fuzzing fun!
```

Ok so, lets head over there and see what happens. But first we need to add this vhost to our `/etc/hosts` file. Now let's do vhost fuzzing using `gobuster` as shown below.

```bash
gobuster vhost -u http://fuzzing_fun.htb:35176 -w /usr/share/seclists/Discovery/Web-Content/common.txt --append-domain -t 50
```

After running the above command I got this ->`Found: hidden.fuzzing_fun.htb:35176 Status: 200 [Size: 45]` . Add this new vhost to `/etc/hosts` file.

```bash
curl hidden.fuzzing_fun.htb:35176
Wrong path, remember to be looking in /godeep
```

Its telling us to search the `/godeep` directory. Let's perform file fuzzing in `http://hidden.fuzzing_fun.htb:35176/godeep/` using `feroxbuster`.

```bash
feroxbuster -u http://hidden.fuzzing_fun.htb:31616/godeep/ -w /usr/share/seclists/Discovery/Web-Content/common.txt -x .php,.html,.txt -t 100
```

This gave me 3 hidden directories and I used `cURL` for each of them but only 1 had the flag value.

```bash
curl http://hidden.fuzzing_fun.htb:31616/godeep/stoneedge/bbclone/typo3/
```

