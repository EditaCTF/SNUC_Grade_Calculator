<script lang="ts">
    import PocketBase from 'pocketbase';

    const pb = new PocketBase('https://edita.pockethost.io');

    let loginUsername = "";
    let loginPassword = "";
    let isDisabled = false;

    async function loginUser(e : any) {
      isDisabled = true;
        const data = {
            username: loginUsername,
            password: loginPassword
        };
        try {
          const authData = await pb.collection('user_details').authWithPassword(
            data.username,
            data.password
          );
        }
        catch {
          e.disabled = false;
          alert("Incorrect credentials!")
          pb.authStore.clear()
          return
        }
        finally {
          console.log(pb.authStore.isValid);
          if (pb.authStore.isValid == true) {
            console.log("Login Successful")     
            window.location.href = "/dashboard"     
          }
        }
    }
</script>

<h2>Login</h2>

<form>
    <div>
        <label for="loginUsername">Username:</label>
        <input type="text" id="loginUsername" bind:value={loginUsername}>
    </div>

    <div>
        <label for="loginPassword">Password:</label>
        <input type="password" id="loginPassword" bind:value={loginPassword}>
    </div>
    <div>
        <input type="submit" on:click={loginUser} disabled={isDisabled}>
      </div>
</form>
