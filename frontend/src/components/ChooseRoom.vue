<template>
  <div class="text-h3 text-dark flex-center row" style="height: 100%">
    {{ useRoomStore().rooms.length === 0 ? 'Create a room!' : 'Join a room' }}
  </div>
</template>

<script setup lang="ts">
  import { useRoomStore } from 'src/stores/room-store';
</script>
