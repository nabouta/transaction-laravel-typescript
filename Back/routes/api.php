<?php

use App\Http\Controllers\ClientController;
use App\Http\Controllers\CompteController;
use App\Http\Controllers\TransactionController;
use App\Models\Client;
use App\Models\Compte;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
Route::get("/clients/{keySearch}",[ClientController::class,"getClientByTelOrNumCompte"]);
Route::get("/historique/{telephone}",[TransactionController::class,"getTransactionByClient"]);
Route::post("/transactions/Transfert", [TransactionController::class, "transfert"]);
Route::post("/transactions/Retrait", [TransactionController::class, "retrait"]);
Route::post("/transactions/Dépot", [TransactionController::class, "depot"]);
// Route::post("/transactions/historique", [TransactionController::class, "historique"]);
Route::post("/block",[CompteController::class,"blockAccount"]);
Route::post("/deblock",[CompteController::class,"deblockAccount"]);
Route::post("/delete",[CompteController::class,"deblockAccount"]);
Route::apiResource("client",ClientController::class)->only("store","index");
Route::apiResource("compte",CompteController::class);

