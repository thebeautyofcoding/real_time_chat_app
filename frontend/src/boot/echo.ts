
import Echo from 'laravel-echo'
import { boot } from 'quasar/wrappers'
import Pusher from 'pusher-js'

// define pusher on the window object
declare global {
  interface Window {
    Pusher: typeof Pusher;
  }
}

window.Pusher = Pusher

const echo = new Echo({
  broadcaster: 'pusher',
  key: process.env.VUE_APP_PUSHER_KEY,
  cluster: process.env.VUE_APP_PUSHER_CLUSTER,
  forceTLS: false,
  auth: {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
  },
  authEndpoint: 'http://localhost:8000/api/broadcasting/auth',
})

export default boot(({ app }) => {
  app.config.globalProperties.$echo = echo;
})

export { echo };
