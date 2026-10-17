
## Run Default Scripts 

- Runs `nmap` defaults scripts loaded in the `nmap` script engine.

```bash
sudo nmap -sC <IP>
```


## Run specified Scripts

- We can specify what `nmap` scripts we want to run specifically instead of default `nmap` scripts.

```bash
sudo nmap --script <script_name1>, <script_name2>,...<script_nameN>
```

