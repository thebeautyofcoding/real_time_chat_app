<template>
  <div class="chat-window" v-if="room">
    <div class="header">
      <h6 class="room-name">
        Chat with {{ room.users.map((user) => user.name).join(', ') }}
      </h6>

      <!-- display avatar group of the users of this room -->
      <div
        :style="{
          width: avatarContainerWidth(room) + 'px',
          position: 'relative',
          height: '100%',
        }"
        class="flex-center row q-mb-lg"
      >
        <q-avatar
          v-for="(user, index) in room.users"
          :key="user.id"
          :src="url(user.avatar_url)"
          size="50px"
          :style="`left: ${index * 25}px`"
          color="primary"
          text-color="white"
          class="q-mr-sm overlapping"
        >
          <q-img
            class="round-avatar"
            v-if="user.avatar_url"
            :src="url(user.avatar_url)"
          />
          <q-icon v-else name="person" />
        </q-avatar>
      </div>
    </div>

    <!-- scrollable chat window-->

    <q-scroll-area
      class="messages"
      ref="messageContainer"
      :style="scrollAreaStyle"
    >
      <TransitionGroup
        :appear="true"
        enter-active-class="animated fadeInLeft"
        leave-active-class="animated fadeOut"
      >
        <q-chat-message
          class="q-ma-md"
          v-for="message in room.messages"
          :key="message.id"
          :avatar="
            message.sender.avatar_url
              ? url(message.sender.avatar_url)
              : undefined
          "
          :name="message.sender.name"
          :sent="message.sender.id === user.id"
          :date="formatTime(message.created_at)"
          :bg-color="message.sender.name === user.name ? 'primary' : 'grey-4'"
          :text-color="message.sender.name === user.name ? 'white' : 'black'"
        >
          <div>
            <div class="">
              {{ message.content }}
            </div>
            <q-img
              v-if="message.image_url"
              :src="url(message.image_url)"
              class="chat-image"
            />
          </div>
        </q-chat-message>
      </TransitionGroup>
    </q-scroll-area>
    <!-- typing indicator, message, image inputs and buttons-->
    <div class="message-input-container" :style="messageInputContainerStyle">
      <transition
        enter-active-class="animated fadeIn"
        leave-active-class="animated fadeOut"
      >
        <div v-if="usersTyping.length > 0" class="typing-indicator">
          {{ usersTyping.join(', ') }}
          {{ usersTyping.length > 1 ? ' are ' : ' is ' }} typing...
        </div>
      </transition>
      <div class="message-input">
        <div class="row">
          <div class="col-12 col-lg-10">
            <q-input
              @keyup="onKeyup"
              v-model="messageText"
              dense
              outlined
              class="message-field"
              placeholder="Type a message"
            />
          </div>

          <div class="col-12 col-lg-2 text-center q-pa-sm">
            <input
              class="q-mx-md"
              type="file"
              accept="image/*"
              ref="imageUploader"
              style="display: none"
              @change="handleImageUpload"
            />
            <q-btn
              class="q-mx-md"
              round
              dense
              color="primary"
              icon="image"
              @click="triggerImageUpload"
            />
            <q-btn
              class="q-mx-md"
              @click="sendMessage"
              round
              dense
              color="primary"
              icon="send"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>



<script setup lang="ts">
  import {
    ref,
    onMounted,
    nextTick,
    watch,
    onUnmounted,
    computed,
    onBeforeMount,
  } from 'vue';
  import { useRouter } from 'vue-router';
  import { ChatRoom, Message, User } from 'src/types';
  import { QScrollArea, useQuasar } from 'quasar';
  import { useRoomStore } from 'src/stores/room-store';
  import { useUserStore } from 'src/stores/user-store';
  import { storeToRefs } from 'pinia';

  import { api } from 'src/boot/axios';
  import { echo } from 'src/boot/echo';
  import { url } from 'src/helpers';

  const router = useRouter();

  const chatRoomId = computed(() =>
    Number(router.currentRoute.value.params.roomId)
  );

  const { user } = storeToRefs(useUserStore());
  const $q = useQuasar();
  const usersTyping = ref<string[]>([]);
  const messageText = ref('');
  const selectedImage = ref<File>();
  const isTyping = ref(false);
  const imageUploader = ref<HTMLInputElement | null>(null);
  let typingTimeout: ReturnType<typeof setTimeout> | null = null;

  const messageContainer = ref<QScrollArea | null>(null);

  const avatarContainerWidth = (room: ChatRoom) => {
    if (!room || !room.users) return 0;
    return room.users.length * 50 - (room.users.length - 1) * 25;
  };

  const { room } = storeToRefs(useRoomStore());

  const handleImageUpload = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    selectedImage.value = file;
  };

  const scrollToBottom = async () => {
    console.log('SCROLL');
    if (!messageContainer.value) return;
    await nextTick(); // Ensure that the DOM is updated
    const scrollTarget = messageContainer.value.getScrollTarget();
    const scrollHeight = scrollTarget.scrollHeight;

    messageContainer.value.setScrollPosition('vertical', scrollHeight);
  };
  const messageInputContainerStyle = computed(() => {
    if ($q.screen.lt.md) {
      return {
        paddingBottom: '6rem',
      };
    } else {
      return {};
    }
  });

  const scrollAreaStyle = computed(() => {
    console.log($q.screen.width > 600);
    if ($q.screen.width > 1035) {
      return { height: '65vh' };
    } else if ($q.screen.width < 600) {
      return { height: '80vh' };
    } else {
      return { height: '65vh' };
    }
  });

  const emitUserIsTyping = async () => {
    isTyping.value = true;
    await api.post('/chatrooms/' + chatRoomId.value + '/user-is-typing');
  };

  const emitUserStoppedTyping = async () => {
    console.log('stopped typing');
    isTyping.value = false;
    await api.post('/chatrooms/' + chatRoomId.value + '/user-stopped-typing');
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const sendMessage = async (event: Event) => {
    if (!messageText.value && !selectedImage.value) return;

    const newFormData = new FormData();
    newFormData.append('content', messageText.value);
    newFormData.append('image', selectedImage.value || '');

    try {
      await useRoomStore().sendMessage(newFormData, chatRoomId.value);
      messageText.value = '';
      if (imageUploader.value) {
        imageUploader.value.value = '';
      }
      selectedImage.value = undefined;
      scrollToBottom();
    } catch (err) {
      $q.notify({
        message: 'Error sending message',
        color: 'red',
        icon: 'error',
      });
    }
  };

  const triggerImageUpload = () => {
    if (imageUploader.value) {
      imageUploader.value.click();
    }
  };

  const onKeyup = () => {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    typingTimeout = setTimeout(() => {
      emitUserStoppedTyping();
    }, 2000);

    if (!isTyping.value) {
      emitUserIsTyping();
    }
  };

  watch(
    () => router.currentRoute.value.params.roomId,
    async (newRoomId, oldRoomId) => {
      if (!newRoomId) {
        echo && echo.leave(`chatroom.${oldRoomId}`);
      }

      if (newRoomId !== oldRoomId) {
        echo.leave(`chatroom.${oldRoomId}`);
        setupListeners(Number(newRoomId));
        await useRoomStore().fetchRoomById(chatRoomId.value);
      }
    }
  );

  const setupListeners = (roomId: number | string) => {
    echo
      .join(`chatroom.${roomId}`)
      .here((users: User[]) => {
        console.log(users);
      })
      .joining((user: User) => {
        $q.notify({
          message: `${user.name} has joined the room`,
          color: 'green',
          icon: 'person_add',
        });
      })
      .leaving((user: User) => {
        $q.notify({
          message: `${user.name} has left the room`,
          color: 'red',
          icon: 'person_remove',
        });
      })
      .listen('MessageSent', async (e: { message: Message }) => {
        useRoomStore().addMessage(e.message, chatRoomId.value);
        await scrollToBottom();
      });

    echo
      .private(`chatroom.${roomId}`)
      .listen('UserIsTyping', (e) => {
        console.log('user is typing', e);
        if (usersTyping.value.indexOf(e.username) === -1)
          usersTyping.value.push(e.username);
      })
      .listen('UserStoppedTyping', (e: { username: string; roomId: number }) => {
        console.log('user stopped typing', e);
        const index = usersTyping.value.indexOf(e.username);
        if (index > -1) {
          usersTyping.value.splice(index, 1);
        }
      });
  };

  onMounted(async () => {
    setupListeners(chatRoomId.value);

    await useRoomStore().fetchRoomById(chatRoomId.value);
  });

  onUnmounted(() => {
    console.log('unmounting');
    if (echo) {
      // leave the channel
      echo.leave(`chatroom.${chatRoomId.value}`);
    }
  });
</script>

<style scoped>
.overlapping {
  border: 2px solid white;
  position: absolute;
}
.chat-window {
  border-left: 1px solid #e0e0e0;
}

.header {
  padding: 0.5rem 0;
  text-align: center;
  color: #1d2129;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.room-name {
  font-size: 1.2rem;
  font-weight: bold;
}
.messages {
  flex-grow: 1;

  background-color: #f9f9fa;
}

.message-input-container {
  position: relative; /* Gives space for the typing indicator */
  padding: 0.5rem;
  height: 100%;
  margin-top: 1rem;
}
.message-input {
  background-color: #fff;
  height: 100%;
  margin: auto;
}
.message-input .q-btn {
  margin-left: 0.5rem;
  color: #4267b2;
}
.typing-indicator {
  text-align: center;
  color: white;
  font-style: italic;
  position: absolute;
  bottom: 100%; /* Aligns the typing indicator to the bottom of the container */

  background: green;
  padding: 0.5rem;
  border-radius: 5px;
  left: 50%;

  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);

  transform: translate(-50%, 100%);
}
.round-avatar {
  border-radius: 50%;
  height: 100%;
  width: 100%;
}
</style>
