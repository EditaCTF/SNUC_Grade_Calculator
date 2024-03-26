<script>
    import { onMount } from 'svelte';
    import PocketBase from 'pocketbase';

    let submitDisabled = false;

    const pb = new PocketBase('https://edita.pockethost.io');

    let username = "";
    let email = "";
    let password = "";
    let passwordConfirm = "";
    let year = "";
    let branch = "";

    let loginUsername = "";
    let loginPassword = "";

    let isDisabled = false;
    /**
	 * @param {{ preventDefault: any; }} e
	 */
    async function loginUser(e) {
        e.preventDefault;
        isDisabled = true;
    }
</script>

<h1>SNUC Grade Calculator</h1>
<!--       const handleSubmit = async(e) => {
        document.getElementById('submit').disabled=true;
        console.log(userData);
        try {
          e.preventDefault()
          e.disable = true
            userData.username,
            userData.password
        );
        }
        catch {
          alert("Incorrect credentials!")
          pb.authStore.clear()
          document.getElementById('submit').disabled=false
          return
        }
        finally {
          console.log(pb.authStore.isValid);
          if (pb.authStore.isValid == true) {
            window.location.href = '/profile';
          }
        }

    }
 -->
<h2>Login</h2>
<div>
    <div>
        <label for="loginUsername">Username:</label>
        <input type="text" id="loginUsername" bind:value={loginUsername}>
    </div>

    <div>
        <label for="loginPassword">Password:</label>
        <input type="password" id="loginPassword" bind:value={loginPassword}>
    </div>
    
    <div>
        <button on:click={loginUser} disabled={isDisabled}>
            Login
        </button>
    </div>
</div>
