<template>
  <AddChatRoomDialog />
  <UpdateChatRoomDialog
    v-if="roomToUpdateId"
    :roomToUpdateId="roomToUpdateId"
  />
  <div class="row">
    <div class="chat-room-list col-xs-12 col-md-4 col-lg-4">
      <div class="header text-h4 text-grey-9 q-my-md q-mx-md">
        Chat Rooms

        <q-btn
          dense
          flat
          class="q-my-sm q-mx-md"
          color="primary"
          label="Add
      Chatroom"
          @click="useRoomStore().toggleShowAddRoomDialog"
        >
          <q-icon name="add" />
        </q-btn>
      </div>

      <q-scroll-area :style="scrollAreaStyle">
        <q-list padding>
          <q-item
            v-for="chatRoom in rooms"
            clickable
            class="chat-room-item q-my-lg"
            :key="chatRoom.id"
          >
            <q-menu transition-show="flip-right" transition-hide="flip-left">
              <q-item clickable @click="goToRoom(chatRoom.id)">
                <q-item-section>Go to room</q-item-section>
              </q-item>
              <q-item clickable @click="toggleRoomUpdateDialog(chatRoom.id)">
                <q-item-section>Update Room</q-item-section>
              </q-item>
              <q-item clickable @click="deleteRoom(chatRoom.id)">
                <q-item-section>Delete Room</q-item-section>
              </q-item>
            </q-menu>
            <div
              :style="{
                width: avatarContainerWidth(chatRoom) + 'px',
                position: 'relative',
                height: '100%',
              }"
              class="flex-center row q-my-lg"
            >
              <q-avatar
                v-for="(user, index) in chatRoom.users"
                :key="user.id"
                :src="user.avatar_url"
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
            <q-item-section class="q-ml-md flex-start">
              <q-item-label
                class="text-weight-bold text-grey-9 row items-baseline"
              >
                Room Name:
                <div class="text-body2 q-ml-xs">{{ chatRoom.name }}</div>
              </q-item-label>
              <div v-if="chatRoom.last_message">
                <q-item-label
                  class="text-weight-bold text-grey-9 row items-baseline"
                >
                  Last Message From:
                  <div class="text-body2 q-ml-xs">
                    {{ chatRoom.last_message.sender.name }}
                  </div>
                </q-item-label>

                <q-item-label
                  class="text-weight-bold text-grey-9 row items-baseline"
                >
                  Content:
                  <div class="text-body2 q-ml-xs">
                    {{ chatRoom.last_message.content }}
                  </div>
                </q-item-label>

                <q-item-label
                  class="text-weight-bold text-grey-9 row items-baseline"
                >
                  Sent at:
                  <div class="text-body2 q-ml-xs">
                    {{
                      chatRoom.last_message.created_at &&
                      formatTime(chatRoom.last_message.created_at)
                    }}
                  </div>
                </q-item-label>
              </div>
              <q-item-section side v-else class="q-ml-md">
                <q-item-label class="text-grey-8">
                  No messages yet
                </q-item-label>
              </q-item-section>
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </div>
    <div class="col-xs-12 col-sm-12 col-md-8 col-lg-8">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { storeToRefs } from 'pinia';
  import { useRoomStore } from 'src/stores/room-store';
  import { ChatRoom } from 'src/types';
  import { computed, onMounted, ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { useQuasar } from 'quasar';
  import { url } from 'src/helpers';
  import { nextTick } from 'vue';
  import AddChatRoomDialog from './AddChatRoomDialog.vue';
  import UpdateChatRoomDialog from './UpdateChatRoomDialog.vue';

  const { rooms } = storeToRefs(useRoomStore());
  const router = useRouter();
  const avatarContainerWidth = (room: ChatRoom) => {
    if (!room.users) return 0;
    return room.users.length * 50 - (room.users.length - 1) * 25;
  };
  const roomToUpdateId = ref<number>();

  const formatTime = (date: string) => {
    const newDate = new Date(date);
    return (
      newDate.toLocaleTimeString('de-DE', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      }) +
      ' ' +
      newDate.toLocaleDateString('de-DE', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    );
  };

  const $q = useQuasar();
  const scrollAreaStyle = computed(() => {
    console.log($q.screen.width > 600);
    if ($q.screen.width > 1035) {
      return { height: '85vh' };
    } else {
      return { height: '100vh' };
    }
  });

  const goToRoom = async (roomId: number) => {
    router.push(`/rooms/${roomId}/messages`);
  };

  onMounted(async () => {
    await useRoomStore().getRooms();
  });

  const toggleRoomUpdateDialog = async (roomId: number) => {
    // get the room from the store
    roomToUpdateId.value = roomId;
    useRoomStore().toggleRoomUpdateDialog();
  };

  const deleteRoom = async (roomId: number) => {
    // get the room from the store
    await useRoomStore().deleteRoom(roomId);
  };
</script>

<style scoped>
.overlapping {
  border: 2px solid white;
  position: absolute;
}
.chat-room-item {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: start;
}

.round-avatar {
  border-radius: 50%;
  height: 100%;
  width: 100%;
}
</style>
