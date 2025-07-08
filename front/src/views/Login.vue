<template>
  <q-layout view="hHh lpR fFf" class="w-screen">
    <q-header bordered class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title class="flex">
          <router-link class="flex" to="/">
            <img class="w-12 object-contain" src="/yunxi-logo2.png">
            <span class="ml-2">云栖足道</span>
          </router-link>
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="flex justify-center items-center">
        <q-form autofocus greedy @submit.prevent="onSubmit" class="q-pa-md">
          <q-input
            class="w-full"
            filled
            label="Account"
            v-model="account"
            hint="Username or Email"
            lazy-rules
            :rules="[ val => val && val.length > 0 || 'Please input Account']"
            inputmode="email"
          />
          <q-input
            class="w-full"
            label="Password"
            v-model="password"
            filled
            :type="isPwd ? 'password' : 'text'"
            lazy-rules
            :rules="[ val => val && val.length > 0 || 'Please input Password']"
            inputmode="email"
          >
            <template v-slot:append>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwd = !isPwd"
              />
            </template>
          </q-input>

          <q-card-actions align="center">
            <q-btn label="Singin" type="submit" color="primary"/>
            <!-- <q-btn label="Singup" color="secondary" /> -->
          </q-card-actions>
        </q-form>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { useRouter } from 'vue-router';
import { reactive, toRefs, ref, onMounted } from 'vue';
import { post } from '../utils/api.ts';
import { useQuasar } from 'quasar'

export default {
  setup() {
    const router = useRouter();
    const $q = useQuasar();
    const isPwd = ref(true);
    const formData = reactive({
      account: '',
      password: ''
    });

    onMounted(() => {
      $q.cookies.remove('account');
      $q.cookies.remove('account_id')
    });

    const onSubmit = async () => {
      try {
        $q.loading.show();
        const res = await post('login', {
          account: formData.account,
          password: formData.password
        });
        $q.cookies.set('account_id', res.data.data.id);
        $q.cookies.set('account', res.data.data.account);
        $q.notify({
          message: 'Login Success',
          color: 'green',
          timeout: 700
        });
        let timer: number | null = setTimeout(() => {
          $q.loading.hide();
          clearTimeout(timer!);
          timer = null;
          router.replace('/');
        }, 700);
      } catch (err: any) {
        $q.loading.hide();
        $q.notify({
          message: err.c_message,
          color: 'red'
        });
      }
    };

    return {
      onSubmit,
      isPwd,
      ...toRefs(formData)
    }
  }
}
</script>