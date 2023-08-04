
<template>
  <q-dialog v-model="useRoomStore().showAddRoomDialog">
    <q-card style="min-width: 400px">
      <q-card-section>
        <q-stepper
          v-model="step"
          color="primary"
          done-color="green"
          active-color="red"
          inactive-color="grey-6"
        >
          <q-step
            name="step1"
            title="Create A Room"
            icon="add"
            v-model:done="step1done"
            :defaultOpened="true"
          >
            <q-input v-model="roomName" label="Room Name" class="q-my-md" />

            <q-btn
              :disable="roomName.length < 1"
              color="primary"
              label="Create Room"
              @click="createRoom"
            />
          </q-step>

          <q-step
            :disable="!step1done"
            name="step2"
            title="Add Users"
            v-model:done="step2done"
            :defaultOpened="false"
          >
            <q-select
              use-input
              multiple
              use-chips
              v-model="selectedUsers"
              :options="users"
              option-label="name"
              option-value="id"
              @filter="filterFn"
              class="q-my-dm"
            >
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section side>
                    <q-avatar>
                      <q-img
                        v-if="scope.opt.avatar_url"
                        :src="url(scope.opt.avatar_url)"
                      />

                      <q-icon v-else name="person" />
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ scope.opt.name }}</q-item-label>
                    <q-item-label caption>{{ scope.opt.email }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
            <q-card-actions>
              <q-btn
                label="Cancel"
                @click="useRoomStore().toggleShowAddRoomDialog()"
              />
              <q-btn
                :disable="selectedUsers.length < 1"
                color="primary"
                label="Add Users"
                @click="addUsers"
              />
            </q-card-actions>
          </q-step>
        </q-stepper>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>


<script setup lang="ts">
  import { ref } from 'vue';
  import { useUserStore } from 'src/stores/user-store';
  import { ChatRoom, User } from 'src/types';
  import { useRoomStore } from 'src/stores/room-store';
  import { useQuasar } from 'quasar';
  import { url } from 'src/helpers';
  const $q = useQuasar();
  const users = ref<User[]>([]);
  const selectedUsers = ref<User[]>([]);
  const step = ref('step1');

  const step1done = ref(false);
  const step2done = ref(false);

  const roomName = ref('');

  const newlyCreatedRoom = ref<ChatRoom | null>(null);

  const filterFn = (
    val: string,
    update: (cb: () => void) => void,
    abort: () => void
  ): void => {
    update(() => {
      if (val.length < 3) {
        abort();
        return;
      }

      console.log('SEARCHING USERS');

      useUserStore()
        .searchUsers(val)
        .then((res) => {
          users.value = res;
        });
    });
  };

  const createRoom = async () => {
    try {
      const response = await useRoomStore().createRoom(roomName.value);
      newlyCreatedRoom.value = response.chatroom;
      step1done.value = true;
      step.value = 'step2';
      $q.notify({
        message: 'Room created',
        color: 'positive',
      });
    } catch (err: any) {
      $q.notify({
        message: err.response.data.message,
        color: 'negative',
      });
    }
  };

  const addUsers = async () => {
    try {
      console.log('ADD users');
      const response = await useRoomStore().addUsersToRoom(
        newlyCreatedRoom.value!.id,
        selectedUsers.value.map((user) => user.id)
      );

      const isMultipleUsers = selectedUsers.value.length > 1;
      $q.notify({
        message: isMultipleUsers ? 'Users added to room' : 'User added to room',
        color: 'positive',
      });
      selectedUsers.value = [];
      newlyCreatedRoom.value = null;
      step1done.value = false;
      step2done.value = false;
      step.value = 'step1';
      roomName.value = '';
      useRoomStore().toggleShowAddRoomDialog();
    } catch (err: any) {
      $q.notify({
        message: err.response.data.message,
        color: 'negative',
      });
      useRoomStore().toggleShowAddRoomDialog();
    }
  };
</script>
