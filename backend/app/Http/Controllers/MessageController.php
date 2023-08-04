<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Events\UserIsTyping;
use App\Events\UserStoppedTyping;
use App\Http\Resources\MessageResource;
use App\Models\Chatroom;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MessageController extends Controller
{
    public function storeMessage(Request $request, Chatroom $chatroom)
    {

        $validated = $request->validate([
            'content' => 'required|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048'
        ]);


        if ($request->hasFile('image')) {
            $imageName = time() . '.' . $request->image->extension();
            $request->image->storeAs('public/chatroom_images', $imageName);

            $storageUrl = Storage::url('chatroom_images/' . $imageName);


            $message = $chatroom->messages()->create([
                'content' => $validated['content'],
                'image_url' => $storageUrl,
                'user_id' => auth()->user()->id
            ]);
            broadcast(new MessageSent(new MessageResource($message->load('user'))))->toOthers();
            return response()->json([
                'message' => new MessageResource($message->load('user'))
            ]);
        }

        $message = $chatroom->messages()->create([
            'user_id' => $request->user()->id,
            'content' => $validated['content']
        ]);

        broadcast(new MessageSent(new MessageResource($message->load('user'))))->toOthers();
        return response()->json([
            'message' => new MessageResource($message->load('user'))
        ], 200);
    }
    public function userIsTyping(Request $request, Chatroom $chatroom)
    {
        broadcast(new UserIsTyping($request->user()->name, $chatroom->id))->toOthers();
    }

    public function userStoppedTyping(Request $request, Chatroom $chatroom)
    {
        broadcast(new UserStoppedTyping($request->user()->name, $chatroom->id))->toOthers();
    }
}
