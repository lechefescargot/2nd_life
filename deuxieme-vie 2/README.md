# Deuxième Vie

Site de petites annonces pour **vendre ou donner** meubles et objets (fauteuils, lits, matelas…).

- Mode invité : parcourir, chercher, filtrer par catégorie / commune / gratuit
- Comptes (email + mot de passe) avec rôle **Vendeur/Offrant**, **Acheteur** ou **les deux**
- Publication avec jusqu'à 4 photos, prix ou don, état, position (commune, quartier, repère)
- Compteur de vues uniques (icône œil), statut **Disponible / Réservé / Parti** avec date de confirmation
- Bouton Appeler / WhatsApp, bouton « Je suis intéressé » (le vendeur voit qui est intéressé)
- Session **admin** : statistiques, masquer / supprimer n'importe quelle annonce, nommer d'autres admins

**Technique :** HTML + CSS + JavaScript, sans étape de build. Hébergé sur **Vercel**, avec **Supabase** comme backend (authentification, base PostgreSQL, stockage des photos). Les deux ont une offre gratuite.

```
deuxieme-vie/
├── index.html          page principale
├── styles.css          design (thème clair + sombre)
├── app.js              logique du site
├── config.js           ← vos clés Supabase
├── vercel.json         réglages Vercel
└── supabase/schema.sql tables, sécurité et stockage
```

---

## 1. Créer le backend Supabase (10 min)

1. Créez un compte sur <https://supabase.com> puis **New project**. Choisissez la région la plus proche (par ex. *West EU – Paris* ou *London*) et notez le mot de passe de la base.
2. Dans le projet, ouvrez **SQL Editor → New query**. Collez tout le contenu de `supabase/schema.sql` puis cliquez **Run**. Le message doit être *Success. No rows returned*.
3. Ouvrez **Project Settings → API**. Copiez :
   - **Project URL** (`https://xxxx.supabase.co`)
   - la clé **anon public**
4. Collez-les dans `config.js`.

> La clé *anon* peut être publique : ce sont les règles de sécurité (RLS) du script SQL qui protègent les données. Ne mettez **jamais** la clé `service_role` dans le code.

## 2. Mettre le code sur GitHub

```bash
cd deuxieme-vie
git init
git add .
git commit -m "Deuxième Vie : première version"
git branch -M main
git remote add origin https://github.com/VOTRE-COMPTE/deuxieme-vie.git
git push -u origin main
```

(Créez d'abord le dépôt vide `deuxieme-vie` sur github.com → **New repository**.)

## 3. Déployer sur Vercel

1. Sur <https://vercel.com>, cliquez **Add New… → Project** et importez le dépôt `deuxieme-vie`.
2. **Framework Preset : Other**. Laissez *Build Command* et *Output Directory* vides.
3. Cliquez **Deploy**. Vous obtenez une adresse comme `https://deuxieme-vie.vercel.app`.

Chaque `git push` sur `main` redéploie automatiquement le site.

## 4. Relier l'adresse du site à Supabase

Dans Supabase → **Authentication → URL Configuration** :

- **Site URL** : `https://deuxieme-vie.vercel.app` (votre adresse Vercel)
- **Redirect URLs** : ajoutez la même adresse, et `http://localhost:3000` pour tester en local

Cela permet aux liens de confirmation d'email et de mot de passe oublié de revenir sur votre site.

**Pour aller plus vite au début**, vous pouvez désactiver la confirmation d'email : *Authentication → Sign In / Providers → Email → Confirm email : off*. Les gens seront connectés tout de suite après l'inscription.

> L'envoi d'emails intégré de Supabase est limité (quelques emails par heure). Pour un vrai lancement, branchez un service SMTP (Resend, Brevo…) dans *Authentication → SMTP Settings*.

## 5. Devenir administrateur

1. Créez votre compte sur le site et complétez votre profil.
2. Dans Supabase → **SQL Editor**, exécutez (avec votre email) :

```sql
update public.profiles set is_admin = true
where id = (select id from auth.users where email = 'votre@email.com');
```

3. Rechargez le site : l'onglet **Administration** apparaît. Vous pourrez ensuite nommer d'autres admins depuis la liste des membres.

## Tester en local

Il faut un petit serveur, car `app.js` est un module JavaScript (ouvrir `index.html` en double-clic ne marche pas) :

```bash
npx serve -l 3000 .
# ou : python3 -m http.server 3000
```

Puis ouvrez <http://localhost:3000>.

## Qui peut faire quoi (sécurité)

| Action | Invité | Membre | Vendeur | Admin |
|---|:-:|:-:|:-:|:-:|
| Voir les annonces et les photos | ✓ | ✓ | ✓ | ✓ |
| Voir le numéro du vendeur | | ✓ | ✓ | ✓ |
| Signaler son intérêt | | ✓ | ✓ | ✓ |
| Publier / modifier **ses** annonces | | | ✓ | ✓ |
| Voir qui s'intéresse à **ses** annonces | | | ✓ | ✓ |
| Masquer / supprimer **toute** annonce | | | | ✓ |
| Nommer un admin | | | | ✓ |

Ces règles sont appliquées **dans la base de données** (Row Level Security) : même quelqu'un qui modifie le JavaScript ne peut pas les contourner. Les compteurs de vues et d'intérêts ne peuvent pas être modifiés à la main.

## Personnaliser

- **Communes / catégories / états** : en haut de `app.js` (`COMMUNES`, `CATS`, `CONDITIONS`)
- **Couleurs** : variables en haut de `styles.css` (`--teal`, `--mango`, `--hibiscus`…)
- **Nom de domaine** : Vercel → Project → Settings → Domains (pensez à mettre à jour l'URL dans Supabase)

## Limites de cette version

- Le site charge les 500 annonces les plus récentes et filtre côté navigateur. C'est largement suffisant au début ; au-delà, il faudra paginer.
- Pas de messagerie interne : le contact se fait par téléphone ou WhatsApp, comme prévu.
