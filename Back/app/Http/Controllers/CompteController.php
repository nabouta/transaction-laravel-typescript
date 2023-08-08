<?php

namespace App\Http\Controllers;

use App\Models\Client as ModelsClient;
use App\Models\Compte;
use Illuminate\Http\Request;

use function PHPUnit\Framework\isEmpty;

class CompteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return  Compte::with('client')->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            "fournisseur" => 'required|in:"WV","OM","CB");',
            "telephone" => "required|regex:/^(7[76508]{1})(\\d{7})$/"
        ]);

        $client = ModelsClient::clientByTel($request->telephone)->first();
        $compte = Compte::where(["client_id" => $client->id, "fournisseur" => $request->fournisseur])->first();

        if ($client) {
            if (!$compte) {
                return Compte::create([
                    "fournisseur" => $request->fournisseur,
                    "client_id" => $client->id,
                    "solde" => 0,
                    "numero_compte" => $request->fournisseur . "_" . $request->telephone
                ]);
            }
            return [
                "Message" => "Ce client a deja un compte avec ce founisseur"
            ];
        }
        return [
            "Message" => "Ce client n'existe pas"
        ];
    }
    public function closeAccount(Request $request)
    {
        $compte = Compte::findOrFail($request->compte);
        $compte->statut = 'Ferme';
        $compte->save();
        return ["Message" => "success', 'Compte fermé avec succès."];
    }
    public function toggleAccountStatus(Request $request)
    {
        $request->validate([
            "compte" => 'required'
        ]);
        $compte = Compte::findOrFail($request->compte);
        if($compte->statut == 'Bloqué')
        $compte->statut = ($compte->statut == 'Bloqué') ? 'Debloqué' : 'Bloqué';
        $compte->save();

        return ["Message" => "Mis à jour faite"];
    }
    public function blockAccount(Request $request)
    {
        $request->validate([
            "compte" => 'required'
        ]);
        $compte = Compte::findOrFail($request->compte);
        $compte->statut = 'Bloqué';
        $compte->save();
        return ["Message" => "Mis à jour faite"];
    }
    public function deblockAccount(Request $request)
    {
        $request->validate([
            "compte" => 'required'
        ]);
        $compte = Compte::findOrFail($request->compte);
        $compte->statut = 'Debloqué';
        $compte->save();
        return ["Message" => "Mis à jour faite"];
    }
    /**
     * Display the specified resource.
     */
    public function show(Compte $compte)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Compte $compte)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Compte $compte)
    {
        //
    }
}
