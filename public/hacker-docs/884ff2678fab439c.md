

## Core Protocols used in Active Directory (AD)

- **LDAP**
- **Kerberos**
- **DNS**
- **SMB**
- **RPC**


---
## Questions and Solutions

- One of the shares mendres has access to contains valid credentials of another domain user. What is their password?
	- **ILovePower333###**

#### RDP to the Target Machine

```bash
$ xfreerdp /u:mendres /p:'Inlanefreight2025!' /v:10.129.124.92
```


```cmd-session
C:\Users\Public>Snaffler.exe -s
 .::::::.:::.    :::.  :::.    .-:::::'.-:::::':::    .,:::::: :::::::..
;;;`    ``;;;;,  `;;;  ;;`;;   ;;;'''' ;;;'''' ;;;    ;;;;'''' ;;;;``;;;;
'[==/[[[[, [[[[[. '[[ ,[[ '[[, [[[,,== [[[,,== [[[     [[cccc   [[[,/[[['
  '''    $ $$$ 'Y$c$$c$$$cc$$$c`$$$'`` `$$$'`` $$'     $$""   $$$$$$c
 88b    dP 888    Y88 888   888,888     888   o88oo,.__888oo,__ 888b '88bo,
  'YMmMY'  MMM     YM YMM   ''` 'MM,    'MM,  ''''YUMMM''''YUMMMMMMM   'W'
                         by l0ss and Sh3r4 - github.com/SnaffCon/Snaffler


[INLANEFREIGHT\mendres@DC01] 2025-06-30 16:18:47Z [Info] Parsing args...
[INLANEFREIGHT\mendres@DC01] 2025-06-30 16:18:47Z [Info] Parsed args successfully.
[INLANEFREIGHT\mendres@DC01] 2025-06-30 16:18:47Z [Info] Invoking DFS Discovery because no ComputerTargets or PathTargets were specified
[INLANEFREIGHT\mendres@DC01] 2025-06-30 16:18:47Z [Info] Getting DFS paths from AD.
[INLANEFREIGHT\mendres@DC01] 2025-06-30 16:18:48Z [Info] Found 0 DFS Shares in 0 namespaces.
[INLANEFREIGHT\mendres@DC01] 2025-06-30 16:18:48Z [Info] Invoking full domain computer discovery.
[INLANEFREIGHT\mendres@DC01] 2025-06-30 16:18:48Z [Info] Getting computers from AD.
[INLANEFREIGHT\mendres@DC01] 2025-06-30 16:18:48Z [Info] Got 1 computers from AD.
[INLANEFREIGHT\mendres@DC01] 2025-06-30 16:18:48Z [Info] Starting to look for readable shares...
[INLANEFREIGHT\mendres@DC01] 2025-06-30 16:18:48Z [Info] Created all sharefinder tasks.
[INLANEFREIGHT\mendres@DC01] 2025-06-30 16:18:48Z [Share] {Black}<\\DC01.inlanefreight.local\ADMIN$>()
[INLANEFREIGHT\mendres@DC01] 2025-06-30 16:18:48Z [Share] {Green}<\\DC01.inlanefreight.local\ADMIN$>(R) Remote Admin
[INLANEFREIGHT\mendres@DC01] 2025-06-30 16:18:48Z [Share] {Black}<\\DC01.inlanefreight.local\C$>()
[INLANEFREIGHT\mendres@DC01] 2025-06-30 16:18:48Z [Share] {Green}<\\DC01.inlanefreight.local\C$>(R) Default share
[INLANEFREIGHT\mendres@DC01] 2025-06-30 16:18:48Z [Share] {Green}<\\DC01.inlanefreight.local\Company>(R)
[INLANEFREIGHT\mendres@DC01] 2025-06-30 16:18:48Z [Share] {Green}<\\DC01.inlanefreight.local\HR>(R)
[INLANEFREIGHT\mendres@DC01] 2025-06-30 16:18:48Z [Share] {Green}<\\DC01.inlanefreight.local\IT>(R)
[INLANEFREIGHT\mendres@DC01] 2025-06-30 16:18:48Z [Share] {Green}<\\DC01.inlanefreight.local\NETLOGON>(R) Logon server share
...SNIP...
```

We found a couple of shares which are accessible to **mendres**


#### Connecting to IT share

```bash
$ smbclient //10.129.61.248/IT -U mendres
Password for [WORKGROUP\mendres]:
Try "help" to get a list of possible commands.
smb: \> ls
  .                                   D        0  Thu May  1 10:53:35 2025
  ..                                  D        0  Thu May  1 10:53:35 2025
  Admin                               D        0  Thu May  1 11:24:47 2025
  Software                            D        0  Thu May  1 10:56:31 2025
  Tools                               D        0  Thu May  1 12:27:52 2025

		5056511 blocks of size 4096. 1242846 blocks available
smb: \> cd Tools\
smb: \Tools\> ls
  .                                   D        0  Thu May  1 12:27:52 2025
  ..                                  D        0  Thu May  1 12:27:52 2025
  checklist_2023.txt                  A       86  Thu May  1 11:12:08 2025
  config.ini                          A       66  Thu May  1 11:12:08 2025
  deploy_instructions.txt             A      178  Thu May  1 11:12:08 2025
  log_1.log                           A     8631  Thu May  1 11:12:08 2025
  log_10.log                          A    14983  Thu May  1 11:12:09 2025
  log_11.log                          A     3701  Thu May  1 11:12:09 2025
  log_12.log                          A    11431  Thu May  1 11:12:10 2025
  log_13.log                          A     5004  Thu May  1 11:12:10 2025
  log_14.log                          A     5895  Thu May  1 11:12:10 2025
  log_15.log                          A     4387  Thu May  1 11:12:10 2025
  log_16.log                          A      943  Thu May  1 11:12:10 2025
  log_17.log                          A     5970  Thu May  1 11:12:10 2025
  log_18.log                          A     9464  Thu May  1 11:12:10 2025
  log_19.log                          A     6606  Thu May  1 11:12:10 2025
  log_2.log                           A     7096  Thu May  1 11:12:08 2025
  log_20.log                          A    13457  Thu May  1 11:12:10 2025
  log_21.log                          A      702  Thu May  1 11:12:10 2025
  log_22.log                          A     3864  Thu May  1 11:12:10 2025
  log_23.log                          A      812  Thu May  1 11:12:10 2025
  log_24.log                          A    14697  Thu May  1 11:12:10 2025
  log_25.log                          A     5559  Thu May  1 11:12:10 2025
  log_26.log                          A     9947  Thu May  1 11:12:10 2025
  log_27.log                          A    11845  Thu May  1 11:12:11 2025
  log_28.log                          A    10188  Thu May  1 11:12:11 2025
  log_29.log                          A    11891  Thu May  1 11:12:11 2025
  log_3.log                           A     9914  Thu May  1 11:12:08 2025
  log_30.log                          A     8771  Thu May  1 11:12:11 2025
  log_31.log                          A    12123  Thu May  1 11:12:11 2025
  log_32.log                          A      640  Thu May  1 11:12:11 2025
  log_33.log                          A     9524  Thu May  1 11:12:11 2025
  log_34.log                          A    11952  Thu May  1 11:12:11 2025
  log_35.log                          A     5295  Thu May  1 11:12:11 2025
  log_36.log                          A    12255  Thu May  1 11:12:11 2025
  log_37.log                          A     7364  Thu May  1 11:12:11 2025
  log_38.log                          A     8843  Thu May  1 11:12:11 2025
  log_39.log                          A     3714  Thu May  1 11:12:11 2025
  log_4.log                           A     8669  Thu May  1 11:12:08 2025
  log_40.log                          A    13240  Thu May  1 11:12:12 2025
  log_41.log                          A     3168  Thu May  1 11:12:12 2025
  log_42.log                          A    14393  Thu May  1 11:12:12 2025
  log_43.log                          A    16192  Thu May  1 11:12:12 2025
  log_44.log                          A     4116  Thu May  1 11:12:12 2025
  log_45.log                          A    15261  Thu May  1 11:12:12 2025
  log_46.log                          A     1862  Thu May  1 11:12:12 2025
  log_47.log                          A    10545  Thu May  1 11:12:12 2025
  log_48.log                          A    10253  Thu May  1 11:12:12 2025
  log_49.log                          A    16605  Thu May  1 11:12:12 2025
  log_5.log                           A    14855  Thu May  1 11:12:08 2025
  log_50.log                          A     1559  Thu May  1 11:12:12 2025
  log_51.log                          A     8531  Thu May  1 11:12:12 2025
  log_52.log                          A    15238  Thu May  1 11:12:13 2025
  log_53.log                          A    13961  Thu May  1 11:12:13 2025
  log_54.log                          A     7125  Thu May  1 11:12:13 2025
  log_55.log                          A      856  Thu May  1 11:12:13 2025
  log_56.log                          A     7497  Thu May  1 11:12:13 2025
  log_57.log                          A     1555  Thu May  1 11:12:13 2025
  log_58.log                          A    14349  Thu May  1 11:12:13 2025
  log_59.log                          A    15684  Thu May  1 11:12:13 2025
  log_6.log                           A    10627  Thu May  1 11:12:09 2025
  log_60.log                          A     4657  Thu May  1 11:12:13 2025
  log_61.log                          A     8101  Thu May  1 11:12:13 2025
  log_62.log                          A     6993  Thu May  1 11:12:13 2025
  log_63.log                          A     8602  Thu May  1 11:12:13 2025
  log_64.log                          A     1569  Thu May  1 11:12:13 2025
  log_65.log                          A     9573  Thu May  1 11:12:14 2025
  log_66.log                          A     2871  Thu May  1 11:12:14 2025
  log_67.log                          A     1098  Thu May  1 11:12:14 2025
  log_68.log                          A      792  Thu May  1 11:12:14 2025
  log_69.log                          A     5527  Thu May  1 11:12:14 2025
  log_7.log                           A     6802  Thu May  1 11:12:09 2025
  log_70.log                          A    10550  Thu May  1 11:12:14 2025
  log_71.log                          A      987  Thu May  1 11:12:14 2025
  log_72.log                          A    10350  Thu May  1 11:12:14 2025
  log_73.log                          A     7851  Thu May  1 11:12:14 2025
  log_74.log                          A    13807  Thu May  1 11:12:14 2025
  log_75.log                          A     3243  Thu May  1 11:12:14 2025
  log_76.log                          A     9775  Thu May  1 11:12:14 2025
  log_77.log                          A    10004  Thu May  1 11:12:14 2025
  log_78.log                          A     4834  Thu May  1 11:12:14 2025
  log_79.log                          A     7332  Thu May  1 11:12:14 2025
  log_8.log                           A    15053  Thu May  1 11:12:09 2025
  log_80.log                          A     5894  Thu May  1 11:12:15 2025
  log_81.log                          A    10722  Thu May  1 11:12:15 2025
  log_82.log                          A     8131  Thu May  1 11:12:15 2025
  log_83.log                          A    12710  Thu May  1 11:12:15 2025
  log_84.log                          A     7673  Thu May  1 11:12:15 2025
  log_85.log                          A     2192  Thu May  1 11:12:15 2025
  log_86.log                          A    14102  Thu May  1 11:12:15 2025
  log_87.log                          A      968  Thu May  1 11:12:15 2025
  log_88.log                          A    13577  Thu May  1 11:12:15 2025
  log_89.log                          A     4693  Thu May  1 11:12:15 2025
  log_9.log                           A    14868  Thu May  1 11:12:09 2025
  log_90.log                          A     7827  Thu May  1 11:12:15 2025
  log_91.log                          A    12454  Thu May  1 11:12:16 2025
  log_92.log                          A     4353  Thu May  1 11:12:16 2025
  log_93.log                          A     7096  Thu May  1 11:12:16 2025
  log_94.log                          A    14754  Thu May  1 11:12:16 2025
  log_95.log                          A     6209  Thu May  1 11:12:16 2025
  log_96.log                          A    12733  Thu May  1 11:12:16 2025
  log_97.log                          A     3485  Thu May  1 11:12:16 2025
  log_98.log                          A    16778  Thu May  1 11:12:17 2025
  log_99.log                          A    16078  Thu May  1 11:12:17 2025
  nishang-master                      D        0  Thu May  1 11:08:32 2025
  patchlog.txt                        A      160  Thu May  1 11:12:08 2025
  PowerSploit-master                  D        0  Thu May  1 11:08:49 2025
  PSAppDeployToolkit-main             D        0  Thu May  1 11:09:14 2025
  readme.txt                          A      147  Thu May  1 11:12:08 2025
  split_tunnel.txt                    A      224  Thu May  1 12:26:39 2025
  SysinternalsSuite                   D        0  Thu May  1 10:51:44 2025
  sysmon-modular-master               D        0  Thu May  1 11:09:39 2025
  tools_list.csv                      A      111  Thu May  1 11:12:08 2025

		5056511 blocks of size 4096. 1243312 blocks available
smb: \Tools\> get split_tunnel.txt 
getting file \Tools\split_tunnel.txt of size 224 as split_tunnel.txt (0.4 KiloBytes/sec) (average 0.3 KiloBytes/sec)
```

Downloading that particular file because the size of the file is very small compared to others.

#### Reading the contents of the file

```bash
$ cat split_tunnel.txt 
Old settings for legacy VPN deployment:
- Use split tunneling where possible
- DNS resolution priority = local > remote

# Auth backup password: INLANEFREIGHT\jbader:ILovePower333###

- Ports used: 443, 8443, 1194
```

We got credentials of the a user and their password. We will use this credentials to login to the HR share's Confidential directory which was previously inaccessible.



- As this user, search through the additional shares they have access to and identify the password of a domain administrator. What is it?
	- **Str0ng_Adm1nistrat0r_P@ssword_2025!**


#### Connecting to HR share

```bash
$ smbclient //10.129.61.248/HR -U jbader
Password for [WORKGROUP\jbader]:
Try "help" to get a list of possible commands.
smb: \> ls
  .                                   D        0  Thu May  1 12:34:41 2025
  ..                                  D        0  Thu May  1 12:34:41 2025
  Confidential                        D        0  Thu May  1 11:23:18 2025
  Public                              D        0  Thu May  1 11:23:19 2025

		5056511 blocks of size 4096. 1244089 blocks available
smb: \> cd Confidential\
smb: \Confidential\> ls
  .                                   D        0  Thu May  1 11:23:18 2025
  ..                                  D        0  Thu May  1 11:23:18 2025
  Benefits_Overview_109.rtf           A     4986  Thu May  1 11:23:18 2025
  Benefits_Overview_114.rtf           A     5532  Thu May  1 11:23:18 2025
  Benefits_Overview_263.docx          A     3504  Thu May  1 11:23:17 2025
  Benefits_Overview_356.pdf           A     2022  Thu May  1 11:23:17 2025
  Benefits_Overview_505.rtf           A     6702  Thu May  1 11:23:18 2025
  Benefits_Overview_718.rtf           A     1710  Thu May  1 11:23:17 2025
  Benefits_Overview_722.docx          A     1320  Thu May  1 11:23:17 2025
  Benefits_Overview_868.txt           A     7874  Thu May  1 11:23:18 2025
  FAQ_114.txt                         A     4026  Thu May  1 11:23:18 2025
  FAQ_287.txt                         A     2362  Thu May  1 11:23:18 2025
  FAQ_337.docx                        A     2426  Thu May  1 11:23:18 2025
  FAQ_340.txt                         A     6074  Thu May  1 11:23:17 2025
  FAQ_394.txt                         A     7240  Thu May  1 11:23:18 2025
  FAQ_408.docx                        A     5242  Thu May  1 11:23:17 2025
  FAQ_420.rtf                         A     4538  Thu May  1 11:23:17 2025
  FAQ_453.rtf                         A     2490  Thu May  1 11:23:18 2025
  FAQ_675.docx                        A     4538  Thu May  1 11:23:17 2025
  FAQ_994.txt                         A     2938  Thu May  1 11:23:18 2025
  Holiday_Schedule_185.rtf            A     2612  Thu May  1 11:23:18 2025
  Holiday_Schedule_324.txt            A     5923  Thu May  1 11:23:17 2025
  Holiday_Schedule_399.rtf            A     6539  Thu May  1 11:23:17 2025
  Holiday_Schedule_427.txt            A     6231  Thu May  1 11:23:17 2025
  Holiday_Schedule_438.rtf            A     8085  Thu May  1 11:23:17 2025
  Holiday_Schedule_525.docx           A     3536  Thu May  1 11:23:18 2025
  Holiday_Schedule_593.txt            A     8787  Thu May  1 11:23:18 2025
  Holiday_Schedule_601.txt            A     8943  Thu May  1 11:23:18 2025
  Holiday_Schedule_836.pdf            A     4460  Thu May  1 11:23:18 2025
  Holiday_Schedule_911.txt            A     3151  Thu May  1 11:23:17 2025
  Holiday_Schedule_991.docx           A     4383  Thu May  1 11:23:18 2025
  HR_Guide_614.rtf                    A     4272  Thu May  1 11:23:17 2025
  HR_Guide_636.txt                    A     1926  Thu May  1 11:23:18 2025
  HR_Guide_643.rtf                    A     4548  Thu May  1 11:23:17 2025
  HR_Guide_652.rtf                    A     5100  Thu May  1 11:23:18 2025
  HR_Guide_677.txt                    A     4272  Thu May  1 11:23:17 2025
  HR_Guide_724.rtf                    A     4617  Thu May  1 11:23:18 2025
  HR_Guide_828.rtf                    A     6895  Thu May  1 11:23:18 2025
  HR_Guide_831.docx                   A     7245  Thu May  1 11:23:18 2025
  HR_Guide_895.txt                    A     7315  Thu May  1 11:23:18 2025
  HR_Guide_917.rtf                    A     6342  Thu May  1 11:23:18 2025
  Leave_Request_162.docx              A     8820  Thu May  1 11:23:18 2025
  Leave_Request_251.rtf               A     4730  Thu May  1 11:23:18 2025
  Leave_Request_591.pdf               A     1918  Thu May  1 11:23:17 2025
  Leave_Request_643.pdf               A     1548  Thu May  1 11:23:18 2025
  Leave_Request_776.docx              A     1252  Thu May  1 11:23:18 2025
  Leave_Request_787.rtf               A     6580  Thu May  1 11:23:18 2025
  Leave_Request_827.txt               A     1992  Thu May  1 11:23:17 2025
  Onboarding_Docs_132.txt             A     1167  Thu May  1 12:33:49 2025
  Onboarding_Docs_169.txt             A     8981  Thu May  1 11:23:17 2025
  Onboarding_Docs_180.txt             A     5770  Thu May  1 11:23:18 2025
  Onboarding_Docs_316.txt             A     2046  Thu May  1 11:23:17 2025
  Onboarding_Docs_430.docx            A     3566  Thu May  1 11:23:18 2025
  Onboarding_Docs_459.txt             A     7366  Thu May  1 11:23:18 2025
  Onboarding_Docs_461.pdf             A     1134  Thu May  1 11:23:18 2025
  Onboarding_Docs_506.rtf             A     7062  Thu May  1 11:23:17 2025
  Onboarding_Docs_787.pdf             A     4858  Thu May  1 11:23:18 2025
  Onboarding_Docs_914.txt             A     7214  Thu May  1 11:23:18 2025
  Onboarding_Docs_934.txt             A     9058  Thu May  1 11:23:17 2025
  Onboarding_Docs_950.docx            A     1742  Thu May  1 11:23:17 2025
  Performance_Form_152.docx           A     4306  Thu May  1 11:23:18 2025
  Performance_Form_273.txt            A     3536  Thu May  1 11:23:17 2025
  Performance_Form_433.txt            A     5076  Thu May  1 11:23:17 2025
  Performance_Form_474.txt            A     8865  Thu May  1 11:23:18 2025
  Performance_Form_545.docx           A     3536  Thu May  1 11:23:18 2025
  Performance_Form_636.txt            A     5692  Thu May  1 11:23:18 2025
  Performance_Form_791.rtf            A     3459  Thu May  1 11:23:17 2025
  Performance_Form_901.rtf            A     6847  Thu May  1 11:23:18 2025
  Policy_Summary_197.pdf              A     5544  Thu May  1 11:23:18 2025
  Policy_Summary_225.docx             A     5094  Thu May  1 11:23:18 2025
  Policy_Summary_312.txt              A     8787  Thu May  1 11:23:18 2025
  Policy_Summary_603.pdf              A     5619  Thu May  1 11:23:18 2025
  Policy_Summary_655.docx             A     6369  Thu May  1 11:23:17 2025
  Policy_Summary_696.txt              A     1944  Thu May  1 11:23:18 2025
  Policy_Summary_880.rtf              A     6369  Thu May  1 11:23:18 2025
  Policy_Summary_916.rtf              A     8331  Thu May  1 11:23:18 2025
  Policy_Summary_940.txt              A     4194  Thu May  1 11:23:18 2025
  Policy_Summary_968.docx             A     7344  Thu May  1 11:23:18 2025
  Policy_Summary_995.txt              A     3144  Thu May  1 11:23:17 2025
  Staff_Update_125.txt                A     5104  Thu May  1 11:23:18 2025
  Staff_Update_136.docx               A     7002  Thu May  1 11:23:17 2025
  Staff_Update_140.docx               A     4082  Thu May  1 11:23:18 2025
  Staff_Update_182.pdf                A     6856  Thu May  1 11:23:17 2025
  Staff_Update_193.pdf                A     7075  Thu May  1 11:23:18 2025
  Staff_Update_245.pdf                A     7591  Thu May  1 11:23:17 2025
  Staff_Update_325.docx               A     8035  Thu May  1 11:23:17 2025
  Staff_Update_476.pdf                A     4301  Thu May  1 11:23:18 2025
  Staff_Update_523.docx               A     1454  Thu May  1 11:23:18 2025
  Staff_Update_542.rtf                A     4228  Thu May  1 11:23:17 2025
  Staff_Update_544.txt                A     2111  Thu May  1 11:23:18 2025
  Staff_Update_675.docx               A     8183  Thu May  1 11:23:18 2025
  Staff_Update_734.rtf                A     6783  Thu May  1 11:23:18 2025
  Staff_Update_832.rtf                A     5615  Thu May  1 11:23:18 2025
  Staff_Update_885.txt                A     8553  Thu May  1 11:23:17 2025
  Staff_Update_887.rtf                A     5250  Thu May  1 11:23:18 2025
  Training_Info_103.txt               A     4730  Thu May  1 11:23:18 2025
  Training_Info_144.docx              A     4064  Thu May  1 11:23:17 2025
  Training_Info_275.docx              A     4656  Thu May  1 11:23:17 2025
  Training_Info_308.docx              A     4656  Thu May  1 11:23:18 2025
  Training_Info_464.docx              A     4878  Thu May  1 11:23:18 2025
  Training_Info_544.docx              A     3620  Thu May  1 11:23:18 2025
  Training_Info_628.txt               A     5840  Thu May  1 11:23:17 2025

		5056511 blocks of size 4096. 1244073 blocks available
smb: \Confidential\> get Onboarding_Docs_132.txt
getting file \Confidential\Onboarding_Docs_132.txt of size 1167 as Onboarding_Docs_132.txt (2.1 KiloBytes/sec) (average 2.1 KiloBytes/sec)
```


#### Reading the contents of the file

```bash
$ cat Onboarding_Docs_132.txt 
========================================
Employee Onboarding Checklist
========================================

Name: Josh Bader  
Start Date: 2025-04-29  
Department: IT Infrastructure  
Manager: R. Lawson  
Title: Systems Engineer III  
Role Level: Tier-0 Admin  

Checklist:
[✔] AD Account Created  
[✔] Email Provisioned  
[✔] Assigned to Admin VPN Group  
[✔] Azure Admin Portal Access  
[✔] Exchange Online Admin  
[✔] Domain Admin Rights Applied  

Notes:
Jordan will be responsible for oversight of Active Directory replication, GPO management, and DC patching. Temporarily granted access to the domain administrator account for initial 90 days to complete infrastructure tasks related to the Chicago DC migration.

Account credentials
**Username:** `Administrator`  
**Password:** `Str0ng_Adm1nistrat0r_P@ssword_2025!`  

Note: Update account group membership after probationary period. Audit required every 30 days.

Action Items:
- Schedule orientation w/ Infosec (B. Chen)
- Issue YubiKey (Asset #YK-78218)
- Complete privileged access training (SecOps LMS)

-- Document Created by R.Lawson on 2025-04-28
```