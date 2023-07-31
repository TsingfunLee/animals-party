<template>
  <div class="w-full h-full flex text-white select-none" />
</template>

<script setup lang="ts">
import { useLoading } from '../composables/use-loading';

const loading = useLoading();

function init() {
  loading.hide();
}
init();