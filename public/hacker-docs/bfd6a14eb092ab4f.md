
## Install webfuzz

Setup a Python Virtual Environment first, then execute the below commands.

```bash
git clone https://github.com/PandaSt0rm/webfuzz_api.git
cd webfuzz_api
pip3 install -r requirements.txt
```

---
## Fuzzing the API

```bash
python3 api_fuzzer.py http://<IP>:<PORT>
```

