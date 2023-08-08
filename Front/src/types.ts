export enum Fournisseur{
    OrangeMoney="OM",
    Wave="WV",
    CompteBancaire="CB",
}
export enum Transaction {
    Depot = "Dépot",
    Retrait = "Retrait",
    Retrait_Avec_Code = "Retrait_Avec_Code",
    Transfert = "Transfert",
}


export type client = {
    nomComplete: string,
    telephone: string 
}