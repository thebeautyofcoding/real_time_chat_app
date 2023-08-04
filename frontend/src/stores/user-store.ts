import { defineStore } from 'pinia';
import { User, UserLoginData, UserRegisterData } from 'src/types';
import {api} from 'boot/axios'
import { AxiosResponse } from 'axios';
import { useRoomStore } from './room-store';

interface UserState{
  user: User
  showUpdateSettingsDialog: boolean;
}

export const useUserStore = defineStore('user', {
  state: ():UserState => {
    const userInLocalStorage = localStorage.getItem('user')

    if(userInLocalStorage){
      return {
        user: JSON.parse(userInLocalStorage),
        showUpdateSettingsDialog: false
      }
    }

    return { user: {} as User }
  },
  actions: {
      toggleUpdateSettingsDialog() {
        this.showUpdateSettingsDialog = !this.showUpdateSettingsDialog;
      },

    async login(user: UserLoginData) {
      return api.post('/login', user).then((response: AxiosResponse<{ user: User, token: string }>) => {
        const userApi = response.data.user
        const token = response.data.token
        localStorage.setItem('user', JSON.stringify(userApi))
        localStorage.setItem('token', token)
        this.user = userApi
      }).catch(err=> {
            throw err
      })
    },

    async register(user: UserRegisterData) {
      return api.post('/register', user).then((response: AxiosResponse<{ user: User, token: string }>) => {
        const userApi = response.data.user;
        const token = response.data.token;
        // locastorage
        localStorage.setItem('user', JSON.stringify(userApi));
        localStorage.setItem('token', token);
        //state
        this.user = userApi;
      }).catch((error) => {
       throw(error)
      }
      )
    },

    async logout() {
      return api.post('/logout').then(() => {
        localStorage.removeItem('user')
        localStorage.removeItem('token')
        this.user = {} as User
      }).catch(err => {
          throw err
      })
    },
    async searchUsers(query: string) {
      try {
        const response = await api.get('/search/users', { params: { query } })
        return response.data.users
      }catch (err) {
        throw err
      }
    },

    updateUser(user: User) {
      localStorage.setItem('user', JSON.stringify(user))
      this.user = user

      useRoomStore().rooms.forEach((room) => {
        const userIndex = room.users.findIndex((user) => user.id === this.user.id)
        room.users[userIndex] = this.user
      })

        useRoomStore().room?.users.forEach((user) => {
          if (user.id === this.user.id) {
              console.log('user updated')
                user.avatar_url = this.user.avatar_url
            }
        } )
    },

    async updateName(name: string) {
      try {
        const response = await api.put('/settings/user', { name })
        this.updateUser(response.data.user)
      } catch (err) {
        throw err
      }
    }
  },
});
