// supprimer un produit du panier du serveur

async function supprimerProduitPanier(event) {
    // Préparation des données pour les envoyer au serveur
    let data = {
        produitId: parseInt(event.currentTarget.dataset.id)
    }

    // Envoyer la requête au serveur
    let response = await fetch('/api/panier', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    // Analyse de la réponse du serveur
    if(response.ok) {
        location.reload();
        
    }
}

//ajouter dans panier au serveur
async function ajouterCommandeServer(event) {
    // Préparation des données pour les envoyer au serveur
    let data = {
        id_utilisateur: parseInt(event.currentTarget.dataset.id)
    }

    // Envoyer la requête au serveur
    let response = await fetch('/api/commande', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    // Analyse de la réponse du serveur
    if(response.ok) {
        let panier = document.querySelector('.main');
        panier.innerHTML = "";  
    }
}
//pour effacer un produit dans le panier
let boutonEffacerProduit = document.querySelectorAll('.boutonEffacerProduit');
for(let bouton of boutonEffacerProduit) {
    bouton.addEventListener('click', supprimerProduitPanier);
}

let boutonCommander = document.querySelector('.boutonCommander');
boutonCommander.addEventListener('click', ajouterCommandeServer);

//ne pas afficher le bouton commander si le panier est vide
let panier = document.querySelectorAll('.panier > div');
if(panier.length<=0){
    boutonCommander.style.display = 'none';
}