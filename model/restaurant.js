import { connectionPromise } from '../connexion.js';
//la fonction qui va afficher les produits sur le premier page
export async function getProduits() {
    let connection= await connectionPromise;

    let produits= await connection.all(
        `SELECT * FROM produit;`
    )
    
    return produits;
}
//fonction qui cherche s'il y a une commande dans panier et qu'il a cree s'il n'y a pas
async function chercherCommande(id_utilisateur){
    let connection = await connectionPromise;

    let commandeDansPanier = await connection.get(
        `SELECT * FROM commande WHERE id_etat_commande = 1 AND id_utilisateur = ?;`,
        [id_utilisateur]
    );
    if(commandeDansPanier){
        //S'il y a une commande dans panier, on retourne id_commande
        
        return commandeDansPanier.id_commande;
    }else{
        //sinon je cree une commande dans panier et je retourne son id_commande
        let commandeDansPanier = await connection.run(`
        INSERT INTO commande (id_utilisateur, id_etat_commande, date) 
        VALUES 
        (?, (SELECT id_etat_commande FROM etat_commande WHERE nom = 'panier'), CURRENT_TIMESTAMP)
        `,[id_utilisateur]
        );
    
        return commandeDansPanier.lastID; 
    }
}

//ajouter les elements dans panier
export async function addPanier(produitId){
    let connection = await connectionPromise;
    //J'appelle une fonction qui chercher s'il y a une commande dans panier et sinon cree une et retourne l'id_commande;
    let id_commande = await chercherCommande(1);
    // Vérifier si le produit est déjà dans le panier
    let produitExiste = await connection.get(`
    SELECT * FROM commande_produit WHERE id_produit = ? AND id_commande = ?;
    `, [produitId, id_commande]);

    if (produitExiste) {
    // Si le produit existe déjà dans le panier, incrémentez la quantité
    let NouvelleQuantite = produitExiste.quantite + 1;
    await connection.run(`
        UPDATE commande_produit SET quantite = ? WHERE id_produit = ? AND id_commande = ?;
    `, [NouvelleQuantite, produitId, id_commande]);
    } else {
    // Si le produit n'existe pas dans le panier, insérez une nouvelle ligne
    await connection.run(`
        INSERT INTO commande_produit (id_commande, quantite, id_produit) 
        VALUES (?, 1, ?);
    `, [id_commande, produitId]);
    }
}

//afficher le panier 
export async function getPanier() {
    let connection = await connectionPromise;

    let panier = await connection.all(`
    SELECT cp.quantite, p.prix, p.nom, p.id_produit
    FROM commande_produit cp
    JOIN produit p ON cp.id_produit = p.id_produit
    JOIN commande c ON cp.id_commande = c.id_commande
    JOIN utilisateur u ON c.id_utilisateur = u.id_utilisateur
    JOIN etat_commande ec ON c.id_etat_commande = ec.id_etat_commande
    WHERE ec.nom = 'panier';
`);
    return panier;

}

//pour supprimer un produit dans le panier 
export async function supprimerProduitPanier(produitId){
    let connection = await connectionPromise;
    let id_commande = await chercherCommande(1);
    await connection.run(
        ` DELETE FROM commande_produit WHERE id_produit = ? AND id_commande = ?;`,
        [produitId, id_commande]
    );

}
//pour envoyer une commande
export async function envoyerCommande(id_utilisateur){
    let connection = await connectionPromise;
    let id_commande = await chercherCommande(1);
     // Vérifiez si l'utilisateur a des produits dans le panier
    const panierNonVide = await connection.get(
        `SELECT * FROM commande_produit WHERE id_commande = ?`,
        [id_commande]
    );

    if (panierNonVide) {
        // Mettez à jour l'état de la commande (par exemple, de "panier" à "cuisine")
        await connection.run(
            `UPDATE commande SET id_etat_commande = (SELECT id_etat_commande FROM etat_commande WHERE nom = 'cuisine') WHERE id_utilisateur = ?
            AND id_commande = ?`,
            [id_utilisateur, id_commande]
        );

        console.log('Commande envoyée avec succès.');
    } else {    
        console.log("Le panier est vide. Impossible d'envoyer la commande.");
    };
    
}
//pour avoir les commandes
export async function getCommande(){
    let connection = await connectionPromise;

    let commmandesExiste = connection.all(
        `SELECT * FROM commande WHERE id_etat_commande = (SELECT id_etat_commande FROM etat_commande WHERE nom = 'cuisine') `
    )
    if(commmandesExiste){
        let commandes = connection.all(
        `SELECT 
            c.id_utilisateur,
            p.nom,
            cp.quantite,
            c.id_commande,
            c.date,
            ec.nom AS etat_du_commande
        FROM 
            commande_produit cp
        JOIN 
            produit p ON cp.id_produit = p.id_produit
        JOIN 
            commande c ON cp.id_commande = c.id_commande
        JOIN 
            etat_commande ec ON c.id_etat_commande = ec.id_etat_commande;`
    );
    return commandes;
    }else{
        console.log("Il n'y a pas de commande.")
    }
    
}

