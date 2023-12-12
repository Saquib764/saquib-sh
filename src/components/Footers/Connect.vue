<template>
  <div class="connect-container">
    <a class="twitter-share-button" target="_blank"
      href="https://twitter.com/intent/tweet?text=I use https://saquib.sh/tools/ai-blog-writer to write blogs in minutes! And its completely free and open. @saquiboye">
      <img src="https://img.shields.io/twitter/url?url=https://saquib.sh/tools/ai-blog-writer" />
    </a>
    <span>Feedback/suggestion <a href="https://twitter.com/saquiboye" target="_blank">@saquiboye</a></span>
  </div>
</template>

<style scoped lang="scss">
.connect-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  background: rgba(0,0,0,0.1);
  padding: 15px;
  border-radius: 5px;

  a {
    font-weight: bold;
  }

  @media screen and (max-width: 768px) {
    position: relative;
    bottom: unset;
    right: unset;
    margin-bottom: 20px;
    background: rgba(0,0,0,0.85);
    color: white;
    a {
      color: white;
    }
  }
}
</style>
