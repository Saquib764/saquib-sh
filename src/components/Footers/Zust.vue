<template>
  <section class="zust-footer">
    <div class="company">
      <h1 style="color: white; font-family: 'Fredoka One', cursive; font-size: 3em;">zust.ai</h1>
    </div>
    <div class="links">
      <div>
        <h3>Sales and support</h3>
        <span>hello@zust.ai</span>
        <a href="/affiliate">Affiliate program</a>
      </div>
      <div>
        <h3>Product</h3>
        <a href="https://zust.ai">AI Product photography</a>
        <a href="https://photoshift.co">Photoshift</a>
        <a href="https://fashion.zust.ai">Fashion AI</a>
        <a href="https://qr.zust.ai">QR Code AI</a>
      </div>
      <div>
        <h3>Support</h3>
        <a href="https://zust.ai/terms">Terms</a>
        <a href="https://zust.ai/privacy">Privacy</a>
      </div>
    </div>
  </section>
</template>

<script setup>

</script>

<style scoped lang="scss">
.zust-footer {
  width: 100%;
  background-color: #000000;
  margin-top: 50px;
  padding: 50px 10vw;
  text-align: center;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  color: white;
  border-bottom: 1px solid rgb(23, 23, 23);

  &>div {
    display: flex;
    &.company{
      flex: 1;
      margin-bottom: 120px;
    }
    &.links{
      flex: 1;
      display: grid;
      grid-template-columns: 1.5fr 1fr 1fr;
      gap: 20px;
      &>div{
        align-items: flex-start;
        display: flex;
        flex-direction: column;
      }
      h3 {
        text-decoration: underline;
        line-height: 3em;
        font-size: 1.6em;
        margin-bottom: 10px;
      }
      a{
        text-decoration: none;
        text-transform: none;
        color: rgb(187, 187, 187);
        line-height: 2em;
      }
    }
  }
  @media screen and (max-width: 600px) {
    flex-direction: column;
    h1{
      font-size: 4em;
    }
    &>div {
      &.links{
        grid-template-columns: 1fr;
      }
    }
  }
}
</style>

