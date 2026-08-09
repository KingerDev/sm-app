# Deploy S+M App

> **Cieľová zostava: Netcup VPS + Cloudflare R2.**
> Médiá idú na R2 (egress zadarmo — podstatné pre videá), aplikácia beží na VPS.
> Postup nižšie je pôvodný, pre zdieľaný hosting; rozdiely pre novú zostavu sú
> v sekcii [Netcup + Cloudflare R2](#netcup--cloudflare-r2) na konci.

---

## Pôvodný postup (Hostinger / zdieľaný hosting)

## Pred nasadením (lokálne)

1. **Zmeň heslá účtov** — seedy vytvárajú `s@sm.app` a `m@sm.app` s heslom `smapp123`.
   Buď uprav `database/seeders/UserSeeder.php` pred nasadením, alebo po nasadení na serveri:
   ```
   php artisan tinker
   >>> App\Models\User::where('email','m@sm.app')->first()->update(['password' => 'NOVÉ-HESLO']);
   >>> App\Models\User::where('email','s@sm.app')->first()->update(['password' => 'NOVÉ-HESLO']);
   ```
2. **Demo dáta** — štandardný `php artisan db:seed` robí čistý štart (len účty
   a settings: „spolu od" 1. 12. 2024, maskot). Fiktívne demo dáta z prototypu sa
   dajú kedykoľvek doplniť cez `php artisan db:seed --class=DemoSeeder`.
3. **Build assetov**: `npm ci && npm run build` — nahráva sa hotový `public/build`,
   na serveri nie je potrebný Node.

## Nahratie na server

Nahraj celý projekt (bez `node_modules`) napr. do `~/domains/tvoja-domena.sk/`,
pričom **document root domény musí smerovať na priečinok `public/`**
(hPanel → Websites → nastavenie domény). Nikdy nedávaj celý Laravel do `public_html`.

## Na serveri

```
composer install --no-dev --optimize-autoloader
cp .env.production.example .env      # a doplň DB údaje + APP_URL
php artisan key:generate
php artisan migrate --force
php artisan db:seed --force        # čistý štart: users + settings
php artisan storage:link
php artisan config:cache && php artisan route:cache && php artisan view:cache
```

## Skontroluj

- `APP_URL` = presná https doména — inak nebude fungovať prihlásenie (Sanctum
  session cookies) ani URL nahratých fotiek.
- PHP >= 8.3, rozšírenia: pdo_mysql, **gd s podporou WebP** (fotky sa pri uploade
  automaticky komprimujú na WebP — over cez `php -r "var_dump(function_exists('imagewebp'));"`),
  exif, fileinfo.
- **Upload limity PHP** (hPanel → PHP konfigurácia): appka povoľuje fotky do 40 MB
  a audio do 20 MB → nastav `upload_max_filesize=48M`, `post_max_size=96M`
  a `memory_limit=512M` (spracovanie veľkých fotiek). Na disk sa ukladajú už
  skomprimované WebP (~1 MB), takže veľké limity miesto nezaberajú.
- HTTPS zapnuté (Hostinger dáva Let's Encrypt zadarmo) — `SESSION_SECURE_COOKIE=true`.
- Geokódovanie nových krajín volá `nominatim.openstreetmap.org` zo servera —
  na zdieľanom hostingu zvyčajne OK.

## Po nasadení

1. Otvor doménu, prihlás sa, over: pridanie momentu + fotky, bucket, kapsula, kalendár, mapa.
2. Zmaž demo dáta / uprav settings podľa potreby (Štats → menu → maskot; dátum
   „spolu od" je v tabuľke settings, kľúč `together_since`).

## Tipy

- Projekt zatiaľ nie je vo verzii (git) — odporúčam `git init` + súkromný repozitár,
  nech má deploy históriu a dá sa vrátiť späť.
- Zálohuj `storage/app/public` (nahraté fotky/audio) a databázu.

---

# Netcup + Cloudflare R2

## 1. Cloudflare R2

1. Vytvor bucket (napr. `sm-app-media`).
2. **Sprístupni ho na čítanie** — buď zapni `r2.dev` doménu, alebo napoj vlastnú
   (napr. `media.tvoja-domena.sk`). Appka sťahuje fotky priamo z tejto adresy,
   takže bez nej sa nezobrazia.
3. Vytvor API token (Object Read & Write) a poznač si `Access Key ID` + `Secret`.

V `.env` na serveri:

```
MEDIA_DISK=s3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_DEFAULT_REGION=auto
AWS_BUCKET=sm-app-media
AWS_ENDPOINT=https://<ucet>.r2.cloudflarestorage.com
AWS_URL=https://media.tvoja-domena.sk     # verejná adresa, odtiaľ appka číta
AWS_USE_PATH_STYLE_ENDPOINT=true
```

`MEDIA_DISK` je zámerne oddelený od `FILESYSTEM_DISK` — médiá sa dajú presunúť
inam nezávisle od zvyšku aplikácie.

## 2. Prenos existujúcich médií

Súbory sa dajú stiahnuť priamo z bežiacej starej stránky, netreba na ňu SSH:

```
php artisan media:sync s3 --from-url=https://stara-domena.sk --dry-run
php artisan media:sync s3 --from-url=https://stara-domena.sk
```

Ak už súbory máš lokálne, použi `--from-disk=public`. Príkaz preskočí to, čo je
na cieli, takže sa dá bezpečne spustiť znova po výpadku.

## 3. VPS

```
apt install php8.3-{fpm,mysql,gd,exif,mbstring,xml,curl,zip} mariadb-server nginx
composer install --no-dev --optimize-autoloader
php artisan key:generate && php artisan migrate --force
php artisan config:cache && php artisan route:cache
```

- **`storage:link` už netreba**, keď médiá idú na R2.
- Certifikát: Caddy alebo certbot (Let's Encrypt zadarmo).
- Zálohu databázy rieš cronom (`mysqldump`); médiá sú v R2, tie zálohovať netreba.
- Firewall: pusti len 22, 80 a 443.

## 4. Mobilná aplikácia

Adresa API je v `sm_app/.env`:

```
EXPO_PUBLIC_API_URL=https://api.kinger.dev
```

Je to jediné miesto, kde sa nastavuje — `src/config.ts` ju odtiaľ číta a zvyšok
kódu ide cez `API_BASE`. Prázdna hodnota = lokálny vývoj (adresa sa odvodí
z Expo packageru).

Pozor: `EXPO_PUBLIC_*` premenné sa vkladajú do bundlu **pri builde**, takže po
zmene treba appku znova zbuildovať, nestačí reload.

## 5. Overenie

- `POST /api/v1/auth/token` vracia token (natívna appka bez neho nefunguje).
- Fotka nahratá cez appku sa objaví v R2 buckete a načíta sa v galérii.
- Video: nahranie, náhľad v mriežke, prehratie v lightboxe.
