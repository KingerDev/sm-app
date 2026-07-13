# Deploy S+M App (Hostinger / zdieľaný hosting)

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
