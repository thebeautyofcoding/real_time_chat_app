<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserController extends Controller
{
    public function searchUsers(Request $request)
    {

        $query = $request->input('query');
        $currentUser = $request->user();

        $users = $currentUser->where('id', '!=', $currentUser->id)
            ->where(function ($q) use ($query) {
                $q->where('name', 'LIKE', "%$query%")
                    ->orWhere('email', 'LIKE', "%$query%");
            })->get();




        return response()->json([
            'users' => $users
        ]);
    }
}
