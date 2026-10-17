
## Identify the Hash type

```bash
hashid -m <hash to crack>
```

## Wordlist Attack

```bash
hashcat -a 0 -m <hash type number> <hash to crack/hash file to crack> <wordlist path>
```

## Wordlist Attack + Rules

- `hashcat` rule LOCATION -> `/usr/share/hashcat/rules` 
- From there you can choose the rule you want to include.

```bash
hashcat -a 0 -m <hash type number> <hash to crack/hash file to crack> <wordlist path> -r <hashcat rule>
```

## Mask Attack

Hashcat includes several built-in character sets :
### Character Set

| Symbol | Charset                             |
| ------ | ----------------------------------- |
| ?l     | abcdefghijklmnopqrstuvwxyz          |
| ?u     | ABCDEFGHIJKLMNOPQRSTUVWXYZ          |
| ?d     | 0123456789                          |
| ?h     | 0123456789abcdef                    |
| ?H     | 0123456789ABCDEF                    |
| ?s     | «space»!"#$%&'()*+,-./:;<=>?@[]^_`{ |
| ?a     | ?l?u?d?s                            |
| ?b     | 0x00 - 0xff                         |

```bash
hashcat -a 3 -m <hash type number> <hash to crack/hash file to crack> '<character set>'
```


## Rule Based Attack

- In rule based attack each rule is applied once for every word.
- So if the wordlist has 1 word and rules are 4 so mutated wordlist will have 4 words.

| **Function** | **Description**                                  |
| ------------ | ------------------------------------------------ |
| `:`          | Do nothing                                       |
| `l`          | Lowercase all letters                            |
| `u`          | Uppercase all letters                            |
| `c`          | Capitalize the first letter and lowercase others |
| `sXY`        | Replace all instances of X with Y                |
| `$!`         | Add the exclamation character at the end         |

### Form Mutated Wordlist

- `mutated wordlist filename` => the wordlist formed when rules are applied to a predefined wordlist.
- `rule file.rule` => rule file make modifications on the predefined wordlist.
- **Documentation** => [Rule Based Attack Documentation](https://hashcat.net/wiki/doku.php?id=rule_based_attack)

```bash
hashcat --force <wordlist path> -r <rule file>.rule --stdout | sort -u > <mutated wordlist filename>
```





