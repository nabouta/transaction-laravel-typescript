<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Compte;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{

    public function randomCode($length)
    {
        $alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
        $pass = array(); //remember to declare $pass as an array
        $alphaLength = strlen($alphabet) - 1; //put the length -1 in cache
        for ($i = 0; $i < $length; $i++) {
            $n = rand(0, $alphaLength);
            $pass[] = $alphabet[$n];
        }
        return implode($pass); //turn the array into a string
    }

    public function depot(Request $request)
    {

        $type = $request->type;
        $montant = $request->montant;
        $frais = $request->frais;
        $expediteur = $request->expediteur_id;
        $destinateur = $request->destinateur_id;
        $frais = $montant * 0.02;
        $code = $this->randomCode(25);
        if ($request->fournisseur === "WR") {
            Transaction::insert([
                'type_transfert' => $type,
                'montant' => $montant - $frais,
                'date_transaction' => now(),
                'expediteur_id' => $expediteur,
                'destinataire_id' => $destinateur,
                'immediat' => false,
                'code' => $code,
                'compte_id' => null
            ]);

            return Response(["message" => "Depot avec succes! voici le code :$code"]);
        } else {
            DB::beginTransaction();

            try {
                $compte_id = Compte::where('client_id', $request->destinateur_id)
                    ->where('fournisseur', $request->fournisseur)->first();

                if ($compte_id) {

                if ($compte_id->statut == "Fermé") {
                    return Response(["message" => "Ce Compte ne peut plus recevoir de transaction car est fermé!"]);
                }
                $newSolde =  $compte_id->solde += $request->montant;
                $compte_id->update(['solde' => $newSolde]);
                Transaction::insert([
                    'type_transfert' => $request->type,
                    'montant' => $request->montant,
                    'date_transaction' => now(),
                    'expediteur_id' => $request->expediteur_id,
                    'compte_id' => $compte_id->id,
                    'immediat' => false,
                    'destinataire_id' => null
                ]);
                DB::commit();
                return Response(["message" => "Depot reussi avec succés!!!!!"]);
            }
            return Response(["message" => "Client n'a pas de compte sur ce fournisseur "]);
            } catch (\Exception $e) {
                DB::rollback();
                return Response(["message" => "error $e"]);
            }
        }
    }
    public function transfert(Request $request)
    {


        $type = $request->type;
        $montant = $request->montant;
        $frais = $request->frais;
        $expediteur = $request->expediteur_id;
        $destinateur = $request->destinateur_id;
        $fournisseur = $request->fournisseur;

        if ($fournisseur == "OM") {
            $frais = $montant * 0.01;
        } elseif ($fournisseur == "CB") {
            $frais = $montant * 0.05;
        } elseif ($fournisseur == "WV") {
            $frais = $montant * 0.01;
        } elseif ($fournisseur == "WR") {
            $frais = $montant * 0.02;
        }

        if ($montant < 500) {
            return Response(["message" => "montant ne doit pas etre infereiru a 500"]);
        }
        if ($fournisseur === "Wari" && $montant < 1000) {
            return Response(["message" => "montant ne doit pas etre infereiru a 1000"]);
        }
        if ($fournisseur === "CB" && $montant < 10000) {
            return Response(["message" => "montant ne doit pas etre infereiru a 10000"]);
        }
        if ($fournisseur != "CB" && $montant >= 10000000) {
            return Response(["message" => "montant ne doit pas etre superieurur a 1000000"]);
        }



        if ($fournisseur != "WR") {
            $exp =  Compte::where('client_id', $expediteur)->where('fournisseur', $fournisseur)->first();
            $des =  Compte::where('client_id', $destinateur)->where('fournisseur', $fournisseur)->first();
            if (!($exp)) {
                return Response(["message" => "compte expediteur inexistant!!!!"]);
            }
            if (!($des)) {
                return Response(["message" => "compte destinateur inexistant!!!!"]);
            }

            if ($montant + $frais > $exp->solde) {
                return Response(["message" => "Vous ne disposez pas ce montant "]);
            }
            if ($exp->estFerme == true || $des->estFerme == true) {
                return Response(["message" => "Compte ferme ne peut plus avoir de transactions!!!!"]);
            }
            if ($exp->estBloque == true) {
                return Response(["message" => "Compte Bloque ne peut plus faire de transfert sortants!!!!"]);
            }
            $newm = $exp->solde -= $montant + $frais;
            $newp = $des->solde += $montant;

            DB::beginTransaction();

            try {
                $exp->update(['solde' => $newm]);
                $des->update(['solde' => $newp]);
                Transaction::insert([
                    'type_transfert' => $type,
                    'montant' => $montant,
                    'date_transaction' => now(),
                    'expediteur_id' => $expediteur,
                    'compte_id' => $destinateur,
                    'immediat' => false,
                    'destinataire_id' => null
                ]);
                DB::commit();
                return Response(["message" => "transfert reussi avec succés!!!!!"]);
            } catch (\Exception $e) {
                DB::rollback();
                return Response(["message" => "error .$e"]);
            }
        } else {
            $code = $this->randomCode(25);
            DB::beginTransaction();

            try {
                Transaction::insert([
                    'type_transfert' => $type,
                    'montant' => $montant - $frais,
                    'date_transaction' => now(),
                    'expediteur_id' => $expediteur,
                    'destinataire_id' => $destinateur,
                    'immediat' => false,
                    'code' => $code,
                    'compte_id' => null
                ]);
                DB::commit();
                return Response(["message" => "transfert wari  avec succés le code .$code!!!!!"]);
            } catch (\Exception $e) {
                DB::rollback();
                return Response(["message" => "error"]);
            }
        }
    }
    public function retrait(Request $request)
    {
        $type = $request->type;
        $montant = $request->montant;
        $expediteur = $request->expediteur_id;
        $destinateur = $request->destinateur_id;
        $fournisseur = $request->fournisseur;

        if ($fournisseur != "WR") {
            $CompteRetrait =  Compte::where('client_id', $expediteur)->where('fournisseur', $fournisseur)->first();

            if (!$CompteRetrait) {
                return Response(["message" => "Compte Inexistant"]);
            }
            if ($montant  > $CompteRetrait->solde) {
                return Response(["message" => "Vous ne pouvez pas retirer cette somme"]);
            }
            $new =  $CompteRetrait->solde -= $montant;
            DB::beginTransaction();

            try {
                $CompteRetrait->update(['solde' => $new]);
                Transaction::insert([
                    'type_transfert' => $type,
                    'montant' => $montant,
                    'date_transaction' => now(),
                    'expediteur_id' => $expediteur,
                    'destinataire_id' => null,
                    'immediat' => false,
                    'code' => null,
                    'compte_id' => $expediteur
                ]);
                DB::commit();
                return Response(["message" => "Retrait avec succés!!!!!"]);
            } catch (\Exception $e) {
                DB::rollback();
                return Response(["message" => "Error!!!!! $e"]);
            }
        }
    }
    public function retraitAvecCode(Request $request)
    {
        $type = $request->type;
        $montant = $request->montant;
        $expediteur = $request->expediteur_id;
        $destinateur = $request->destinateur_id;
        $fournisseur = $request->fournisseur;
        $code = $request->code;
        $transaction = Transaction::where('destinataire_id', $expediteur)->where('code', $code)->first();

        if (!$transaction) {
            return Response(["message" => "la transaction n'existe pas"]);
        }
        if ($montant != $transaction->montant) {
            return Response(["message" => "Le montant n'est pas valide"]);
        }
        if ($transaction->code == "invalid") {
            return Response(["message" => "Le code n'est plus valide"]);
        }
        if ($transaction->etat == "annulee") {
            return Response(["message" => "La transaction n'est plus valide"]);
        }

        DB::beginTransaction();

        try {
            $transaction->update(['code' => "invalid"]);
            Transaction::insert([
                'type_transfert' => $type,
                'montant' => $montant,
                'date_transaction' => now(),
                'expediteur_id' => $expediteur,
                'destinataire_id' => null,
                'immediat' => false,
                'code' => null,
                'compte_id' => null
            ]);
            DB::commit();
            return Response(["message" => "Retrait avec succés!!!!!"]);
        } catch (\Exception $e) {
            DB::rollback();
            return Response(["message" => "Error!!!!! $e"]);
        }
        return $transaction;
    }

    public function cancelTransaction(Request $request)
    {
        $transaction = Transaction::findOrFail($request->id);
        if ($transaction->type_transfert == 'Depot' || $transaction->type_transfert == 'Transfert') {
            $hours = now()->diffInHours($transaction->created_at);
            if ($hours <= 24) {
                $transaction->etat = 1;
                if ($transaction->type_transfert == 'Depot') {

                    $expediteur = Client::find($transaction->expediteur_id);
                    $compte= Compte::where("client_id",$expediteur->id)->first();
                    $compte->solde -= $transaction->montant;
                    $expediteur->compte->save();
                    return [
                        "Message" => "Transaction annulée "
                    ];
                }
                if ($transaction->type_transfert == 'Transfert') {
                    $expediteur = Client::find($transaction->expediteur_id);
                    $compte= Compte::where("client_id",$expediteur->id)->first();
                    $destinataire = Client::find($transaction->destinataire_id);
                    $compteDestinataire= Compte::where("client_id",$destinataire->id)->first();
                    $compte->solde += $transaction->montant;
                    $expediteur->compte->save();
                    $compteDestinataire->solde -= $transaction->montant;
                    $destinataire->compte->save();
                }
            }
        }
        return [
            "Message" => "Transaction  ne peut etre annulée "
        ];
    }
    public function getTransactionByClient(Request $request)
    {
        $expediteur = Client::where("telephone", $request->telephone)->first();
        return Transaction::where("expediteur_id", $expediteur->id)->get();
    }
}
