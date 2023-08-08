export function chargerSelect(select, tableau) {
    tableau.forEach((element) => {
        let option = document.createElement("option");
        option.innerHTML = element;
        select.appendChild(option);
    });
}
export async function fetchData(url, body) {
    const response = await fetch(url, body);
    const data = await response.json();
    return data;
}
export function creatingElement(nomElement, attributElement, containElement = '') {
    let element = document.createElement(nomElement);
    for (const key in attributElement) {
        element.setAttribute(key, attributElement[key]);
    }
    element.innerHTML = containElement;
    return element;
}
export function createCompteItem(nomComplet, telephone, fournisseur) {
    const li = creatingElement('li', { class: "search" });
    const fullName = creatingElement('span', { class: 'nom' }, nomComplet);
    const phone = creatingElement('span', { class: 'telephone' }, telephone);
    const fournisseurName = creatingElement('span', { class: 'fournisseur' }, fournisseur);
    li.append(fullName, phone, fournisseurName);
    return li;
}
export function createHistorique(id, montant, typeTransaction, date) {
    const tr = creatingElement('tr', {});
    const identifiant = creatingElement('th', {}, id);
    const amount = creatingElement('td', {}, montant);
    const type = creatingElement('td', {}, typeTransaction);
    const time = creatingElement('td', {}, date);
    const dateActuelle = new Date();
    const dateDonneeStr = date;
    const dateDonnee = new Date(dateDonneeStr);
    if (dateDonnee <= dateActuelle) {
        const button = HTMLButtonElement = creatingElement('button', {}, 'Annulée');
        button.style.backgroundColor = 'green';
        button.addEventListener("click", () => {
        });
        tr.append(identifiant, amount, type, time, button);
        return tr;
    }
    else {
        tr.append(identifiant, amount, type, time);
        return tr;
    }
}
export function message(message, div) {
    div.innerHTML = message;
    setTimeout(() => {
        div.innerHTML = "";
    }, 5000);
}
export function viderChamps(tab) {
    tab.forEach(element => {
        element.value = "";
    });
}
