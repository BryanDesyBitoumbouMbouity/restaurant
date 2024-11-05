// Aller chercher les configurations de l'application
import 'dotenv/config';

// Importer les fichiers et librairies
import express, { json } from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import cspOption from './csp-options.js'
import { engine } from 'express-handlebars'
import { getPanier, getProduits,addPanier, supprimerProduitPanier, envoyerCommande, getCommande } from './model/restaurant.js'
import { idproduivalid } from './validation.js'

// Création du serveur
const app = express();

// Configuration de l'engin de rendu
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

// Ajout de middlewares
app.use(helmet(cspOption));
app.use(compression());
app.use(cors());
app.use(json());
app.use(express.static('public'));

// Ajouter les routes ici ...
//route pour page d'acceuil avec handlebars
app.get('/', async (request, response)=>{
    response.render('index',{
        titre: "page d'accceuil",
        styles: ['/css/style.css'],
        scripts: ['/js/main.js'],
        produits: await getProduits(),
    });
})
//route pour la page panier avec handlebars
app.get('/panier', async (request, response)=>{
    response.render('panier',{
        titre: "panier",
        styles: ['/css/panier.css'],
        scripts: ['/js/panier.js'],
        panier: await getPanier(),
    });
})
//route pour la page des commandes avec handlebars
app.get('/commandes', async (request, response)=>{
    response.render('commandes',{
        titre: "panier",
        styles: ['/css/commandes.css'],
        scripts: ['/js/commande.js'],
        commandes: await getCommande(),
    });
})
//route pour ajouter les produits au panier
app.post('/api/panier', async (request, response) => {

    if(idproduivalid(request.body.produitId)){
        await addPanier(request.body.produitId);
        let panier = await getPanier();
    // Répondez avec le panier mis à jour
    response.status(200).json(panier);
    }
    else{
        response.status(400).end();
    }
    
   
});
//route pour supprimer un produit dans le panier
app.delete('/api/panier', async (request, response) => {
    if(idproduivalid(request.body.produitId)){
        await supprimerProduitPanier(request.body.produitId);
        response.status(200).end();
    }
    else{
        response.status(400).end();
    }
   
});
//route pour envoyer la commande
app.post('/api/commande', async (request, response) => {
    if(idproduivalid(request.body.id_utilisateur)){
        await envoyerCommande(request.body.id_utilisateur);
        response.status(200).end();
    }
    else{
        response.status(400).end();
    }

   
});
// Renvoyer une erreur 404 pour les routes non définies
app.use(function (request, response) {
    // Renvoyer simplement une chaîne de caractère indiquant que la page n'existe pas
    response.status(404).send(request.originalUrl + ' not found.');
});

// Démarrage du serveur
app.listen(process.env.PORT);
console.info(`Serveurs démarré:`);
console.info(`http://localhost:${ process.env.PORT }`);
