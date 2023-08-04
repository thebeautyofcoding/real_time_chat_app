import { AxiosResponse } from 'axios';
import { defineStore } from 'pinia';
import { ChatRoom, Message, Room } from 'src/types';
import { api } from 'src/boot/axios'

interface RoomState{
  rooms: ChatRoom[];
  room: ChatRoom | null;
  showUpadateRoomDialog: boolean;
  showAddRoomDialog: boolean;
}

export const useRoomStore = defineStore('room', {
  state: (): RoomState => {
    return {
      rooms: [],
      room: null,
      showUpadateRoomDialog: false,
      showAddRoomDialog: false,
    }
  },
  actions: {
    toggleShowAddRoomDialog() {
      this.showAddRoomDialog = !this.showAddRoomDialog
    },

    async createRoom(roomName: string) {
      try {
        const response: AxiosResponse<{ chatroom: ChatRoom }> =
          await api.post('/chatrooms', { room_name: roomName })
        this.rooms.push(response.data.chatroom)
        return response.data
      } catch(err) {
        throw err
      }
    },
    getRooms() {
      try {
        api.get('/chatrooms').then((response:AxiosResponse<{chatrooms:ChatRoom[]}>) => {
          this.rooms = response.data.chatrooms
        })
      } catch (err) {
        throw err
      }
    },

    async getMessagesOfRoom(roomId: number) {
      try {
        const response = await api.get(`/chatrooms/${roomId}/messages`)
        // lets get the chatroomIndex from the rooms array
        const chatroomIndex = this.rooms.findIndex((room) => room.id === roomId)

        this.rooms[chatroomIndex].messages = response.data.messages
      } catch (err) {
        throw err
}
    },

    async sendMessage(messageData: FormData, roomId: number) {
      try {
        const response = await api.post('/chatrooms/' + roomId + '/messages', messageData)

        const chatroomIndex = this.rooms.findIndex((room) => room.id === roomId)
        this.rooms[chatroomIndex].last_message = response.data.message
        if (this.room?.messages)
          this.room.messages.push(response.data.message)
      } catch (err) {
        throw err
      }
    },
    async deleteRoom(roomId: number) {
      try {
        await api.delete('/chatrooms/' + roomId)
        const index = this.rooms.findIndex((room) => room.id === roomId)
        this.rooms.splice(index, 1)
        if(this.room?.id === roomId)
          this.room = null
      } catch (err) {
        throw err
      }
    },
    async updateRoom(room: ChatRoom) {
      try {
        const user_ids = room.users.map((user) => user.id)
        const room_name = room.name
        const response = await api.put(`/chatrooms/${room.id}`, { user_ids, room_name })
        const index= this.rooms.findIndex((r) => r.id === room.id)

        this.rooms[index]=response.data.chatroom
      } catch (err) {
        throw err
      }
    },
    async addUsersToRoom(roomId: number, userIds: number[]) {
      try {
        const response = await api.post(`/chatrooms/${roomId}/users`, { user_ids: userIds })
        const index = this.rooms.findIndex((room) => room.id === roomId)
        console.log(response.data.chatroom)
        this.rooms[index] = response.data.chatroom
      } catch (err) {
        throw err
      }
    },
    toggleRoomUpdateDialog() {
      this.showUpadateRoomDialog = !this.showUpadateRoomDialog
    },

    async fetchRoomById(roomId: number) {
      try {
        const response = await api.get(`/chatrooms/${roomId}`)

        this.room = response.data.chatroom
      } catch (err) {
        throw err
      }
    },
    async addMessage(message: Message, roomId: number) {
      if (this.room?.messages)
        this.room.messages.push(message)

      const index = this.rooms.findIndex((r) => r.id === roomId)
      this.rooms[index].last_message = message
    }
  }
})
