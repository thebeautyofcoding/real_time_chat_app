<template>
  <q-layout>
    <UpdateSettingsDialog />
    <div class="layout-view">
      <div
        class="sidebar col justify-between items-between shadow-2 text-grey-8"
        v-show="$q.screen.gt.md"
        style="height: 100%; max-width: 200px"
      >
        <div style="height: 80%">
          <q-tabs
            vertical
            dense
            active-color="primary"
            indicator-color="primary"
            class="q-mt-lg"
          >
            <q-route-tab
              v-for="link in links"
              :key="link.title"
              :to="link.link"
              :label="link.title"
              :icon="link.icon"
            />
            <q-tab
              class="text-grey-9"
              :label="userName ? 'Logout' : 'Login'"
              :icon="userName ? 'logout' : 'login'"
              caption="Login or Logout"
              @click="handleAction"
            />
          </q-tabs>
        </div>
        <div
          align="center"
          class="cursor-pointer"
          @click="() => useUserStore().toggleUpdateSettingsDialog()"
        >
          <q-avatar class="q-ma-md">
            <q-icon v-if="!user.avatar_url" name="person" />

            <q-img class="round-avatar" v-else :src="url(user.avatar_url)" />
          </q-avatar>
        </div>
      </div>
      <!-- navigation for mobile -->

      <q-footer v-show="$q.screen.lt.md" class="fixed-bottom" elevated>
        <q-tabs
          dense
          active-color="primary"
          indicator-color="primary"
          class="bg-grey-3 text-grey-8"
        >
          <q-route-tab
            v-for="link in links"
            :key="link.title"
            :to="link.link"
            :label="link.title"
            :icon="link.icon"
          />

          <q-tab
            class="cursor-pointer"
            @click="useUserStore().toggleUpdateSettingsDialog()"
          >
            <q-avatar class="q-ma-md" :text="userName">
              <q-icon v-if="!user.avatar_url" name="person" />
              <q-img class="round-avatar" v-else :src="url(user.avatar_url)" />
            </q-avatar>
          </q-tab>

          <q-tab
            class="text-grey-9"
            :label="userName ? 'Logout' : 'Login'"
            :icon="userName ? 'logout' : 'login'"
            caption="Login or Logout"
            @click="handleAction"
          />
        </q-tabs>
      </q-footer>

      <q-page-container class="main-content">
        <router-view />
      </q-page-container>
    </div>
  </q-layout>
</template>

<script setup lang="ts">
  import { storeToRefs } from 'pinia';
  import { useUserStore } from 'src/stores/user-store';
  import { computed } from 'vue';
  import { useRouter } from 'vue-router';
  import UpdateChatRoomDialog from 'src/components/UpdateChatRoomDialog.vue';
  import UpdateSettingsDialog from 'src/components/UpdateSettingsDialog.vue';
  const router = useRouter();
  const { user } = storeToRefs(useUserStore());
  const userName = computed(() => user.value?.name);
  import { url } from 'src/helpers';

  const handleAction = async () => {
    if (userName.value !== undefined) {
      await useUserStore().logout();
      await router.push('/guest/login');
    } else {
      await router.push('/guest/login');
    }
  };
  const links = [
    {
      title: 'Chatrooms',
      caption: 'Create a chatroom',
      icon: 'people',
      link: '/rooms',
    },
  ];
</script>

<style scoped>
.layout-view {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 200px;
}
.round-avatar {
  width: 100%;
  height: 100%;
}

.main-content {
  flex-grow: 1;
}
.fixed-bottom {
  position: fixed;
  bottom: 0;
  width: 100%;
}
.round-avatar {
  border-radius: 50%;
  height: 100%;
  width: 100%;
}
</style>
