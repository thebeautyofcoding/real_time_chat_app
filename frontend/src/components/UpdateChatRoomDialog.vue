
<template>
  <q-dialog v-model="useRoomStore().showUpadateRoomDialog" v-if="roomToUpdate">
    <q-card style="min-width: 400px">
      <q-card-section>
        <div class="text-h6 text-dark">Update Room</div>
        <q-input
          v-model="roomToUpdate.name"
          label="Room Name"
          outlined
          class="q-my-md"
        />
        <q-select
          use-input
          multiple
          use-chips
          v-model="roomToUpdate.users"
          :options="users"
          option-label="name"
          option-value="id"
          @filter="filterFn"
          class="q-my-md"
        >
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section side>
                <q-avatar>
                  <q-img
                    v-if="scope.opt.avatar_url"
                    :src="scope.opt.avatar_url"
                  />
                  <q-icon v-else name="person" color="primary" size="2rem" />
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
            @click="useRoomStore().toggleRoomUpdateDialog()"
          />
          <q-btn
            :disable="roomToUpdate.name.length < 1"
            color="primary"
            label="Update Room"
            @click="updateRoom"
          />
        </q-card-actions>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>




<script setup lang="ts">
  import { useRoomStore } from 'src/stores/room-store';

  import { ref } from 'vue';
  import { storeToRefs } from 'pinia';
  import { useUserStore } from 'src/stores/user-store';
  import { User } from 'src/types';
  import { useQuasar } from 'quasar';

  const $q = useQuasar();
  // define props
  const props = defineProps<{
    roomToUpdateId: number;
  }>();

  const roomToUpdate = storeToRefs(useRoomStore()).rooms.value.find(
    (room) => room.id === props.roomToUpdateId
  );
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

      //// implement search
      useUserStore()
        .searchUsers(val)
        .then((response) => {
          users.value = response;
        });
    });
  };

  const updateRoom = async () => {
    if (roomToUpdate !== undefined) {
      try {
        await useRoomStore().updateRoom(roomToUpdate);
        useRoomStore().toggleRoomUpdateDialog();
        $q.notify({
          message: 'Room Updated',
          type: 'positive',
        });
      } catch (error) {
        useRoomStore().toggleRoomUpdateDialog();
        $q.notify({
          message: 'Room Update Failed',
          type: 'negative',
        });
      }
    }
  };

  const users = ref<User[]>([]);
</script>
