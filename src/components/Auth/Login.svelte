<script>
  import { createEventDispatcher } from 'svelte';
  import Remote from '@/config/remote';
  
  export let backgroundImage = '';
  let email = '';
  let loading = false;
  let error = '';
  let otpSent = false;
  let otp = ['', '', '', '', '', ''];
  let inputRefs = Array(6);
  
  const dispatch = createEventDispatcher();
  const serverURL = Remote.url
  // dummy email
  email = "guest@token.pass"
  
  async function requestOTP() {
    if (!email) {
      error = 'El email es obligatorio';
      return;
    }
    
    loading = true;
    error = '';
    
    try {
      const response = await fetch(serverURL+'/auth/login/guest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al solicitar OTP');
      }
      
      otpSent = true;
      
      // Focus en el primer input después de una pequeña espera
      setTimeout(() => {
        if (inputRefs[0]) inputRefs[0].focus();
      }, 100);
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }
  
  function handleInput(index, event) {
    const value = event.target.value;
    
    // Eliminar caracteres no alfanuméricos
    const sanitizedValue = value.replace(/[^a-zA-Z0-9]/g, '');
    
    // Actualizar el valor en el array
    otp[index] = sanitizedValue.slice(-1);
    
    // Mover al siguiente input si no es el último y hay un valor
    if (index < 5 && sanitizedValue) {
      inputRefs[index + 1].focus();
    }
    
    // Si es un paste con múltiples caracteres, distribuir entre los inputs
    if (value.length > 1) {
      const chars = value.split('');
      for (let i = 0; i < Math.min(chars.length, 6 - index); i++) {
        if (i + index < 6) {
          otp[i + index] = chars[i];
          // Actualizar visualmente los inputs
          inputRefs[i + index].value = chars[i];
        }
      }
      // Mover al último input lleno o al final
      const nextEmptyIndex = otp.findIndex((val, idx) => idx >= index && !val);
      if (nextEmptyIndex !== -1 && nextEmptyIndex < 6) {
        inputRefs[nextEmptyIndex].focus();
      } else if (otp[5]) {
        inputRefs[5].focus();
      }
    }
  }
  
  function handleKeyDown(index, event) {
    // Si presiona backspace y está vacío, volver al anterior
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].focus();
    }
  }
  
  async function verifyOTP() {
    const otpString = otp.join('').toUpperCase();
    
    if (otpString.length !== 6) {
      error = 'Introduce el código OTP completo';
      return;
    }
    
    loading = true;
    error = '';

    // agrega el guion en el medio
    const otpFinal = otpString.slice(0,3) + "-" + otpString.slice(3);
    
    try {
      const response = await fetch(serverURL+'/auth/login/guest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, token: otpFinal })
      });
      
      const data = await response.json();
      
      console.log(data);

      if (!response.ok) {
        throw new Error(data.message || 'Código OTP inválido');
      }
      
      // Guardar el JWT en localStorage
      localStorage.setItem('authToken', data.token);
      
      // Notificar al componente padre que el login fue exitoso
      dispatch('login', { token: data.token });
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }
  
  function resendOTP() {
    requestOTP();
  }
</script>

<div class="fixed inset-0 flex items-center justify-center bg-zinc-900 {backgroundImage ? 'bg-cover bg-center' : ''}" 
     style={backgroundImage ? `background-image: url(${backgroundImage})` : ''}>
  <div class="w-full max-w-md p-6 bg-blue-600 rounded-lg shadow-lg text-white">
    <div class="flex justify-center mb-4">
      <div class="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-600 to-purple-700 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
      </div>
    </div>
    
    <h2 class="text-2xl font-bold mb-4 text-center">Verificación OTP</h2>
    
    {#if error}
      <div class="bg-red-800 text-white px-4 py-3 rounded relative mb-4">
        {error}
      </div>
    {/if}
    
    {#if !otpSent}
      <form on:submit|preventDefault={requestOTP} class="space-y-4">
        <div>
          <label for="email" class="block text-sm font-medium text-white mb-1">Email</label>
          <input
            type="email"
            id="email"
            bind:value={email}
            class="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="tu@email.com"
            required
          />
        </div>
        
        <button
          type="submit"
          class="w-full bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-3 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Enviando...' : 'Solicitar código'}
        </button>
      </form>
    {:else}
      <p class="text-sm text-white mb-4 text-center">Ingresa el código OTP enviado al {email}</p>
      
      <div class="flex justify-center space-x-2 mb-4">
        {#each Array(6) as _, i}
          <input
            type="text"
            bind:this={inputRefs[i]}
            value={otp[i]}
            on:input={(e) => handleInput(i, e)}
            on:keydown={(e) => handleKeyDown(i, e)}
            class="w-12 h-12 bg-zinc-800 border-2 border-zinc-700 text-white text-center text-xl rounded-md focus:outline-none focus:border-purple-500"
            maxlength="1"
          />
        {/each}
      </div>
      
      <p class="text-sm text-white mb-4 text-center">
        ¿No recibiste el código OTP? 
        <button 
          class="text-purple-300 underline hover:text-purple-200"
          on:click={resendOTP}
        >
          Reenviar OTP
        </button>
      </p>
      
      <button
        on:click={verifyOTP}
        class="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Verificando...' : 'Verificar OTP'}
      </button>
    {/if}
    
    <!-- <div class="absolute top-4 right-4">
      <div class="w-8 h-8 bg-zinc-800 border border-zinc-700 rounded-full flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd" />
        </svg>
      </div>
    </div> -->
  </div>
</div>