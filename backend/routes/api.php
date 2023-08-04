<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ChatRoomController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Broadcast;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\SettingsController;

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

// only routes that are not protected by sanctum
Route::controller(AuthController::class)->group(function () {
    Route::post('/register', 'register');
    Route::post('/login', 'login');
});


// routes that are protected by sanctum
Route::middleware('auth:sanctum')->group(function () {
    //auth
    Route::post('logout', [AuthController::class, 'logout']);

    // chatrooms
    Route::get('chatrooms', [ChatRoomController::class, 'getChatRooms']);
    Route::get('chatrooms/{chatroom}', [ChatRoomController::class, 'getChatroomById']);
    Route::post('chatrooms', [ChatRoomController::class, 'storeChatroom']);
    Route::post('chatrooms/{chatroom}/users', [ChatRoomController::class, 'addUsersToChatroom']);
    Route::put('chatrooms/{chatroom}', [ChatRoomController::class, 'updateChatroom']);
    Route::delete('chatrooms/{chatroom}', [ChatRoomController::class, 'deleteChatroom']);



    // search users
    Route::get('search/users', [UserController::class, 'searchUsers']);

    // for broadcasting
    Broadcast::routes(['middleware' => ['auth:sanctum']]);


    // typing events
    Route::post('chatrooms/{chatroom}/user-is-typing', [MessageController::class, 'userIsTyping']);
    Route::post('chatrooms/{chatroom}/user-stopped-typing', [MessageController::class, 'userStoppedTyping']);


    // messages
    Route::post('chatrooms/{chatroom}/messages', [MessageController::class, 'storeMessage']);



    // settings
    Route::post('settings/avatar', [SettingsController::class, 'updateAvatar']);
    // update user
    Route::put('settings/user', [SettingsController::class, 'updateName']);
});
