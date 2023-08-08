import { Fournisseur, Transaction } from "./types.js";
import { isTel, isNumCompte } from "./validator.js";
import { nomComplet, port, fournisseurSelect, numeroDes, nomCompletDes, notification, transactionSelect, montant, clientTelephone, clientname, submitClient, fournisseurSelect2, numeroAjoutCompte, submitCompte, listCompte, colfour, rechercherCompte, modal, afficheFournisseur, afficheName, afficheSolde, afficheTelephone, close, block, deblock, deleteCompte, afficheStatut, historique, modalHistorique, closeHistorique, expediteurNumero, tbody, submitTransaction, error, codeT, expediteurNom } from "./dom.js";
import { chargerSelect, fetchData, createCompteItem, createHistorique, message, viderChamps } from "./functions.js";
const fournisseurs = Object.values(Fournisseur);
fournisseurs.push("WR");
console.log(fournisseurSelect2);
let id_expediteur = null;
let id_destinataire = null;
let mont = null;
let typ = null;
let nomComplete = null;
let telephone = null;
chargerSelect(fournisseurSelect, fournisseurs);
chargerSelect(fournisseurSelect2, fournisseurs);
chargerSelect(transactionSelect, Object.values(Transaction));
// numero.addEventListener("change", ()=>{
//  if( !(isNumCompte(numero.value) || isTel(numero.value))){
//     alert("Numero de compte ou telphone invalide");
//     return;
//  }
// nomComplet.value = "";
//     fetch(port+"/clients/"+numero.value)
//     .then(response => response.json())
//     .then(dataResponse => {
//         if(dataResponse.data)
//         {
//             nomComplet.value = dataResponse.data.nomComplet
//         }
//         else 
//         {
//             console.log(dataResponse);  
//             alert(dataResponse.message); 
//         }
//     })
// })
submitClient.addEventListener("click", async () => {
    try {
        const responses = await fetchData("http://127.0.0.1:8000/api/client", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ nomComplet: clientname.value, telephone: clientTelephone.value })
        });
        message("Client enregistrée avec succes ", notification);
        console.log(responses);
    }
    catch (error) {
        console.error("Erreur:", error);
    }
});
submitCompte.addEventListener("click", async () => {
    try {
        const responses = await fetchData("http://127.0.0.1:8000/api/compte", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ fournisseur: fournisseurSelect.value, telephone: numeroAjoutCompte.value })
        });
        message("Compte enregistrée avec succes ", notification);
    }
    catch (error) {
        console.error("Erreur:", error);
    }
});
async function getCompte() {
    try {
        const response = await fetchData("http://127.0.0.1:8000/api/compte", {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        });
        return response;
    }
    catch (error) {
        console.error("Erreur:", error);
    }
}
function showCompte(compte, modal) {
    modal.style.display = "flex";
    afficheSolde.innerText = compte.solde;
    afficheFournisseur.innerText = compte.fournisseur;
    afficheName.innerHTML = compte.client.nomComplet;
    afficheTelephone.innerText = compte.client.telephone;
    afficheStatut.innerText = compte.statut;
    if (compte.statut == "Bloqué") {
        block.disabled = true;
    }
    else if (compte.statut == "Debloqué") {
        deblock.disabled = true;
    }
    else if (compte.statut == "Fermé") {
        block.disabled = true;
        deblock.disabled = true;
        deleteCompte.disabled = true;
    }
    else if (compte.statut == "Ouvert") {
        deblock.disabled = true;
    }
}
rechercherCompte.addEventListener("input", async () => {
    const searchTerm = rechercherCompte.value.toLowerCase();
    listCompte.innerHTML = '';
    try {
        const comptes = await getCompte();
        if (Array.isArray(comptes)) {
            const matchingComptes = comptes.filter((compte) => compte.client.nomComplet.toLowerCase().includes(searchTerm) || compte.client.telephone.includes(searchTerm));
            matchingComptes.forEach((compte) => {
                const compteItem = createCompteItem(compte.client.nomComplet, compte.client.telephone, compte.fournisseur);
                compteItem.addEventListener('click', () => {
                    showCompte(compte, modal);
                    listCompte.innerHTML = '';
                    block.addEventListener("click", async () => {
                        try {
                            const responses = await fetchData("http://127.0.0.1:8000/api/block", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({ compte: compte.id })
                            });
                            console.log(responses);
                        }
                        catch (error) {
                            console.error("Erreur:", error);
                        }
                    });
                    deblock.addEventListener("click", async () => {
                        try {
                            const responses = await fetchData("http://127.0.0.1:8000/api/deblock", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({ compte: compte.id })
                            });
                            console.log(responses);
                        }
                        catch (error) {
                            console.error("Erreur:", error);
                        }
                    });
                    deleteCompte.addEventListener("click", async () => {
                        try {
                            const responses = await fetchData("http://127.0.0.1:8000/api/delete", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({ compte: compte.id })
                            });
                            console.log(responses);
                        }
                        catch (error) {
                            console.error("Erreur:", error);
                        }
                    });
                });
                listCompte.appendChild(compteItem);
            });
        }
    }
    catch (error) {
        console.error("Erreur lors de la récupération des comptes :", error);
    }
});
close.addEventListener("click", () => {
    modal.style.display = "none";
});
historique.addEventListener("click", async () => {
    modalHistorique.style.display = "flex";
    try {
        const responses = await fetchData("http://127.0.0.1:8000/api/historique/" + expediteurNumero.value, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        });
        console.log(responses);
        if (Array.isArray(responses)) {
            tbody.innerHTML = '';
            responses.forEach(Transaction => {
                const li = createHistorique(Transaction.id, Transaction.montant, Transaction.type_transfert, Transaction.date_transaction);
                tbody.appendChild(li);
            });
        }
    }
    catch (error) {
        console.error("Erreur:", error);
    }
});
closeHistorique.addEventListener("click", () => {
    modalHistorique.style.display = "none";
});
fournisseurSelect2.addEventListener("change", () => {
    console.log(fournisseurSelect.value);
    if (fournisseurSelect2.value === "OM") {
        colfour.forEach(element => {
            element.setAttribute("class", "Orange_Money");
        });
    }
    else if (fournisseurSelect2.value === "WR") {
        colfour.forEach(element => {
            element.setAttribute("class", "Wari");
        });
    }
    else if (fournisseurSelect2.value === "WV") {
        colfour.forEach(element => {
            element.setAttribute("class", "Wave");
        });
    }
    else if (fournisseurSelect2.value === "CB") {
        colfour.forEach(element => {
            element.setAttribute("class", "CB");
        });
    }
    else {
        colfour.forEach(element => {
            element.removeAttribute("class");
        });
    }
});
submitTransaction.addEventListener("click", () => {
    if (expediteurNumero.value == "") {
        message("Numero numero Obligatoire ", error);
    }
    if (!(isNumCompte(expediteurNumero.value) || isTel(expediteurNumero.value))) {
        return message("Numero inexistant dans la base de donnée", error);
    }
    console.log(id_expediteur);
    console.log(id_destinataire);
    mont = montant.value;
    typ = transactionSelect.value;
    console.log(mont);
    console.log(typ);
    fetch(`http://127.0.0.1:8000/api/transactions/${typ}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
            montant: mont,
            type: typ,
            expediteur_id: id_expediteur,
            destinateur_id: id_destinataire,
            fournisseur: fournisseurSelect2.value,
            code: codeT.value
        })
    }).then((response => response.json().then(data => {
        console.log(data);
        error.innerHTML = data.message;
        setTimeout(() => {
            error.innerHTML = "";
        }, 10000);
        viderChamps([montant, nomComplet, nomCompletDes, expediteurNumero, numeroDes, codeT]);
    }))).catch((error) => {
        error.innerHTML = error.message;
    });
});
numeroDes.addEventListener("change", () => {
    if (!(isNumCompte(numeroDes.value) || isTel(numeroDes.value))) {
        message("Numero inexistant dans la base de donnée", error);
        viderChamps([numeroDes]);
    }
    nomCompletDes.value = "";
    fetch(port + "/clients/" + numeroDes.value)
        .then(response => response.json())
        .then(dataResponse => {
        if (dataResponse.data) {
            nomCompletDes.value = dataResponse.data.nomComplet;
            id_destinataire = dataResponse.data.id;
            console.log(dataResponse.data);
        }
        else {
            console.log(dataResponse);
            message(dataResponse.message, error);
        }
    });
});
expediteurNumero.addEventListener("change", () => {
    if (!(isNumCompte(expediteurNumero.value) || isTel(expediteurNumero.value))) {
        message("Numero inexistant dans la base de donnée", error);
        viderChamps([expediteurNumero]);
    }
    expediteurNom.value = "";
    fetch(port + "/clients/" + expediteurNumero.value)
        .then(response => response.json())
        .then(dataResponse => {
        if (dataResponse.data) {
            expediteurNom.value = dataResponse.data.nomComplet;
            //  console.log(dataResponse.data.id);
            id_expediteur = dataResponse.data.id;
        }
        else {
            console.log(dataResponse);
            alert(dataResponse.message);
        }
    });
});
// transactionSelect.addEventListener("change", () => {
//     if (transactionSelect.value === "Retrait") {
//         des.style.display = "none";
//     }
//     else {
//         des.style.display = "block";
//     }
//     if (transactionSelect.value === "Retrait_Avec_Code") {
//         code.style.display = "block";
//         des.style.display = "none";
//     }
//     else {
//         code.style.display = "none";
//     }
//     if (transactionSelect.value != "saisir") {
//         send.removeAttribute("disabled");
//     } else {
//         send.setAttribute("disabled", "true");
//         send.disabled = true;
//     }
// })
