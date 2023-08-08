export function chargerSelect(select: HTMLSelectElement, tableau: any) {
    tableau.forEach((element: string) => {
        let option = document.createElement("option");
        option.innerHTML = element;
        select.appendChild(option);
    });
}

export async function fetchData<T>(url: string, body: RequestInit): Promise<T> {
    const response = await fetch(url, body);
    const data = await response.json() as T;
    return data
}

export function creatingElement(nomElement: string, attributElement: { [key: string]: string }, containElement: string = ''): any {
    let element: HTMLElement = document.createElement(nomElement);
    for (const key in attributElement) {
        element.setAttribute(key, attributElement[key]);
    }
    element.innerHTML = containElement;
    return element;
}


export function createCompteItem(nomComplet: string, telephone: string, fournisseur: string): any {
    const li: HTMLLIElement = creatingElement('li', { class: "search" });
    const fullName: HTMLSpanElement = creatingElement('span', { class: 'nom' }, nomComplet);
    const phone: HTMLSpanElement = creatingElement('span', { class: 'telephone' }, telephone);
    const fournisseurName: HTMLSpanElement = creatingElement('span', { class: 'fournisseur' }, fournisseur);
    li.append(fullName, phone, fournisseurName);
    return li;
}
export function createHistorique(id: string, montant: string, typeTransaction: string, date: string): any {
    const tr: HTMLLIElement = creatingElement('tr', {});
    const identifiant: HTMLSpanElement = creatingElement('th', {}, id);
    const amount: HTMLSpanElement = creatingElement('td', {}, montant);
    const type: HTMLSpanElement = creatingElement('td', {}, typeTransaction);
    const time: HTMLSpanElement = creatingElement('td', {}, date);
    const dateActuelle = new Date();
    const dateDonneeStr = date;
    const dateDonnee = new Date(dateDonneeStr);
    if (dateDonnee <= dateActuelle) {
        const button = HTMLButtonElement = creatingElement('button', {}, 'Annulée');
          button.style.backgroundColor = 'green';
          button.addEventListener("click",()=>{

          })
        tr.append(identifiant, amount, type, time,button);
        return tr;
    } else {

        tr.append(identifiant, amount, type, time);
        return tr;
    }

}
export function message(message: string, div: HTMLElement) {
    div.innerHTML = message
    setTimeout(() => {
        div.innerHTML = "";
    }, 5000);
}
export function viderChamps(tab: Array<HTMLInputElement>) {
    tab.forEach(element => {
        element.value = "";
    });
}