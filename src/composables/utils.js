
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


export function fitOnCanvas(canvas, object, mode='cover') {
  const {width, height} = canvas
  const {width: w, height: h} = object
  const scale = mode == 'cover' ? Math.max(width/w, height/h) : Math.min(width/w, height/h)
  console.log('scale', scale, canvas, object)
  return {
    scaleX: scale,
    scaleY: scale,
    width: w * scale,
    height: h * scale,
  }
}