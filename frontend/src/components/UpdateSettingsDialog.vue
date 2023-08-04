
<template>
  <q-dialog v-model="useUserStore().showUpdateSettingsDialog">
    <q-card>
      <q-card-section>
        <div class="text-h6">Update Profile</div>

        <div>
          <q-uploader
            :factory="factoryFn"
            class="q-mt-md"
            flat
            outlined
            accept="image/*"
            color="primary"
            v-model="imageUrl"
            label="Select your avatar"
            @uploaded="updateAvatarUrlInStore"
            :auto-upload="true"
          />
        </div>
        <q-input outlined v-model="user.name" label="Username" />

        <q-card-actions>
          <q-btn
            flat
            label="Cancel"
            @click="useUserStore().toggleUpdateSettingsDialog()"
          />
          <q-btn label="Update" color="primary" @click="updateName" />
        </q-card-actions>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
  import { useUserStore } from 'src/stores/user-store';
  import { storeToRefs } from 'pinia';
  import { QUploaderFactoryFn } from 'quasar';

  import { ref } from 'vue';
  import { url } from 'src/helpers';

  let username = ref(''); // Initial username
  let imageUrl = ref<string | null>(null); // Initial image url
  const { user } = storeToRefs(useUserStore());

  const updateName = () => {
    useUserStore().updateName(user.value.name);
    useUserStore().toggleUpdateSettingsDialog();
  };
  const updateAvatarUrlInStore = ({ xhr }: { xhr: XMLHttpRequest }) => {
    const user = JSON.parse(xhr.response).user;
    useUserStore().updateUser(user);
  };

  const factoryFn: QUploaderFactoryFn = (files) => {
    return new Promise((resolve, reject) => {
      resolve({
        url: url('/api/settings/avatar'),
        headers: [
          {
            name: 'Authorization',
            value: `Bearer ${localStorage.getItem('token')}`,
          },
        ],
        fieldName: 'avatar',
      });
      reject((err: any) => console.log(err));
    });
  };
</script>
