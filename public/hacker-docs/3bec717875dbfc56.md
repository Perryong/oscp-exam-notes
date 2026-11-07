
## SYNTAX

```bash
<type>/<os>/<service_name>/<script_name>
```

- **Example** : `exploit/windows/ftp/scriptftp_list`
- **NOTE** : The script will show a **index no** before itself so we can directly use that number in the future instead of typing the whole script path.
- Below are some types of scripts based on categories :-

| **Type**    | **Description**                                                                                 |
| ----------- | ----------------------------------------------------------------------------------------------- |
| `Auxiliary` | Scanning, fuzzing, sniffing, and admin capabilities. Offer extra assistance and functionality.  |
| `Encoders`  | Ensure that payloads are intact to their destination.                                           |
| `Exploits`  | Defined as modules that exploit a vulnerability that will allow for the payload delivery.       |
| `NOPs`      | (No Operation code) Keep the payload sizes consistent across exploit attempts.                  |
| `Payloads`  | Code runs remotely and calls back to the attacker machine to establish a connection (or shell). |
| `Plugins`   | Additional scripts can be integrated within an assessment with `msfconsole` and coexist.        |
| `Post`      | Wide array of modules to gather information, pivot deeper, etc.                                 |


## Search Scripts

- The below command should be typed inside the `msfconsole`
- Search script by its name.

```bash
search <script_name>
```

## Search Scripts Specifically

- The below command should be typed inside the `msfconsole`
- Specific searches helps us filter out our actual required script.
- **Example** : `search type:exploit platform:windows cve:2021 rank:excellent microsoft` 

```bash
search type:<type> platform:<os> cve:<cve_year_of_disclosure> rank:<rank>
```

## Use Script

- **BY INDEX NUMBER**

```bash
use <script_index_no>
```

- **BY SCRIPT PATH/NAME**

```bash
use <script_path/name>
```


## Check Script Requirements

- After entering the `use` command we check use the below command to check for the requirements of the script required before executing it. 
- We can configure or target IP, ports .etc. This depends on the script.

```bash
options
```

