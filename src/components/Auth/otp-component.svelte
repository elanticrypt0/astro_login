<script>
  import { onMount } from 'svelte';
  
  // Props
  export let phoneNumber = '9988776655';
  export let backgroundImage = '/img/background.jpg';
  export let initialTheme = 'light'; // 'light' or 'dark'
  export let redirectUrl = '/dashboard'; // URL para redirigir después de verificación exitosa
  
  // Estado
  let otp = ['', '', '', '', '', ''];
  let inputRefs = [];
  let theme = initialTheme;
  let isLoading = false;
  let responseMessage = null;
  let responseStatus = null;
  
  // Variables de tema
  $: bgColor = theme === 'light' ? 'bg-gray-50' : 'bg-zinc-900';
  $: textColor = theme === 'light' ? 'text-zinc-900' : 'text-zinc-50';
  $: inputBgColor = theme === 'light' ? 'bg-white' : 'bg-zinc-800';
  $: inputBorderColor = theme === 'light' ? 'border-zinc-300' : 'border-zinc-700';
  $: buttonBgColor = theme === 'light' 
    ? 'bg-gradient-to-r from-blue-500 to-indigo-600' 
    : 'bg-gradient-to-r from-indigo-600 to-purple-700';
  
  onMount(() => {
    // Auto-focus en el primer input al cargar
    if (inputRefs[0]) {
      inputRefs[0].focus();
    }
  });
  
  // Manejar cambio en cada entrada OTP
  function handleChange(event, index) {
    const element = event.target;
    if (element.value.length > 1) {
      element.value = element.value[0];
    }
    
    otp[index] = element.value.toUpperCase();
    otp = [...otp]; // Trigger reactivity in Svelte
    
    // Resetear mensajes de respuesta cuando el usuario modifica el OTP
    if (responseMessage) {
      responseMessage = null;
      responseStatus = null;
    }
    
    // Enfocar el siguiente input si hay un valor
    if (element.value !== '' && index < 5 && inputRefs[index + 1]) {
      inputRefs[index + 1].focus();
    }
    
    // Verificar automáticamente si todos los campos están llenos
    if (index === 5 && element.value !== '' && otp.every(digit => digit !== '')) {
      // Esperar un momento antes de enviar para que el usuario vea el último dígito ingresado
      setTimeout(() => {
        verifyOtp(otp);
      }, 300);
    }
  }
  
  // Manejar retroceso
  function handleKeyDown(event, index) {
    if (event.key === 'Backspace' && index > 0 && otp[index] === '' && inputRefs[index - 1]) {
      inputRefs[index - 1].focus();
    }
  }
  
  // Manejar pegado
  function handlePaste(event) {
    event.preventDefault();
    const pasteData = event.clipboardData.getData('text');
    
    if (pasteData.length <= 6) {
      const newOtp = [...otp];
      
      for (let i = 0; i < Math.min(pasteData.length, 6); i++) {
        if (/^[a-zA-Z0-9]$/.test(pasteData[i])) {
          newOtp[i] = pasteData[i].toUpperCase();
        }
      }
      
      otp = newOtp;
      
      // Resetear mensajes de respuesta cuando el usuario modifica el OTP
      if (responseMessage) {
        responseMessage = null;
        responseStatus = null;
      }
      
      if (newOtp[5] !== '' && inputRefs[5]) {
        inputRefs[5].focus();
        
        // Verificar automáticamente si se pegó un código completo
        if (newOtp.every(digit => digit !== '')) {
          setTimeout(() => {
            verifyOtp(newOtp);
          }, 300);
        }
      } else {
        // Enfocar el siguiente campo vacío
        for (let i = 0; i < 6; i++) {
          if (newOtp[i] === '' && inputRefs[i]) {
            inputRefs[i].focus();
            break;
          }
        }
      }
    }
  }
  
  // Función para verificar el OTP
  async function verifyOtp(otpArray) {
    // Evitar verificación si ya está en progreso
    if (isLoading) return;
    
    const otpString = otpArray.join('');
    
    // Validar que el OTP tenga 6 caracteres
    if (otpString.length !== 6) {
      responseStatus = 'error';
      responseMessage = 'Por favor ingresa los 6 caracteres del código OTP';
      return;
    }
    
    isLoading = true;
    responseMessage = null;
    
    try {
      // Simular petición a un servidor con un retraso
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Emular respuesta del servidor (50% probabilidad de éxito/error para demostración)
      const mockResponse = Math.random() > 0.5 
        ? { status: 'ok', message: 'Verificación exitosa. Redirigiendo...' }
        : { status: 'error', message: 'Código OTP inválido o expirado. Por favor intenta nuevamente.' };
      
      // Actualizar estado con la respuesta
      responseStatus = mockResponse.status;
      responseMessage = mockResponse.message;
      
      // Si la verificación fue exitosa, podríamos redirigir al usuario
      if (mockResponse.status === 'ok' && redirectUrl) {
        // En un caso real, redirigir al usuario después de un breve retraso
        setTimeout(() => {
          // window.location.href = redirectUrl;
          // Comentado para demostración
        }, 2000);
      }
    } catch (error) {
      // Manejar errores de la petición
      responseStatus = 'error';
      responseMessage = 'Error de conexión. Por favor intenta más tarde.';
      console.error('Error al verificar OTP:', error);
    } finally {
      isLoading = false;
    }
  }
  
  // Función para reenviar el OTP
  function handleResendOTP() {
    // Simular reenvío de OTP
    responseStatus = 'ok';
    responseMessage = 'Se ha enviado un nuevo código OTP a tu teléfono';
    
    // Limpiar el mensaje después de 3 segundos
    setTimeout(() => {
      if (responseStatus === 'ok') {
        responseMessage = null;
        responseStatus = null;
      }
    }, 3000);
  }
  
  // Alternar tema
  function toggleTheme() {
    theme = theme === 'light' ? 'dark' : 'light';
  }
</script>

<div class="{bgColor} {textColor} min-h-screen flex items-center justify-center transition-colors duration-300 bg-cover bg-center" style="background-image: url({backgroundImage})">
  <div class="max-w-md w-full mx-auto p-6 rounded-xl backdrop-blur-md bg-white/80 dark:bg-blue-500/80 shadow-xl">
    <!-- Tema toggle -->
    <div class="absolute top-4 right-4">
      <button 
        on:click={toggleTheme}
        class="p-2 rounded-full border border-gray-300 dark:border-gray-700"
      >
        {#if theme === 'light'}
          🌙
        {:else}
          ☀️
        {/if}
      </button>
    </div>
    
    <div class="text-center mb-8">
      <div class="flex justify-center mb-6">
        <div class="w-20 h-20 rounded-full flex items-center justify-center {buttonBgColor}">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            class="h-10 w-10 text-white" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="2" 
              d="M5 13l4 4L19 7" 
            />
          </svg>
        </div>
      </div>
      <h2 class="text-2xl font-bold mb-2">Verificación OTP</h2>
      <p class="text-black dark:text-white">
        Ingresa el código OTP enviado al {phoneNumber}
      </p>
    </div>
    
    <!-- Mensaje de respuesta -->
    {#if responseMessage}
      <div class="mb-4 p-3 rounded-lg text-center {responseStatus === 'ok' 
        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}">
        {responseMessage}
      </div>
    {/if}
    
    <div class="mb-8">
      <div class="flex justify-between mb-6">
        {#each otp as digit, index}
          <input
            type="text"
            maxlength="1"
            class="w-12 h-14 text-center text-xl font-bold rounded-md border {inputBorderColor} {inputBgColor} focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 mx-1 transition-all duration-300 transform {digit ? 'scale-105' : 'scale-100'} {responseStatus === 'error' ? 'border-red-500 dark:border-red-400' : ''}"
            value={digit}
            on:input={(e) => handleChange(e, index)}
            on:keydown={(e) => handleKeyDown(e, index)}
            on:paste={handlePaste}
            bind:this={inputRefs[index]}
            pattern="[a-zA-Z0-9]"
            disabled={isLoading}
          />
        {/each}
      </div>
      
      <div class="text-center">
        <p class="text-sm text-black dark:text-white">
          ¿No recibiste el código OTP?{' '}
          <button 
            class="text-indigo-900 dark:text-indigo-200 font-medium hover:underline"
            on:click={handleResendOTP}
            disabled={isLoading}
          >
            Reenviar OTP
          </button>
        </p>
      </div>
    </div>
    
    <button 
      class="w-full py-3 px-4 rounded-xl text-white font-medium {buttonBgColor} hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 relative {isLoading ? 'opacity-80 cursor-not-allowed' : ''}"
      on:click={() => verifyOtp(otp)}
      disabled={isLoading || otp.some(digit => digit === '')}
    >
      {#if isLoading}
        <span class="opacity-0">Verificar OTP</span>
        <div class="absolute inset-0 flex items-center justify-center">
          <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      {:else}
        Verificar OTP
      {/if}
    </button>
  </div>
</div><!-- OTPVerification.svelte -->