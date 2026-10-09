# GoCoach - Oracle Cloud + CloudPanel Deployment Guide 🚀

මෙම මාර්ගෝපදේශය හරහා ඔබට ඔබගේ Laravel (Multi-tenant) ව්‍යාපෘතිය **100% ක් නොමිලේ** Oracle Cloud මත CloudPanel භාවිතා කරමින් Deploy කරගත හැක.

---

## පියවර 1: Oracle Cloud Account එකක් සැකසීම
1. [Oracle Cloud Free Tier](https://www.oracle.com/cloud/free/) වෙබ් අඩවියට පිවිසෙන්න.
2. **"Start for free"** බොත්තම ක්ලික් කර ඔබගේ විස්තර ලබා දී ගිණුමක් සාදන්න.
3. Credit/Debit කාඩ්පතක් ඇතුළත් කිරීමට සිදුවන අතර, එය ඔබගේ අනන්‍යතාවය තහවුරු කිරීමට පමණි. (Always Free සීමාව තුළ සිටින තාක් මුදල් අය නොකෙරේ).

---

## පියවර 2: Always Free Server එක (Compute Instance) නිර්මාණය කිරීම
1. Oracle Dashboard එකට ගොස් **"Create a VM instance"** තෝරන්න.
2. **Image and Shape:**
   * **Image:** Ubuntu 22.04 හෝ 24.04 තෝරන්න.
   * **Shape:** `Ampere` -> `VM.Standard.A1.Flex` තෝරන්න. (මෙය Always Free වේ).
   * OCPU ගණන **4** ක් සහ RAM ප්‍රමාණය **24GB** ලෙස සකසන්න. (මෙය නොමිලේ ලබාගත හැකි උපරිමයයි).
3. **Networking:**
   * "Create a new virtual cloud network" තෝරන්න.
   * "Assign a public IPv4 address" යන්න තෝරා ඇති බව තහවුරු කරගන්න.
4. **SSH Keys (ඉතා වැදගත්):**
   * **"Save private key"** සහ **"Save public key"** බොත්තම් ඔබා එම file දෙක පරිගණකයේ ආරක්ෂිත තැනක save කරගන්න. (පසුව Server එකට ලොග් වීමට මෙය අත්‍යවශ්‍ය වේ).
5. **Create** බොත්තම ඔබා Server එක හැදෙන තෙක් විනාඩි කිහිපයක් රැඳී සිටින්න. Public IP address එක කොපි කරගන්න.

---

## පියවර 3: Ports Open කිරීම (Firewall Settings)
වෙබ් අඩවිය අන්තර්ජාලයට පෙන්වීමට Port 80 (HTTP) සහ 443 (HTTPS) open කළ යුතුය.
1. Server විස්තර පිටුවේ ඇති **Subnet** ලින්ක් එක ක්ලික් කරන්න.
2. එහි ඇති **Security Lists** තෝරා Default Security List එකට යන්න.
3. **"Add Ingress Rules"** ක්ලික් කර පහත දත්ත ලබා දෙන්න:
   * Source CIDR: `0.0.0.0/0`
   * Destination Port Range: `80,443,8443`
4. **Add** ක්ලික් කරන්න.

---

## පියවර 4: CloudPanel Install කිරීම (Server Control Panel)
1. ඔබගේ පරිගණකයේ Command Prompt / Terminal විවෘත කර Server එකට ලොග් වන්න.
   ```bash
   ssh -i "path/to/private-key" ubuntu@<ඔබගේ_Server_IP_එක>
   ```
2. CloudPanel Install කිරීම සඳහා පහත කමාන්ඩ් 2 ලබා දෙන්න:
   ```bash
   sudo su
   curl -sS https://installer.cloudpanel.io/ce/v2/install.sh -o install.sh; \
   echo "3c30168958264ced81ca9b58dbc55b4d28585d9066b9da085f2b130bb91c1200 install.sh" | \
   sha256sum -c && sudo bash install.sh
   ```
3. Installation එක අවසන් වූ පසු, බ්‍රවුසරයේ `https://<ඔබගේ_Server_IP_එක>:8443` වෙත පිවිස CloudPanel Admin ගිණුම සාදාගන්න.

---

## පියවර 5: Domain එක සැකසීම සහ Wildcard DNS 
ඔබගේ පද්ධතිය Multi-tenant (විවිධ සමාජ සඳහා උප-වසම් / subdomains) භාවිතා කරන බැවින් Wildcard DNS සැකසිය යුතුය.
1. ඔබ Domain එක මිලදී ගත් ආයතනයේ (උදා: Namecheap, Hostinger) DNS Settings වෙත යන්න.
2. පහත Records 2ක Add කරන්න:
   * **Type:** A Record | **Name:** `@` | **Value:** `<ඔබගේ_Server_IP_එක>`
   * **Type:** A Record | **Name:** `*` | **Value:** `<ඔබගේ_Server_IP_එක>` *(මෙය Wildcard එකයි)*

---

## පියවර 6: Laravel ව්‍යාපෘතිය Deploy කිරීම
1. **CloudPanel** වෙත පිවිස **"Add Site"** -> **"Create a PHP Site"** තෝරන්න.
2. Domain Name එක ලෙස ඔබගේ ප්‍රධාන Domain එක ලබා දී, **PHP Version එක 8.4** ලෙස තෝරා Site එක සාදන්න.
3. Site Dashboard එකේ **"Databases"** වෙත ගොස් අලුත් MySQL Database එකක් සහ User කෙනෙක් සාදාගන්න.
4. **"SSH/FTP"** වෙත ගොස් අලුත් SSH User කෙනෙක් සාදාගන්න.
5. Command Prompt එකෙන් එම අලුත් User හරහා Server එකට ලොග් වන්න:
   ```bash
   ssh අලුත්_user@<ඔබගේ_Server_IP_එක>
   cd htdocs/ඔබගේ_domain_එක/
   ```
6. ව්‍යාපෘතිය GitHub එකෙන් Clone කරගන්න:
   ```bash
   git clone https://github.com/tmgomas/gocoach.git temp
   mv temp/* temp/.* . 
   rm -rf temp
   ```
7. `.env` file එක සකසන්න:
   ```bash
   cp .env.example .env
   nano .env
   ```
   *(මෙහිදී Database නම, Username, Password සහ `APP_URL` යාවත්කාලීන කරන්න).*
8. Packages Install කර Build කරන්න:
   ```bash
   composer install --optimize-autoloader --no-dev
   php artisan key:generate
   php artisan migrate --force
   php artisan storage:link
   
   # Frontend Build (Vite)
   npm install
   npm run build
   ```

---

## පියවර 7: Multi-Tenancy Wildcard SSL සැකසීම
1. CloudPanel හි ඔබගේ Site Settings වල **"SSL/TLS"** වෙත යන්න.
2. **"Let's Encrypt"** තෝරා එහි ඔබගේ ප්‍රධාන Domain එක සහ `*.ඔබගේ_domain_එක` ලබා දී Create ක්ලික් කරන්න. 
*(දැන් ඕනෑම Subdomain එකකට නොමිලේම SSL ක්‍රියාත්මක වේ).*

**සුභ පැතුම්! ඔබ දැන් GoCoach පද්ධතිය සාර්ථකව Live කර අවසන්! 🎉**
