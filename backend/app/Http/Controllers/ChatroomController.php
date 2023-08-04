<?php

namespace App\Http\Controllers;

use App\Http\Resources\ChatroomResource;
use App\Models\Chatroom;
use Illuminate\Http\Request;

class ChatroomController extends Controller
{
    public function storeChatroom(Request $request)
    {


        $validated = $request->validate([
            'room_name' => 'required|unique:chatrooms,name|max:255',
        ]);


        $chatroom = auth()->user()->chatrooms()->create([
            'name' => $validated['room_name'],
        ]);

        return response()->json([
            'chatroom' => new ChatroomResource($chatroom->load('users')),
        ], 201);
    }



    public function addUsersToChatroom(Request $request, Chatroom $chatroom)
    {
        $validated = $request->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => 'required|integer|exists:users,id',
        ]);

        $chatroom->users()->syncWithoutDetaching($validated['user_ids']);

        return response()->json([
            'chatroom' => $chatroom->load('users'),
        ], 201);
    }


    public function deleteChatroom(Chatroom $chatroom)
    {
        $chatroom->delete();

        return response()->json([
            'message' => 'Chatroom deleted successfully!',
        ], 200);
    }


    public function getChatrooms()
    {
        $chatrooms = auth()->user()->chatrooms()->with(['lastMessage', 'users'])->get();

        return response()->json([
            'chatrooms' => ChatroomResource::collection($chatrooms),
        ], 200);
    }


    public function getChatRoomById(Request $request, Chatroom $chatroom)
    {
        // get chatroom by id with its messages and users
        $chatroom = $chatroom->load(['messages', 'users']);

        return response()->json([
            'chatroom' => new ChatroomResource($chatroom)
        ], 200);
    }

    public function updateChatroom(Request $request, Chatroom $chatroom)
    {

        $validated = $request->validate([
            // alow the name to be the same as it was before
            'room_name' => 'required|max:255|unique:chatrooms,name,' . $chatroom->id,
            'user_ids' => 'required|array|exists:users,id',
        ]);

        $validated['user_ids'][] = auth()->user()->id;
        $chatroom->users()->sync($validated['user_ids']);
        $chatroom->update(['name' => $validated['room_name']]);
        $chatroom = $chatroom->load(['users']);

        return response()->json([
            'chatroom' => new ChatroomResource($chatroom->load(['users', 'lastMessage']))
        ], 200);
    }
}
