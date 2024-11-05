//ajouter dans panier au serveur
async function ajouterPanierServer(event) {
    // Préparation des données pour les envoyer au serveur
    let data = {
        produitId: parseInt(event.currentTarget.dataset.id)
    }

    // Envoyer la requête au serveur
    let response = await fetch('/api/panier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    // Analyse de la réponse du serveur
    if(response.ok) {       
      
    }
}
//pour ajouter les elements dans le panier
let boutonAjouterAuPanier = document.querySelectorAll('.boutonAjouterAuPanier');
for(let bouton of boutonAjouterAuPanier) {
    bouton.addEventListener('click', ajouterPanierServer);
}



