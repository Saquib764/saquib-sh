
export const scrollTo = (id) => {
  const element = document.getElementById(id)
  if(element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
    })
  }
}

export const toFirestoreUrl = (url) => {
  if(!url) return ''
  if(url.indexOf('https://') > -1) {
    return url
  }
  return `https://firebasestorage.googleapis.com/v0/b/saquib-sh.appspot.com/o/${encodeURIComponent(url)}?alt=media`
}
